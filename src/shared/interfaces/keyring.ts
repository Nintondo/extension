import bitcoin from "belcoinjs-lib";
import { ECPairInterface } from "belpair";

interface DeserializeOption {
  hdPath?: string;
  mnemonic?: string;
  xpriv?: string;
  activeIndexes?: number[];
  passphrase?: string;
}

export interface Keyring {
  type: string;
  wallets: ECPairInterface[];
  serialize(): Promise<DeserializeOption>;
  deserialize(_opts?: DeserializeOption): Promise<void>;
  initFromMnemonic(mnemonic: string): Promise<void>;
  changeHdPath(hdPath: string): void;
  getAccountByHdPath(hdPath: string, index: number): string;
  addAccounts(numberOfAccounts?: number): Promise<string[]>;
  activeAccounts(indexes: number[]): string[];
  getAddresses(
    start: number,
    end: number
  ): {
    address: string;
    index: number;
  }[];
  __getPage(increment: number): Promise<
    {
      address: string;
      index: number;
    }[]
  >;
  getAccounts(): Promise<string[]>;
  getIndexByAddress(address: string): number;
  signTransaction(
    psbt: bitcoin.Psbt,
    inputs: {
      index: number;
      publicKey: string;
      sighashTypes?: number[];
    }[],
    opts?: any
  ): Promise<bitcoin.Psbt>;
  signMessage(publicKey: string, text: string): Promise<any>;
  verifyMessage(publicKey: string, text: string, sig: string): Promise<any>;
  exportAccount(publicKey: string): Promise<string>;
}
