import type { IWalletState } from "@/shared/interfaces";
import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";

const proxy = setupStateProxy();

export const useWalletState = create<IWalletState>()((set) => ({
  wallets: [],
  vaultIsEmpty: true,
  selectedAccount: undefined,
  selectedWallet: undefined,

  updateWalletState: async (
    state: Partial<IWalletState>,
    updateBack = true
  ) => {
    if (updateBack) {
      await proxy.updateWalletState(state);
    }
    set(state);
  },
}));

export const useGetCurrentAccount = () => {
  const { selectedAccount, selectedWallet, wallets } = useWalletState((v) => ({
    selectedWallet: v.selectedWallet,
    selectedAccount: v.selectedAccount,
    wallets: v.wallets,
  }));

  if (selectedWallet === undefined || selectedAccount === undefined)
    return undefined;
  return wallets[selectedWallet]?.accounts[selectedAccount];
};

export const useGetCurrentWallet = () => {
  const { selectedWallet, wallets } = useWalletState((v) => ({
    selectedWallet: v.selectedWallet,
    wallets: v.wallets,
  }));

  if (selectedWallet === undefined) return undefined;
  return wallets[selectedWallet];
};
