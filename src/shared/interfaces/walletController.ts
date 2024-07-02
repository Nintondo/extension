import type { DecryptedSecrets } from "@/background/services/storage/types";
import type { IAccount } from "./accounts";
import type {
  DeleteWalletResult,
  INewWalletProps,
  IPrivateWallet,
  IWallet,
} from "./wallets";
import { Network } from "belcoinjs-lib";

export interface IWalletController {
  createNewWallet(props: INewWalletProps): Promise<IWallet>;
  saveWallets(phrases?: DecryptedSecrets, newPassword?: string): Promise<void>;
  isVaultEmpty(): Promise<boolean>;
  importWallets(password: string): Promise<Omit<IPrivateWallet, "data">[]>;
  loadAccountsData(walletId: number, accounts: IAccount[]): Promise<IAccount[]>;
  createNewAccount(name?: string): Promise<IAccount | undefined>;
  generateMnemonicPhrase(): Promise<string>;
  deleteWallet(id: number): Promise<DeleteWalletResult>;
  toogleRootAccount(): Promise<void>;
  getAccounts(): Promise<string[]>;
  switchNetwork(network: Network): Promise<void>;
}
