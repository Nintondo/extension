import { DecryptedSecrets } from "@/background/services/storage/types";
import { IAccount } from "./accounts";
import { IPrivateWallet, IWallet } from "./wallets";
import { AddressType } from "bellhdw";

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
}
