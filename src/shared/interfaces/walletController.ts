import type { DecryptedSecrets } from "@/background/services/storage/types";
import type { IAccount } from "./accounts";
import type { IPrivateWallet, IWallet } from "./wallets";
import type { AddressType } from "bellhdw";

export interface IWalletController {
  createNewWallet(
    phrase: string,
    walletType: "simple" | "root",
    addressType?: AddressType,
    name?: string,
    hideRoot?: boolean
  ): Promise<IWallet>;
  saveWallets(phrases?: DecryptedSecrets, newPassword?: string): Promise<void>;
  isVaultEmpty(): Promise<boolean>;
  importWallets(password: string): Promise<Omit<IPrivateWallet, "data">[]>;
  loadAccountsData(walletId: number, accounts: IAccount[]): Promise<IAccount[]>;
  createNewAccount(name?: string): Promise<IAccount>;
  generateMnemonicPhrase(): Promise<string>;
  deleteWallet(id: number): Promise<IWallet[]>;
  toogleRootAccount(): Promise<void>;
  getCurrentAccountHideRootState(): Promise<boolean>;
  getAccounts(): Promise<string[]>;
}
