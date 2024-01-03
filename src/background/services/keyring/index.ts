// forked from https://github.com/MetaMask/KeyringController/blob/main/src/KeyringController.ts

import { KeyringServiceError } from "./consts";
import { Hex, Json, SendTDC } from "./types";
import { storageService } from "@/background/services";
import { Psbt, networks } from "belcoinjs-lib";
import { getScriptForAddress } from "@/shared/utils/transactions";
import { createSendBEL } from "bel-ord-utils";
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

  async sendTDC(data: SendTDC) {
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
