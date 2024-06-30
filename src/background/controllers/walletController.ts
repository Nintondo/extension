import { storageService } from "@/background/services";
import type {
  IAccount,
  INewWalletProps,
  IWallet,
  IWalletController,
} from "@/shared/interfaces";
import keyringService from "@/background/services/keyring";
import { excludeKeysFromObj } from "@/shared/utils";
import type { DecryptedSecrets } from "../services/storage/types";
import * as bip39 from "bip39";
import { AddressType, HDPrivateKey } from "bellhdw";
import { Network } from "belcoinjs-lib";

class WalletController implements IWalletController {
  async isVaultEmpty() {
    const values = await storageService.getLocalValues();
    return values.enc === undefined;
  }

  async createNewWallet(props: INewWalletProps): Promise<IWallet> {
    const exportedWallets = storageService.walletState.wallets;
    const address = await keyringService.newKeyring(props);
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
      name: !props.name ? storageService.getUniqueName("Wallet") : props.name,
      id: walletId,
      type: props.walletType,
      addressType: props.addressType ?? AddressType.P2PKH,
      accounts: [account],
      hideRoot: props.hideRoot,
    };
  }

  async saveWallets(data?: DecryptedSecrets, newPassword?: string) {
    if (storageService.appState.password === undefined)
      throw new Error("Internal error: Missing password");
    await storageService.saveWallets({
      password: storageService.appState.password,
      wallets: storageService.walletState.wallets,
      payload: data,
      newPassword,
    });
  }

  async importWallets(password: string) {
    const wallets = await keyringService.init(password);
    const importedWallets = wallets.map((i) => excludeKeysFromObj(i, ["data"]));
    const selected = storageService.walletState.selectedWallet;

    if (typeof selected === "undefined")
      throw new Error("Importing wallets: No selected wallet");

    const wallet = keyringService.getKeyringByIndex(selected);
    const addresses = wallet.getAccounts();
    importedWallets[selected!].accounts = importedWallets[
      selected!
    ].accounts.map((i, idx) => ({
      ...i,
      address: addresses[idx],
    }));

    storageService.walletState.wallets = importedWallets;

    return importedWallets;
  }

  async loadAccountsData(
    walletId: number,
    accounts: IAccount[]
  ): Promise<IAccount[]> {
    const wallet = keyringService.getKeyringByIndex(walletId);
    const addresses = wallet.getAccounts();

    return addresses.map((i, idx) => ({
      id: idx,
      address: i,
      name: accounts[idx] ? accounts[idx].name : `Account ${idx + 1}`,
    }));
  }

  async createNewAccount(name?: string) {
    const wallet = storageService.currentWallet;
    if (!wallet) {
      throw new Error("No one selected wallet");
    }
    const accName = !name?.length
      ? storageService.getUniqueName("Account")
      : name;
    const addresses = (
      keyringService.getKeyringByIndex(wallet.id) as HDPrivateKey
    ).addAccounts(1);

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

  async toogleRootAccount(): Promise<void> {
    return await keyringService.toogleRootAcc();
  }

  async getAccounts(): Promise<string[]> {
    if (storageService.currentWallet?.id === undefined) return [];
    const keyring = keyringService.getKeyringByIndex(
      storageService.currentWallet.id
    );
    return keyring.getAccounts();
  }

  async switchNetwork(network: Network) {
    keyringService.switchNetwork(network);
  }
}

export default new WalletController();
