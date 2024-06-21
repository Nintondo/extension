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
import { Network } from "belcoinjs-lib";
import { useAppState } from "../states/appState";

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
  const navigate = useNavigate();

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
      navigate("/");
    },
    [
      wallets,
      updateWalletState,
      walletController,
      keyringController,
      notificationController,
      navigate,
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
      wallets[selectedWallet] = {
        ...wallets[selectedWallet],
        ...wallet,
      };
      await updateWalletState({
        wallets,
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
  const navigate = useNavigate();

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
      navigate("/");
    },
    [
      currentWallet,
      updateCurrentWallet,
      walletController,
      updateWalletState,
      notificationController,
      navigate,
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
  const navigate = useNavigate();

  return useCallback(
    async (key: number, accKey?: number) => {
      const wallet = wallets.find((f) => f.id === key);
      if (!wallet) return;
      wallets[key].accounts = await walletController.loadAccountsData(
        wallet.id,
        wallet.accounts
      );
      await updateWalletState({
        selectedWallet: wallet.id,
        wallets,
        selectedAccount: accKey ?? 0,
      });
      await notificationController.changedAccount();
      navigate("/");
    },
    [
      wallets,
      updateWalletState,
      walletController,
      notificationController,
      navigate,
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
  const { setCurrentPage } = useTransactionManagerContext();

  return useCallback(
    async (id: number) => {
      await updateWalletState({
        selectedAccount: id,
      });

      await notificationController.changedAccount();
      navigate("/");
      setCurrentPage(1);
    },
    [updateWalletState, navigate, notificationController, setCurrentPage]
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

      wallets[selectedWallet].accounts[selectedAccount] = {
        ...wallets[selectedWallet].accounts[selectedAccount],
        ...account,
      };

      await updateWalletState({
        wallets,
      });
    },
    [updateWalletState, selectedAccount, selectedWallet, wallets]
  );

  return useCallback(
    async (address?: string) => {
      if (address === undefined && currentAccount?.address === undefined)
        return;

      const { count, amount, balance } = (await apiController.getAccountStats(
        currentAccount!.address!
      )) ?? { amount: 0, count: 0, balance: 0 };
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
      await updateWalletState(
        {
          wallets: await walletController.deleteWallet(id),
        },
        false
      );
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

export const useSwitchNetwork = () => {
  const navigate = useNavigate();
  const { updateAppState } = useAppState((v) => ({
    network: v.network,
    updateAppState: v.updateAppState,
    password: v.password,
  }));
  const { updateWalletState, selectedWallet, wallets } = useWalletState(
    (v) => ({
      updateWalletState: v.updateWalletState,
      selectedWallet: v.selectedWallet,
      wallets: v.wallets,
    })
  );
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
    apiController: v.apiController,
  }));

  return useCallback(
    async (network: Network) => {
      if (selectedWallet === undefined) return;
      const updatedWallets = wallets;
      await Promise.all([
        updateAppState({ network }),
        walletController.switchNetwork(network),
      ]);
      updatedWallets[selectedWallet].accounts =
        await walletController.loadAccountsData(
          selectedWallet,
          updatedWallets[selectedWallet].accounts
        );
      await updateWalletState({ wallets: updatedWallets });
      navigate("/");
    },
    [
      navigate,
      selectedWallet,
      updateAppState,
      updateWalletState,
      walletController,
      wallets,
    ]
  );
};
