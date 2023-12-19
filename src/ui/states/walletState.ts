import { IWalletState } from "@/shared/interfaces";
import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import { useMemo } from "react";

export const useWalletState = create<IWalletState>()((set) => ({
  wallets: [],
  vaultIsEmpty: true,
  selectedAccount: undefined,
  selectedWallet: undefined,

  updateWalletState: async (state: Partial<IWalletState>) => {
    const proxy = setupStateProxy();
    await proxy.updateWalletState(state);
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
    if (selectedWallet === undefined || selectedAccount === undefined) return undefined;
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
