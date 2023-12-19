// forked from https://github.com/MetaMask/KeyringController/blob/main/src/KeyringController.ts

import { KeyringServiceError } from "./consts";
import { AddressUserToSignInput, Hex, Json, PublicKeyUserToSignInput, SendTDC, SignPsbtOptions, ToSignInput } from "./types";
import { storageService } from "@/background/services";
import { Psbt, networks, Transaction, address as PsbtAddress } from "belcoinjs-lib";
import { getScriptForAddress } from "@/shared/utils/transactions";
import { createSendBTC } from "@unisat/ord-utils";
import { SimpleKey, HDPrivateKey, AddressType } from "bellhdw";
import HDSimpleKey from "bellhdw/src/hd/simple";
import { Keyring } from "bellhdw/src/hd/types";

export const KEYRING_SDK_TYPES = {
  SimpleKey,
  HDPrivateKey,
};

class KeyringService {
  keyrings: Keyring<Json>[];

  constructor() {
    this.keyrings = [];
  }

  async init(password: string) {
    const wallets = await storageService.importWallets(password);
    for (const i of wallets) {
      let wallet: HDPrivateKey | SimpleKey;
      if (i.data.seed) {
        wallet = HDPrivateKey.deserialize(i.data);
        if (i.accounts.length > 1) {
          wallet.addAccounts(i.accounts.length - 1);
        }
      } else {
        wallet = HDSimpleKey.deserialize(i.data) as any as HDSimpleKey;
      }
      this.keyrings[i.id] = wallet;
    }

    return wallets;
  }

  async newKeyring(
    type: "simple" | "root",
    payload: string,
    addressType: AddressType = AddressType.P2PKH
  ) {
    let keyring: HDPrivateKey | HDSimpleKey;
    if (type === "root") {
      keyring = await HDPrivateKey.fromMnemonic(payload);
    } else {
      keyring = HDSimpleKey.deserialize({
        privateKey: payload,
        addressType: addressType,
      });
    }
    keyring.addressType =
      typeof addressType === "number" ? addressType : AddressType.P2PKH;
    console.log()
    this.keyrings.push(keyring);
    return keyring.getAddress(keyring.publicKey);
  }

  exportAccount(address: Hex) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (!keyring.exportAccount) {
      throw new Error(KeyringServiceError.UnsupportedExportAccount);
    }

    return keyring.exportAccount(address);
  }

  getAccounts(address: Hex) {
    for (const i of this.keyrings) {
      const accounts = i.getAccounts();
      if (accounts.includes(address)) {
        return accounts;
      }
    }
    throw new Error("Account not found");
  }

  getKeyringByIndex(index: number) {
    if (index + 1 > this.keyrings.length) {
      throw new Error("Invalid keyring index");
    }
    return this.keyrings[index];
  }

  serializeById(index: number): any {
    return this.keyrings[index].serialize();
  }

  signPsbt(psbt: Psbt) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    keyring.signPsbt(psbt, this.formatOptionsToSignInputs(psbt))
  }

  signTransaction(psbt: Psbt) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    keyring.signPsbt(
      psbt,
      this.formatOptionsToSignInputs(psbt)
    );
  }

  private formatOptionsToSignInputs(_psbt: string | Psbt, options?: SignPsbtOptions) {
    const account = storageService.currentAccount;
    const pubKey = this.exportPublicKey(account.address);
    if (!account) throw null;

    let toSignInputs: ToSignInput[] = [];
    if (options && options.toSignInputs) {
      // We expect userToSignInputs objects to be similar to ToSignInput interface,
      // but we allow address to be specified in addition to publicKey for convenience.
      toSignInputs = options.toSignInputs.map((input) => {
        const index = Number(input.index);
        if (isNaN(index)) throw new Error('invalid index in toSignInput');

        if (!(input as AddressUserToSignInput).address && !(input as PublicKeyUserToSignInput).publicKey) {
          throw new Error('no address or public key in toSignInput');
        }

        if ((input as AddressUserToSignInput).address && (input as AddressUserToSignInput).address != account.address) {
          throw new Error('invalid address in toSignInput');
        }

        if (
          (input as PublicKeyUserToSignInput).publicKey &&
          (input as PublicKeyUserToSignInput).publicKey != pubKey
        ) {
          throw new Error('invalid public key in toSignInput');
        }

        const sighashTypes = input.sighashTypes?.map(Number);
        if (sighashTypes?.some(isNaN)) throw new Error('invalid sighash type in toSignInput');

        return {
          index,
          publicKey: pubKey,
          sighashTypes,
          disableTweakSigner: input.disableTweakSigner
        };
      });
    } else {
      const psbt =
        typeof _psbt === 'string'
          ? Psbt.fromHex(_psbt as string, { network: networks.bitcoin })
          : (_psbt as Psbt);
      psbt.data.inputs.forEach((v, index) => {
        let script: any = null;
        let value = 0;
        if (v.witnessUtxo) {
          script = v.witnessUtxo.script;
          value = v.witnessUtxo.value;
        } else if (v.nonWitnessUtxo) {
          const tx = Transaction.fromBuffer(v.nonWitnessUtxo);
          const output = tx.outs[psbt.txInputs[index].index];
          script = output.script;
          value = output.value;
        }
        const isSigned = v.finalScriptSig || v.finalScriptWitness;
        if (script && !isSigned) {
          const address = PsbtAddress.fromOutputScript(script, networks.bitcoin);
          if (account.address === address) {
            toSignInputs.push({
              index,
              publicKey: pubKey,
              sighashTypes: v.sighashType ? [v.sighashType] : undefined
            });
          }
        }
      });
    }
    return toSignInputs;
  }


  signMessage(msgParams: { from: string; data: string }) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    const randomSeed = crypto.getRandomValues(new Uint8Array(48));
    return keyring.signMessage(msgParams.from, msgParams.data, randomSeed);
  }

  signPersonalMessage(msgParams: { from: string; data: string }) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (!keyring.signPersonalMessage) {
      throw new Error(KeyringServiceError.UnsupportedSignPersonalMessage);
    }

    const randomSeed = crypto.getRandomValues(new Uint8Array(48));

    return keyring.signPersonalMessage(
      msgParams.from,
      msgParams.data,
      randomSeed
    );
  }

  private async _signTransactionMultisig() {
    throw new Error("Unimplemented");

    // TODO It's a base to develop multisign wallets
    // const keyring = await this.getKeyringByIndex("");
    // const addresses = await keyring.getAccounts();
    // const utxos = (await Promise.all(addresses.map(apiController.getUtxos)))
    //   .filter((i) => i !== undefined)
    //   .reduce((prev, cur) => prev?.concat(...(cur ?? [])), []) as ApiUTXO[];
  }

  exportPublicKey(address: Hex) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.exportPublicKey(address);
  }

  async sendTDC(data: SendTDC) {
    const account = storageService.currentAccount;
    const wallet = storageService.currentWallet;
    if (!account || !account.address)
      throw new Error("Error when trying to get the current account");

    const publicKey = this.exportPublicKey(account.address);

    const psbt = await createSendBTC({
      utxos: data.utxos.map((v) => {
        return {
          txId: v.txid,
          outputIndex: v.vout,
          satoshis: v.value,
          scriptPk: getScriptForAddress(
            Buffer.from(publicKey, "hex"),
            wallet.addressType
          ).toString("hex"),
          addressType: wallet?.addressType,
          address: account.address,
          ords: [],
        };
      }),
      toAddress: data.to,
      toAmount: data.amount,
      wallet: this,
      network: networks.bitcoin,
      changeAddress: account.address,
      receiverToPayFee: data.receiverToPayFee,
      pubkey: this.exportPublicKey(account.address),
      feeRate: data.feeRate,
      enableRBF: false,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore We are really dont know what is it but we still copy working code
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
    return psbt.toHex();
  }

  changeAddressType(index: number, addressType: AddressType): string[] {
    this.keyrings[index].addressType = addressType;
    return this.keyrings[index].getAccounts();
  }

  async deleteWallet(id: number) {
    let wallets = storageService.walletState.wallets.filter((i) => i.id !== id);
    await storageService.saveWallets({
      password: storageService.appState.password,
      wallets,
    });
    this.keyrings.splice(id, 1);
    wallets = wallets.map((f, i) => ({ ...f, id: i }));
    return wallets;
  }
}

export default new KeyringService();
