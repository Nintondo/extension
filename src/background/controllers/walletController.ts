import { storageService } from "@/background/services";
import type { IAccount, IWallet, IWalletController } from "@/shared/interfaces";
import keyringService from "@/background/services/keyring";
import { excludeKeysFromObj } from "@/shared/utils";
import { DecryptedSecrets } from "../services/storage/types";
import * as bip39 from "bip39";
import { AddressType, Keyring } from "bellhdw";

class WalletController implements IWalletController {
  async isVaultEmpty() {
    const values = await storageService.getLocalValues();
    return values.enc === undefined;
  }

  async createNewWallet(
    phrase: string,
    walletType: "simple" | "root",
    addressType?: AddressType,
    name?: string
  ): Promise<IWallet> {
    const exportedWallets = storageService.walletState.wallets;
    const address = await keyringService.newKeyring(
      walletType,
      phrase,
      addressType
    );
    const account: IAccount = {
      id: 0,
      name: "Account 1",
      address,
    };
    const walletId =
      exportedWallets.length > 0
        ? exportedWallets[exportedWallets.length - 1].id + 1
        : 0;

    return {
      name: !name ? storageService.getUniqueName("Wallet") : name,
      id: walletId,
      type: walletType,
      addressType:
        typeof addressType === "number" ? addressType : AddressType.P2PKH,
      accounts: [account],
    };
  }

  async saveWallets(data?: DecryptedSecrets, newPassword?: string) {
    await storageService.saveWallets({
      password: storageService.appState.password,
      wallets: storageService.walletState.wallets,
      payload: data,
      newPassword,
    });
  }

  async importWallets(password: string) {
    const wallets = await keyringService.init(password);
    return wallets.map((i) => excludeKeysFromObj(i, ["data"]));
  }

  async loadAccountsData(
    walletId: number,
    accounts: IAccount[]
  ): Promise<IAccount[]> {
    const wallet = keyringService.keyrings[walletId] as unknown as Keyring<JSON>;

    const addresses = wallet.getAccounts();

    return accounts.map((i) => ({
      ...i,
      address: addresses[i.id],
    }));
  }

  async createNewAccount(name?: string): Promise<IAccount> {
    const wallet = storageService.currentWallet;
    if (!wallet) {
      throw new Error("No one selected wallet");
    }
    const accName = !name?.length
      ? storageService.getUniqueName("Account")
      : name;
    const addresses = keyringService
      .getKeyringByIndex(wallet.id)
      .addAccounts(1);

    return {
      id: wallet.accounts[wallet.accounts.length - 1].id + 1,
      name: accName,
      address: addresses[0],
    };
  }

  async generateMnemonicPhrase(): Promise<string> {
    return bip39.generateMnemonic(128);
  }

  async deleteWallet(id: number): Promise<IWallet[]> {
    return keyringService.deleteWallet(id);
  }
}

export default new WalletController();
