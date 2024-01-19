import type { IWalletState } from "@/shared/interfaces";
import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import { useMemo } from "react";
import { useAppState } from "./appState";

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
    const { updateTab } = useAppState.getState();
    if (updateBack) {
      await proxy.updateWalletState(state);
      await updateTab();
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

  return useMemo(() => {
    if (selectedWallet === undefined || selectedAccount === undefined)
      return undefined;
    return wallets[selectedWallet]?.accounts[selectedAccount];
  }, [selectedAccount, selectedWallet, wallets]);
};

export const useGetCurrentWallet = () => {
  const { selectedWallet, wallets } = useWalletState((v) => ({
    selectedWallet: v.selectedWallet,
    wallets: v.wallets,
  }));

  return useMemo(() => {
    if (selectedWallet === undefined) return undefined;
    return wallets[selectedWallet];
  }, [selectedWallet, wallets]);
};
