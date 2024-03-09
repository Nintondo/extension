import type { DecryptedSecrets } from "@/background/services/storage/types";
import type { IAccount } from "./accounts";
import type { INewWalletProps, IPrivateWallet, IWallet } from "./wallets";

export interface IWalletController {
  createNewWallet(props: INewWalletProps): Promise<IWallet>;
  saveWallets(phrases?: DecryptedSecrets, newPassword?: string): Promise<void>;
  isVaultEmpty(): Promise<boolean>;
  importWallets(password: string): Promise<Omit<IPrivateWallet, "data">[]>;
  loadAccountsData(walletId: number, accounts: IAccount[]): Promise<IAccount[]>;
  createNewAccount(name?: string): Promise<IAccount>;
  generateMnemonicPhrase(): Promise<string>;
  deleteWallet(id: number): Promise<IWallet[]>;
  toogleRootAccount(): Promise<void>;
  getAccounts(): Promise<string[]>;
}
