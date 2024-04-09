import { KeyringServiceError } from "./consts";
import type { Hex, Json, SendBEL, SendOrd, UserToSignInput } from "./types";
import { storageService } from "@/background/services";
import { Psbt } from "belcoinjs-lib";
import { networks } from "belcoinjs-lib";
import { getScriptForAddress } from "@/shared/utils/transactions";
import {
  createMultisendOrd,
  createSendBEL,
  createSendOrd,
} from "bel-ord-utils";
import { SimpleKey, HDPrivateKey, AddressType } from "bellhdw";
import HDSimpleKey from "bellhdw/src/hd/simple";
import type { Keyring } from "bellhdw/src/hd/types";
import { INewWalletProps } from "@/shared/interfaces";
import { ApiOrdUTXO } from "@/shared/interfaces/inscriptions";
import { ApiUTXO } from "bells-inscriber/lib/types";

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
        wallet = HDPrivateKey.deserialize({
          ...i.data,
          hideRoot: i.hideRoot,
          addressType: i.data.addressType ?? i.addressType,
        });
      } else {
        wallet = HDSimpleKey.deserialize(i.data) as any as HDSimpleKey;
      }
      this.keyrings[i.id] = wallet;
    }

    return wallets;
  }

  async newKeyring({
    walletType,
    payload,
    addressType = AddressType.P2PKH,
    hideRoot,
    restoreFrom,
    hdPath,
    passphrase = undefined,
  }: INewWalletProps) {
    let keyring: HDPrivateKey | HDSimpleKey;
    if (walletType === "root") {
      keyring = await HDPrivateKey.fromMnemonic({
        mnemonic: payload,
        hideRoot,
        addressType,
        hdPath,
        passphrase,
      });
    } else {
      keyring = HDSimpleKey.deserialize({
        privateKey: payload,
        addressType,
        isHex: restoreFrom === "hex",
      });
    }
    keyring.addressType =
      typeof addressType === "number" ? addressType : AddressType.P2PKH;
    this.keyrings.push(keyring);
    if (!keyring.getAccounts().length)
      return (keyring as HDPrivateKey).addAccounts(1)[0];
    return keyring.getAccounts()[0];
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
    const publicKey = this.exportPublicKey(
      storageService.currentAccount.address
    );
    keyring.signPsbt(
      psbt,
      psbt.data.inputs.map((v, index) => ({
        index,
        publicKey,
        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
      }))
    );
  }

  signAllPsbtInputs(psbt: Psbt) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.signAllInputsInPsbt(
      psbt,
      storageService.currentAccount.address
    ).signatures;
  }

  signMessage(msgParams: { from: string; data: string }) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.signMessage(msgParams.from, msgParams.data);
  }

  signPersonalMessage(msgParams: { from: string; data: string }) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (!keyring.signPersonalMessage) {
      throw new Error(KeyringServiceError.UnsupportedSignPersonalMessage);
    }

    return keyring.signPersonalMessage(msgParams.from, msgParams.data);
  }

  exportPublicKey(address: Hex) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.exportPublicKey(address);
  }

  async sendBEL(data: SendBEL) {
    const account = storageService.currentAccount;
    const wallet = storageService.currentWallet;
    if (!account || !account.address)
      throw new Error("Error when trying to get the current account");

    const publicKey = this.exportPublicKey(account.address);

    const psbt = await createSendBEL({
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
      signTransaction: this.signPsbt.bind(this),
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

  async sendOrd(data: Omit<SendOrd, "amount">) {
    const account = storageService.currentAccount;
    const wallet = storageService.currentWallet;
    if (!account || !account.address)
      throw new Error("Error when trying to get the current account");

    const publicKey = this.exportPublicKey(account.address);

    const psbt = await createSendOrd({
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
          ords: (v as ApiOrdUTXO & { isOrd: boolean }).isOrd
            ? [
                {
                  id: `${(v as ApiOrdUTXO).inscription_id}`,
                  offset: (v as ApiOrdUTXO).offset,
                },
              ]
            : [],
        };
      }),
      toAddress: data.to,
      outputValue: data.utxos.find(
        (i) => (i as ApiOrdUTXO & { isOrd: boolean }).isOrd
      )?.value,
      signTransaction: this.signPsbt.bind(this),
      network: networks.bitcoin,
      changeAddress: account.address,
      pubkey: this.exportPublicKey(account.address),
      feeRate: data.feeRate,
      enableRBF: false,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore We are really dont know what is it but we still copy working code
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
    return psbt.toHex();
  }

  async sendMultiOrd(
    toAddress: string,
    feeRate: number,
    ordUtxos: ApiOrdUTXO[],
    utxos: ApiUTXO[]
  ) {
    return await createMultisendOrd({
      changeAddress: storageService.currentAccount.address,
      feeRate,
      signPsbtHex: async (psbtHex: string) => {
        const psbt = Psbt.fromHex(psbtHex);
        this.signAllPsbtInputs(psbt);
        return psbt.toHex();
      },
      toAddress,
      utxos: [
        ...utxos.map((f) => ({
          txId: f.txid,
          satoshis: f.value,
          rawHex: f.rawHex,
          outputIndex: f.vout,
          ords: [],
        })),
        ...ordUtxos.map((f) => ({
          txId: f.txid,
          satoshis: f.value,
          rawHex: f.rawHex,
          outputIndex: f.vout,
          ords: [
            {
              id: f.inscription_id,
              offset: f.offset,
            },
          ],
        })),
      ],
    });
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

  async toogleRootAcc() {
    const currentWallet = storageService.currentWallet.id;
    this.keyrings[currentWallet].toggleHideRoot();
  }

  async signPsbtWithoutFinalizing(psbt: Psbt, inputs?: UserToSignInput[]) {
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (inputs === undefined)
      inputs = psbt.txInputs.map((f, i) => ({
        publicKey: this.exportPublicKey(storageService.currentAccount.address),
        index: i,
        sighashTypes: undefined,
      }));
    try {
      keyring.signInputsWithoutFinalizing(
        psbt,
        inputs.map((f) => ({
          index: f.index,
          publicKey:
            (f as any).publicKey !== undefined
              ? (f as any).publicKey
              : this.exportPublicKey((f as any).address),
          sighashTypes: f.sighashTypes,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  }

  verifyMessage(message: string, signatureHex: string) {
    const keyring = this.getKeyringByIndex(storageService.currentAccount.id);
    return keyring.verifyMessage(
      storageService.currentAccount.address,
      message,
      signatureHex
    );
  }
}

export default new KeyringService();
