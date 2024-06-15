import type { IAccount, INewWalletProps, IWallet } from "@/shared/interfaces";
import { useControllersState } from "../states/controllerState";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "../states/walletState";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useTransactionManagerContext } from "../utils/tx-ctx";

export const useCreateNewWallet = () => {
  const { wallets, updateWalletState } = useWalletState((v) => ({
    wallets: v.wallets,
    updateWalletState: v.updateWalletState,
  }));
  const { walletController, keyringController, notificationController } =
    useControllersState((v) => ({
      walletController: v.walletController,
      keyringController: v.keyringController,
      notificationController: v.notificationController,
    }));
  const { trottledUpdate } = useTransactionManagerContext();

  return useCallback(
    async (props: INewWalletProps) => {
      const wallet = await walletController.createNewWallet(props);
      await updateWalletState({
        selectedAccount: 0,
        selectedWallet: wallet.id,
        wallets: [...wallets, wallet],
      });
      const keyring = await keyringController.serializeKeyringById(wallet.id);
      await walletController.saveWallets([
        { id: wallet.id, phrase: props.payload, data: keyring },
      ]);
      await notificationController.changedAccount();
      trottledUpdate(true);
    },
    [
      wallets,
      updateWalletState,
      walletController,
      keyringController,
      notificationController,
      trottledUpdate,
    ]
  );
};

export const useUpdateCurrentWallet = () => {
  const { updateWalletState, selectedWallet, wallets } = useWalletState(
    (v) => ({
      updateWalletState: v.updateWalletState,
      selectedWallet: v.selectedWallet,
      wallets: v.wallets,
    })
  );

  return useCallback(
    async (wallet: Partial<IWallet>) => {
      if (selectedWallet === undefined) return;
      wallets[selectedWallet] = { ...wallets[selectedWallet], ...wallet };
      await updateWalletState({
        wallets: [...wallets],
      });
    },
    [updateWalletState, selectedWallet, wallets]
  );
};

export const useCreateNewAccount = () => {
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const updateCurrentWallet = useUpdateCurrentWallet();
  const currentWallet = useGetCurrentWallet();
  const { walletController, notificationController } = useControllersState(
    (v) => ({
      walletController: v.walletController,
      notificationController: v.notificationController,
    })
  );
  const { trottledUpdate } = useTransactionManagerContext();

  return useCallback(
    async (name?: string) => {
      if (!currentWallet) return;
      const createdAccount = await walletController.createNewAccount(name);
      if (!createdAccount)
        throw new Error("Internal error: failed to create new account");
      const updatedWallet: IWallet = {
        ...currentWallet,
        accounts: [...currentWallet.accounts, createdAccount].map((f, i) => ({
          ...f,
          id: i,
        })),
      };

      await updateCurrentWallet(updatedWallet);
      await walletController.saveWallets();
      await updateWalletState({
        selectedAccount:
          updatedWallet.accounts[updatedWallet.accounts.length - 1].id,
      });
      await notificationController.changedAccount();
      trottledUpdate(true);
    },
    [
      currentWallet,
      updateCurrentWallet,
      walletController,
      updateWalletState,
      trottledUpdate,
      notificationController,
    ]
  );
};

export const useSwitchWallet = () => {
  const { wallets, updateWalletState } = useWalletState((v) => ({
    wallets: v.wallets,
    updateWalletState: v.updateWalletState,
  }));
  const { walletController, notificationController } = useControllersState(
    (v) => ({
      walletController: v.walletController,
      notificationController: v.notificationController,
    })
  );
  const { trottledUpdate } = useTransactionManagerContext();

  return useCallback(
    async (key: number, accKey?: number) => {
      const wallet = wallets.find((f) => f.id === key);
      if (!wallet) return;
      wallet.accounts = await walletController.loadAccountsData(
        wallet.id,
        wallet.accounts
      );
      await updateWalletState({
        selectedWallet: wallet.id,
        wallets: wallets.with(key, wallet),
        selectedAccount: accKey ?? 0,
      });
      await notificationController.changedAccount();
      trottledUpdate(true);
    },
    [
      wallets,
      updateWalletState,
      walletController,
      notificationController,
      trottledUpdate,
    ]
  );
};

export const useSwitchAccount = () => {
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const navigate = useNavigate();
  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));
  const { trottledUpdate } = useTransactionManagerContext();
  const { setCurrentPage } = useTransactionManagerContext();

  return useCallback(
    async (id: number) => {
      await updateWalletState({
        selectedAccount: id,
      });

      navigate("/home");
      await notificationController.changedAccount();
      trottledUpdate(true);
      setCurrentPage(1);
    },
    [
      updateWalletState,
      navigate,
      notificationController,
      trottledUpdate,
      setCurrentPage,
    ]
  );
};

export const useUpdateCurrentAccountBalance = () => {
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const currentAccount = useGetCurrentAccount();

  const { updateWalletState, wallets, selectedAccount, selectedWallet } =
    useWalletState((v) => ({
      updateWalletState: v.updateWalletState,
      wallets: v.wallets,
      selectedAccount: v.selectedAccount,
      selectedWallet: v.selectedWallet,
    }));

  const updateCurrentAccount = useCallback(
    async (account: Partial<IAccount>) => {
      if (selectedWallet === undefined || selectedAccount === undefined) return;
      if (!wallets[selectedWallet]) return;
      wallets[selectedWallet].accounts[selectedAccount] = {
        ...wallets[selectedWallet].accounts[selectedAccount],
        ...account,
      };

      await updateWalletState({
        wallets: [...wallets],
      });
    },
    [updateWalletState, selectedAccount, selectedWallet, wallets]
  );

  return useCallback(
    async (address?: string) => {
      if (address === undefined && currentAccount?.address === undefined)
        return;
      const balance = await apiController.getAccountBalance(
        address ?? currentAccount!.address!
      );
      const { count, amount } = (await apiController.getInscriptionCounter(
        currentAccount!.address!
      )) ?? { amount: 0, count: 0 };
      await updateCurrentAccount({
        balance: balance,
        inscriptionCounter: count,
        inscriptionBalance: amount / 10 ** 8,
      });
    },
    [updateCurrentAccount, currentAccount, apiController]
  );
};

export const useDeleteWallet = () => {
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const currentWallet = useGetCurrentWallet();
  const currentAccount = useGetCurrentAccount();
  const { wallets } = useWalletState((v) => ({ wallets: v.wallets }));
  const switchWallet = useSwitchWallet();

  return useCallback(
    async (id: number) => {
      if (wallets.length === 1) {
        toast.error(t("hooks.wallet.last_wallet_error"));
        return;
      }
      if (currentWallet?.id === undefined) throw new Error("Unreachable");
      const newWalletId =
        currentWallet.id > id ? currentWallet.id - 1 : currentWallet.id;
      await switchWallet(
        id === currentWallet.id ? 0 : newWalletId,
        id === currentWallet.id ? 0 : currentAccount?.id ?? 0
      );
      await updateWalletState({
        wallets: await walletController.deleteWallet(id),
      });
    },
    [
      currentWallet,
      walletController,
      updateWalletState,
      wallets.length,
      switchWallet,
      currentAccount,
    ]
  );
};
