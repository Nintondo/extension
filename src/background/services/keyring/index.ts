import { KeyringServiceError } from "./consts";
import type { Hex, Json, SendBEL, SendOrd, UserToSignInput } from "./types";
import { storageService } from "@/background/services";
import { Network, payments, Psbt } from "belcoinjs-lib";
import { getScriptForAddress, toXOnly } from "@/shared/utils/transactions";
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
import { ApiUTXO } from "@/shared/interfaces/api";

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
    const { wallets, network } = await storageService.importWallets(password);
    for (const i of wallets) {
      const params = {
        addressType:
          i.data.addressType === undefined ? i.data.addressType : i.addressType,
        network,
      };

      let wallet: HDPrivateKey | SimpleKey;
      if (i.data.seed) {
        wallet = HDPrivateKey.deserialize({
          ...i.data,
          hideRoot: i.hideRoot,
          ...params,
        });
      } else {
        wallet = HDSimpleKey.deserialize({
          ...i.data,
          ...params,
        }) as unknown as HDSimpleKey;
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
    passphrase,
    network,
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
    keyring.setNetwork(network);
    this.keyrings.push(keyring);
    if (!keyring.getAccounts().length)
      return (keyring as HDPrivateKey).addAccounts(1)[0];
    return keyring.getAccounts()[0];
  }

  exportAccount(address: Hex) {
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
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
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
    if (storageService.currentAccount?.address === undefined)
      throw new Error("Internal error: Current account is not defined");
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    const publicKey = this.exportPublicKey(
      storageService.currentAccount.address
    );

    psbt.data.inputs.forEach((v) => {
      const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness);
      const isP2TR =
        keyring.addressType === AddressType.P2TR ||
        keyring.addressType === AddressType.M44_P2TR;
      const lostInternalPubkey = !v.tapInternalKey;
      // Special measures taken for compatibility with certain applications.
      if (isNotSigned && isP2TR && lostInternalPubkey) {
        const tapInternalKey = toXOnly(
          Buffer.from(
            this.exportPublicKey(storageService.currentAccount!.address!),
            "hex"
          )
        );
        const { output } = payments.p2tr({
          internalPubkey: tapInternalKey,
          network: storageService.appState.network,
        });
        if (v.witnessUtxo?.script.toString("hex") == output?.toString("hex")) {
          v.tapInternalKey = tapInternalKey;
        }
      }
    });

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
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
    if (storageService.currentAccount?.address === undefined)
      throw new Error("Internal error: Current account is not defined");
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.signAllInputsInPsbt(
      psbt,
      storageService.currentAccount.address
    ).signatures;
  }

  signMessage(msgParams: { from: string; data: string }) {
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.signMessage(msgParams.from, msgParams.data);
  }

  signPersonalMessage(msgParams: { from: string; data: string }) {
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (!keyring.signPersonalMessage) {
      throw new Error(KeyringServiceError.UnsupportedSignPersonalMessage);
    }

    return keyring.signPersonalMessage(msgParams.from, msgParams.data);
  }

  exportPublicKey(address: Hex) {
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Internal error: Current wallet is not defined");
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    return keyring.exportPublicKey(address);
  }

  async sendBEL(data: SendBEL) {
    const account = storageService.currentAccount;
    const wallet = storageService.currentWallet;
    if (!account?.address || !wallet)
      throw new Error(
        "Error when trying to get the current account or current account address or wallet"
      );

    const publicKey = this.exportPublicKey(account.address);

    const scriptPk = getScriptForAddress(
      Buffer.from(publicKey, "hex") as unknown as Uint8Array,
      wallet.addressType
    );
    if (!scriptPk)
      throw new Error("Internal error: Failed to get script for address");

    const psbt = await createSendBEL({
      utxos: data.utxos.map((v) => {
        return {
          txId: v.txid,
          outputIndex: v.vout,
          satoshis: v.value,
          scriptPk: scriptPk.toString("hex"),
          addressType: wallet?.addressType,
          address: account.address!,
          ords: [],
        };
      }),
      toAddress: data.to,
      toAmount: data.amount,
      signTransaction: this.signPsbt.bind(this) as (
        psbt: Psbt
      ) => Promise<void>,
      network: data.network,
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
    if (!account?.address || !wallet)
      throw new Error(
        "Error when trying to get the current account or current account address or wallet"
      );

    const publicKey = this.exportPublicKey(account.address);

    const scriptPk = getScriptForAddress(
      Buffer.from(publicKey, "hex") as unknown as Uint8Array,
      wallet.addressType
    );
    if (!scriptPk)
      throw new Error("Internal error: Failed to get script for address");

    const inscriptionUtxoValue = data.utxos.find(
      (i) => (i as ApiOrdUTXO & { isOrd: boolean }).isOrd
    )?.value;
    if (inscriptionUtxoValue === undefined)
      throw new Error("Internal error: Inscription utxo was not found");

    const psbt = await createSendOrd({
      utxos: data.utxos.map((v) => {
        return {
          txId: v.txid,
          outputIndex: v.vout,
          satoshis: v.value,
          scriptPk: scriptPk.toString("hex"),
          addressType: wallet?.addressType,
          address: account.address!,
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
      outputValue: inscriptionUtxoValue,
      signTransaction: this.signPsbt.bind(this) as (
        psbt: Psbt
      ) => Promise<void>,
      network: data.network,
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
    utxos: ApiUTXO[],
    network: Network
  ) {
    if (!storageService.currentAccount?.address)
      throw new Error("Error when trying to get the current account or wallet");
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
          rawHex: f.hex,
          outputIndex: f.vout,
          ords: [],
        })),
        ...ordUtxos.map((f) => ({
          txId: f.txid,
          satoshis: f.value,
          rawHex: f.hex,
          outputIndex: f.vout,
          ords: [
            {
              id: f.inscription_id,
              offset: f.offset,
            },
          ],
        })),
      ],
      network,
    });
  }

  changeAddressType(index: number, addressType: AddressType): string[] {
    this.keyrings[index].addressType = addressType;
    return this.keyrings[index].getAccounts();
  }

  async deleteWallet(id: number) {
    if (storageService.appState.password === undefined)
      throw new Error("Internal error: Password is not defined");
    const newWallets = storageService.walletState.wallets
      .filter((i) => i.id !== id)
      .map((i, idx) => ({ ...i, id: idx }));

    await storageService.updateWalletState({
      wallets: newWallets,
    });

    this.keyrings.splice(id, 1);
    const payload = await storageService.saveWallets({
      password: storageService.appState.password,
      wallets: newWallets,
      seedToDelete: id,
    });
    return {
      wallets: newWallets,
      ...payload,
    };
  }

  async toggleRootAcc() {
    if (storageService.currentWallet?.id === undefined)
      throw new Error("Error when trying to get the current wallet");
    const currentWallet = storageService.currentWallet.id;
    (this.keyrings[currentWallet] as HDPrivateKey).toggleHideRoot();
    return this.keyrings[currentWallet].getAccounts();
  }

  async signPsbtWithoutFinalizing(psbt: Psbt, inputs?: UserToSignInput[]) {
    if (
      !storageService.currentAccount?.address ||
      !storageService.currentWallet
    )
      throw new Error(
        "Error when trying to get the current account or current account address or wallet"
      );
    const keyring = this.getKeyringByIndex(storageService.currentWallet.id);
    if (inputs === undefined)
      inputs = psbt.txInputs.map((_, i) => ({
        publicKey: this.exportPublicKey(
          storageService.currentAccount!.address!
        ),
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
    if (!storageService.currentAccount?.address)
      throw new Error("Error when trying to get the current account");
    const keyring = this.getKeyringByIndex(storageService.currentAccount.id);
    return keyring.verifyMessage(
      storageService.currentAccount.address,
      message,
      signatureHex
    );
  }

  switchNetwork(network: Network) {
    this.keyrings.map((f) => f.setNetwork(network));
  }
}

export default new KeyringService();
