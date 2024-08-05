import type { IWalletStateBase } from "@/shared/interfaces";
import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import { immer } from "zustand/middleware/immer";
import { produce } from "immer";

const proxy = setupStateProxy();

export interface IWalletState extends IWalletStateBase {
  updateWalletState: (
    state: Partial<IWalletState>,
    updateBack?: boolean
  ) => Promise<void>;

  updateWallet: (
    walletId: number,
    payload: Partial<IWalletStateBase["wallets"][0]>,
    updateBack?: boolean
  ) => Promise<void>;

  updateSelectedWallet: (
    payload: Partial<IWalletStateBase["wallets"][0]>,
    updateBack?: boolean
  ) => Promise<void>;

  updateAccount: (
    walletId: number,
    accountId: number,
    payload: Partial<IWalletStateBase["wallets"][0]["accounts"][0]>,
    updateBack?: boolean
  ) => Promise<void>;

  updateSelectedAccount: (
    payload: Partial<IWalletStateBase["wallets"][0]["accounts"][0]>,
    updateBack?: boolean
  ) => Promise<void>;
}

export const useWalletState = create<IWalletState>()(
  immer((set, get) => ({
    wallets: [],
    vaultIsEmpty: true,
    selectedAccount: undefined,
    selectedWallet: undefined,

    async updateWalletState(state: Partial<IWalletState>, updateBack = true) {
      if (updateBack) {
        await proxy.updateWalletState(state);
      } else {
        set((prev) => {
          return {
            ...prev,
            ...state,
          };
        });
      }
    },

    async updateWallet(walletId, payload, updateBack = true) {
      if (updateBack) {
        const { wallets } = get();

        await proxy.updateWalletState({
          wallets: produce(wallets, (draft) => {
            draft[walletId] = {
              ...draft[walletId],
              ...payload,
            };
          }),
        });
      } else {
        set((state) => {
          state.wallets[walletId] = {
            ...state.wallets[walletId],
            ...payload,
          };
        });
      }
    },

    async updateSelectedWallet(payload, updateBack = true) {
      const { selectedWallet, updateWallet } = get();
      if (selectedWallet === undefined) return;
      await updateWallet(selectedWallet, payload, updateBack);
    },

    async updateAccount(walletId, accountId, payload, updateBack = true) {
      const { wallets } = get();

      if (updateBack) {
        await proxy.updateWalletState({
          wallets: produce(wallets, (draft) => {
            draft[walletId].accounts[accountId] = {
              ...draft[walletId].accounts[accountId],
              ...payload,
            };
          }),
        });
      } else {
        set(({ wallets }) => {
          wallets[walletId].accounts[accountId] = {
            ...wallets[walletId].accounts[accountId],
            ...payload,
          };
        });
      }
    },

    async updateSelectedAccount(payload, updateBack = true) {
      const { selectedWallet, selectedAccount, updateAccount } = get();
      if (selectedWallet === undefined || selectedAccount === undefined) return;
      await updateAccount(selectedWallet, selectedAccount, payload, updateBack);
    },
  }))
);

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
