import { IAccount, INewWalletProps, IWallet } from "@/shared/interfaces";
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

export const useCreateNewWallet = () => {
  const { wallets, updateWalletState } = useWalletState((v) => ({
    wallets: v.wallets,
    updateWalletState: v.updateWalletState,
  }));
  const { walletController, keyringController } = useControllersState((v) => ({
    walletController: v.walletController,
    keyringController: v.keyringController,
  }));

  return useCallback(
    async ({
      phrase,
      walletType,
      addressType,
      name,
      hideRoot,
    }: INewWalletProps) => {
      const wallet = await walletController.createNewWallet(
        phrase,
        walletType,
        addressType,
        name,
        hideRoot
      );
      await updateWalletState({
        selectedAccount: 0,
        selectedWallet: wallet.id,
        wallets: [...wallets, wallet],
      });
      const keyring = await keyringController.serializeKeyringById(wallet.id);
      await walletController.saveWallets([
        { id: wallet.id, phrase: phrase, data: keyring },
      ]);
    },
    [wallets, updateWalletState, walletController, keyringController]
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
      wallets[selectedWallet] = { ...wallets[selectedWallet], ...wallet };
      await updateWalletState({
        wallets: [...wallets],
      });
    },
    [updateWalletState, selectedWallet, wallets]
  );
};

export const useUpdateCurrentAccount = () => {
  const { updateWalletState, wallets, selectedAccount, selectedWallet } =
    useWalletState((v) => ({
      updateWalletState: v.updateWalletState,
      wallets: v.wallets,
      selectedAccount: v.selectedAccount,
      selectedWallet: v.selectedWallet,
    }));

  return useCallback(
    async (account: Partial<IAccount>) => {
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
};

export const useCreateNewAccount = () => {
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const updateCurrentWallet = useUpdateCurrentWallet();
  const currentWallet = useGetCurrentWallet();
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));

  return useCallback(
    async (name?: string) => {
      if (!currentWallet) return;
      const createdAccount = await walletController.createNewAccount(name);
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
    },
    [currentWallet, updateCurrentWallet, walletController, updateWalletState]
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

  return useCallback(
    async (key: number, accKey?: number) => {
      const wallet = wallets.find((f) => f.id === key);
      if (!wallet) return;
      if (!wallet.accounts[0].address) {
        wallet.accounts = await walletController.loadAccountsData(
          wallet.id,
          wallet.accounts
        );
      }
      await updateWalletState({
        selectedWallet: wallet.id,
        wallets: wallets.with(key, wallet),
        selectedAccount: accKey ?? 0,
      });
      await notificationController.changedAccount();
    },
    [wallets, updateWalletState, walletController, notificationController]
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

  return useCallback(
    async (id: number) => {
      await updateWalletState({
        selectedAccount: id,
      });

      navigate("/home");
      await notificationController.changedAccount();
    },
    [updateWalletState, navigate, notificationController]
  );
};

export const useUpdateCurrentAccountBalance = () => {
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const updateCurrentAccount = useUpdateCurrentAccount();
  const currentAccount = useGetCurrentAccount();

  return useCallback(
    async (address?: string) => {
      const balance = await apiController.getAccountBalance(
        address ? address : currentAccount?.address ?? ""
      );
      if (balance === undefined || !currentAccount) return;
      await updateCurrentAccount({
        balance: balance / 10 ** 8,
      });
    },
    [updateCurrentAccount, currentAccount, apiController]
  );
};

export const useUpdateCurrentAccountTransactions = () => {
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));
  const currentAccount = useGetCurrentAccount();

  return useCallback(async () => {
    if (!currentAccount?.address) return;
    return await apiController.getTransactions(currentAccount.address);
  }, [currentAccount, apiController]);
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
      currentAccount.id,
    ]
  );
};
