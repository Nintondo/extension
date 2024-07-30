import {
  browserStorageLocalGet,
  browserStorageLocalSet,
} from "@/shared/utils/browser";
import * as encryptorUtils from "nintondo-browser-passworder";
import type { IAccount, IPrivateWallet, IWallet } from "@/shared/interfaces";
import type { DecryptedSecrets, StorageInterface } from "./types";
import type { IAppStateBase, IWalletStateBase } from "@/shared/interfaces";
import { emptyAppState, emptyWalletState } from "./utils";
import { keyringService, permissionService, storageService } from "..";
import { excludeKeysFromObj, pickKeysFromObj } from "@/shared/utils";
import eventBus from "@/shared/eventBus";
import { EVENTS } from "@/shared/constant";
import { Network, networks } from "belcoinjs-lib";

interface SaveWallets {
  password: string;
  wallets: IWallet[];
  payload?: DecryptedSecrets;
  newPassword?: string;
  seedToDelete?: number;
}

class StorageService {
  private _walletState: IWalletStateBase;
  private _appState: IAppStateBase;

  constructor() {
    this._walletState = emptyWalletState();
    this._appState = emptyAppState();
  }

  get walletState() {
    return this._walletState;
  }

  get appState() {
    return this._appState;
  }

  get currentWallet(): IWallet | undefined {
    const idx = this._walletState.selectedWallet;
    if (idx === undefined) return undefined;
    return this._walletState.wallets[idx];
  }

  get currentAccount(): IAccount | undefined {
    if (
      !this._walletState.wallets.length ||
      this._walletState.selectedWallet === undefined ||
      this._walletState.selectedAccount === undefined
    )
      return undefined;
    return this._walletState.wallets[this._walletState.selectedWallet].accounts[
      this._walletState.selectedAccount
    ];
  }

  async init(): Promise<[IAppStateBase, IWalletStateBase]> {
    const data = await this.getLocalValues();

    this._walletState = {
      ...this._walletState,
      ...pickKeysFromObj(data.cache, ["selectedAccount", "selectedWallet"]),
    };

    this._appState = {
      ...this._appState,
      ...pickKeysFromObj(data.cache, [
        "addressBook",
        "pendingWallet",
        "network",
        "language",
      ]),
    };

    return [this._appState, this._walletState];
  }

  async updateWalletState(state: Partial<IWalletStateBase>) {
    this._walletState = { ...this._walletState, ...state };

    if (
      state.selectedAccount !== undefined ||
      state.selectedWallet !== undefined ||
      state.wallets !== undefined
    ) {
      const localState = await this.getLocalValues();
      const cache: StorageInterface["cache"] = {
        ...localState.cache,
      };
      if (state.selectedAccount !== undefined)
        cache.selectedAccount = state.selectedAccount;
      if (state.selectedWallet !== undefined)
        cache.selectedWallet = state.selectedWallet;
      if (state.wallets !== undefined)
        cache.wallets = state.wallets.map((f) => ({
          addressType: f.addressType,
          name: f.name,
          type: f.type,
          accounts: f.accounts.map((j, idx) => ({
            id: idx,
            name: j.name,
          })),
          hideRoot: f.hideRoot,
        }));

      const payload: StorageInterface = {
        cache,
        enc: localState.enc,
      };

      await browserStorageLocalSet(payload);
    }

    eventBus.emit(EVENTS.broadcastToUI, {
      method: "updateFromWalletState",
      params: [state],
    });
  }

  async updateAppState(state: Partial<IAppStateBase>) {
    this._appState = { ...this._appState, ...state };

    if (
      state.addressBook !== undefined ||
      state.pendingWallet !== undefined ||
      state.language !== undefined ||
      state.network !== undefined
    ) {
      const localState = await this.getLocalValues();
      const cache: StorageInterface["cache"] = {
        ...localState.cache,
      };

      if (state.addressBook !== undefined)
        cache.addressBook = state.addressBook;
      if (state.pendingWallet !== undefined)
        cache.pendingWallet = state.pendingWallet;
      if (state.language !== undefined) cache.language = state.language;
      if (state.network !== undefined) cache.network = state.network;

      const payload: StorageInterface = {
        cache: cache,
        enc: localState.enc,
      };

      await browserStorageLocalSet(payload);
    }

    eventBus.emit(EVENTS.broadcastToUI, {
      method: "updateFromAppState",
      params: [state],
    });
  }

  async clearPendingWallet() {
    this._appState = excludeKeysFromObj(this._appState, ["pendingWallet"]);
    const localState = await this.getLocalValues();
    const newCache: StorageInterface = {
      cache: excludeKeysFromObj(localState.cache, ["pendingWallet"]),
      enc: localState.enc,
    };
    await browserStorageLocalSet(newCache);
  }

  async getPendingWallet() {
    const localState = await this.getLocalValues();
    return localState.cache.pendingWallet;
  }

  async saveWallets({
    password,
    wallets,
    newPassword,
    payload,
    seedToDelete,
  }: SaveWallets) {
    if (!password) throw new Error("Password is required");
    if (typeof storageService._walletState.selectedWallet === "undefined")
      throw new Error("No selected wallet");

    const local = await this.getLocalValues();
    const current = await this.getSecrets(local, password);

    if (payload) {
      payload = [...(current ?? []), ...payload];
    } else {
      payload = current;
    }

    if (seedToDelete !== undefined) {
      const payloadToDelete = payload?.findIndex((f) => f.id === seedToDelete);
      if (payloadToDelete !== undefined) payload?.splice(payloadToDelete, 1);
      payload = payload?.map((f, i) => ({ ...f, id: i }));
    }

    const walletsToSave = wallets.map((wallet) => {
      return {
        name: wallet.name,
        addressType: wallet.addressType,
        type: wallet.type,
        accounts: wallet.accounts.map((account, idx) => ({
          id: idx,
          name: account.name ?? "",
        })),
        hideRoot: wallet.hideRoot,
      };
    });

    const keyringsToSave = wallets.map((i, idx) => ({
      id: idx,
      data: keyringService.serializeById(idx),
      phrase: payload?.find((d) => d.id === i.id)?.phrase,
    }));
    const encrypted = await encryptorUtils.encrypt(
      newPassword ?? password,
      JSON.stringify(keyringsToSave)
    );

    const selectedWallet =
      this._walletState.selectedWallet! > wallets.length - 1
        ? this._walletState.selectedWallet! - 1
        : this._walletState.selectedWallet;
    const selectedAccount = 0;

    this._walletState.selectedWallet = selectedWallet;
    this._walletState.selectedAccount = selectedAccount;
    this._walletState.wallets = wallets;
    if (newPassword) this._appState.password = newPassword;

    const data: StorageInterface = {
      enc: JSON.parse(encrypted),
      cache: {
        ...local.cache,
        wallets: walletsToSave,
        selectedWallet,
        selectedAccount,
        addressBook: this.appState.addressBook,
        connectedSites: permissionService.allSites,
        language: storageService.appState.language ?? "en",
      },
    };

    await browserStorageLocalSet(data);

    return {
      selectedAccount,
      selectedWallet,
    };
  }

  private async getSecrets(encrypted: StorageInterface, password: string) {
    if (!encrypted.enc) return undefined;
    const loaded = (await encryptorUtils.decrypt(
      password,
      JSON.stringify(encrypted.enc)
    )) as string | undefined;
    if (!loaded) return undefined;
    return JSON.parse(loaded) as DecryptedSecrets;
  }

  async getWalletPhrase(index: number, password: string) {
    const encrypted = await this.getLocalValues();
    const current = await this.getSecrets(encrypted, password);
    if (current?.length === undefined || current.length < index) {
      throw new Error(`Failed to found wallet with id ${index}`);
    }
    return current[index].phrase;
  }

  async getLocalValues(): Promise<StorageInterface> {
    const data = await browserStorageLocalGet<StorageInterface>(undefined);
    if (data.cache === undefined) {
      return {
        cache: {
          addressBook: [],
          selectedWallet: 0,
          selectedAccount: 0,
          wallets: [],
          connectedSites: [],
          unpushedHexes: [],
          network: networks.bellcoin,
        },
        enc: undefined,
      };
    }
    return data;
  }

  async importWallets(
    password: string
  ): Promise<{ network?: Network; wallets: IPrivateWallet[] }> {
    const encrypted = await this.getLocalValues();
    if (!encrypted) return { wallets: [] };

    this._appState = {
      ...this._appState,
      addressBook: encrypted.cache.addressBook,
    };

    permissionService.setConnectedSites(encrypted.cache.connectedSites);

    this._walletState = {
      ...this._walletState,
      selectedAccount: encrypted.cache.selectedAccount,
      selectedWallet: encrypted.cache.selectedWallet,
    };

    const secrets = await this.getSecrets(encrypted, password);

    return {
      wallets: encrypted.cache.wallets.map((i, index: number) => {
        const current = secrets?.find((i) => i.id === index);
        return {
          ...i,
          id: index,
          phrase: current?.phrase,
          data: current?.data,
        };
      }),
      network: encrypted.cache.network,
    };
  }

  getUniqueName(kind: "Wallet" | "Account"): string {
    if (kind === "Wallet") {
      const wallets = this.walletState.wallets;
      if (wallets.length <= 0) return "Wallet 1";
      return `Wallet ${this.getUniqueId(
        wallets.map((f) => f.name ?? ""),
        "Wallet"
      )}`;
    } else {
      const accounts = this.currentWallet?.accounts;
      if (!accounts) return "Account 1";
      return `Account ${this.getUniqueId(
        accounts.map((f) => f.name ?? ""),
        "Account"
      )}`;
    }
  }

  private getUniqueId(names: string[], type: "Account" | "Wallet") {
    const ids: number[] = names.map((f) => {
      const name = f.trim();
      if (name.includes(type) && name.split(" ").length === 2) {
        const accountid = name.split(" ")[1];
        if (!Number.isNaN(Number(accountid))) {
          return Number.parseInt(accountid);
        }
        return 0;
      }
      return 0;
    });
    return Math.max(...ids) + 1;
  }
}

export default new StorageService();
