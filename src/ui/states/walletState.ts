import type { IWalletStateBase } from "@/shared/interfaces";
import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";

const proxy = setupStateProxy();

export interface IWalletState extends IWalletStateBase {
  updateWalletState: (
    state: Partial<IWalletState>,
    updateBack: boolean
  ) => Promise<void>;

  updateWallet: (
    walletId: number,
    payload: Partial<IWalletStateBase["wallets"][0]>,
    updateBack: boolean
  ) => Promise<void>;

  updateSelectedWallet: (
    payload: Partial<IWalletStateBase["wallets"][0]>,
    updateBack: boolean
  ) => Promise<void>;

  updateAccount: (
    walletId: number,
    accountId: number,
    payload: Partial<IWalletStateBase["wallets"][0]["accounts"][0]>,
    updateBack: boolean
  ) => Promise<void>;

  updateSelectedAccount: (
    payload: Partial<IWalletStateBase["wallets"][0]["accounts"][0]>,
    updateBack: boolean
  ) => Promise<void>;
}

export const useWalletState = create<IWalletState>()((set, get) => ({
  wallets: [],
  vaultIsEmpty: true,
  selectedAccount: undefined,
  selectedWallet: undefined,

  async updateWalletState(state: Partial<IWalletState>, updateBack) {
    if (updateBack) {
      await proxy.updateWalletState(state, true);
    }
    set(state);
  },

  async updateWallet(walletId, payload, updateBack) {
    const { wallets } = get();
    const newWallets = wallets.map((w) => {
      if (w.id === walletId) {
        return {
          ...w,
          ...payload,
        };
      }
      return w;
    });
    if (updateBack) {
      await proxy.updateWalletState(
        {
          wallets,
        },
        false
      );
    }
    set({
      wallets: newWallets,
    });
  },

  async updateSelectedWallet(payload, updateBack) {
    const { selectedWallet, updateWallet } = get();
    if (selectedWallet === undefined) return;
    await updateWallet(selectedWallet, payload, updateBack);
  },

  async updateAccount(walletId, accountId, payload, updateBack) {
    const { wallets, updateWallet } = get();

    const accounts = wallets[walletId]?.accounts;

    if (!accounts) return;

    accounts[accountId] = {
      ...accounts[accountId],
      ...payload,
    };

    await updateWallet(walletId, { accounts }, updateBack);
  },

  async updateSelectedAccount(payload, updateBack) {
    const { selectedWallet, selectedAccount, updateAccount } = get();
    if (selectedWallet === undefined || selectedAccount === undefined) return;
    await updateAccount(selectedWallet, selectedAccount, payload, updateBack);
  },
}));

export const useGetCurrentAccount = () => {
  const { selectedWallet, selectedAccount, wallets } = useWalletState();
  if (selectedWallet === undefined || selectedAccount === undefined) return;
  return wallets[selectedWallet]?.accounts[selectedAccount];
};

export const useGetCurrentWallet = () => {
  const { selectedWallet, wallets } = useWalletState();
  if (selectedWallet === undefined) return;
  return wallets[selectedWallet];
};
