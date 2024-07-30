import type { INewWalletProps, IWallet } from "@/shared/interfaces";
import { useControllersState } from "../states/controllerState";
import { useGetCurrentWallet, useWalletState } from "../states/walletState";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { Network } from "belcoinjs-lib";
import { ss } from "../utils";
import { useCallback } from "react";

export const useCreateNewWallet = () => {
  const { wallets, updateWalletState } = useWalletState(
    ss(["wallets", "updateWalletState"])
  );
  const { walletController, keyringController, notificationController } =
    useControllersState(
      ss(["walletController", "keyringController", "notificationController"])
    );
  const navigate = useNavigate();

  return async (props: INewWalletProps) => {
    const wallet = await walletController.createNewWallet(props);
    const keyring = await keyringController.serializeKeyringById(wallet.id);
    const newWallets = [...wallets, wallet];
    await walletController.saveWallets({
      phrases: [{ id: wallet.id, phrase: props.payload, data: keyring }],
      wallets: newWallets,
    });

    await updateWalletState({
      wallets: newWallets,
      selectedAccount: 0,
      selectedWallet: wallet.id,
    });

    await notificationController.changedAccount();
    navigate("/");
  };
};

export const useCreateNewAccount = () => {
  const { updateWalletState, wallets } = useWalletState(
    ss(["updateWalletState", "wallets"])
  );
  const currentWallet = useGetCurrentWallet();
  const { walletController, notificationController } = useControllersState(
    ss(["walletController", "notificationController"])
  );
  const navigate = useNavigate();

  return async (name?: string) => {
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

    const newWallets = wallets.map((f) =>
      f.id === currentWallet.id ? updatedWallet : f
    );

    await walletController.saveWallets({
      wallets: newWallets,
    });

    await updateWalletState({
      wallets: newWallets,
      selectedAccount:
        updatedWallet.accounts[updatedWallet.accounts.length - 1].id,
    });

    await notificationController.changedAccount();
    navigate("/");
  };
};

export const useSwitchWallet = () => {
  const { wallets, updateWalletState } = useWalletState(
    ss(["wallets", "updateWalletState"])
  );
  const { walletController, notificationController } = useControllersState(
    ss(["walletController", "notificationController"])
  );
  const navigate = useNavigate();

  return async (key: number, accKey?: number) => {
    const wallet = wallets.find((f) => f.id === key);
    if (!wallet) return;
    if (wallets[key].accounts.filter((i) => !!i.address).length === 0) {
      wallets[key].accounts = await walletController.loadAccountsData(
        wallet.id,
        wallet.accounts
      );
    }
    await updateWalletState({
      selectedWallet: wallet.id,
      selectedAccount: accKey ?? 0,
      wallets,
    });
    await notificationController.changedAccount();
    navigate("/");
  };
};

export const useSwitchAccount = () => {
  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));
  const navigate = useNavigate();
  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

  return async (id: number) => {
    await updateWalletState({
      selectedAccount: id,
    });

    await notificationController.changedAccount();
    navigate("/");
  };
};

export const useUpdateCurrentAccountBalance = () => {
  const { apiController } = useControllersState(ss(["apiController"]));

  const { updateSelectedAccount, wallets, selectedAccount, selectedWallet } =
    useWalletState(
      ss([
        "updateSelectedAccount",
        "selectedAccount",
        "selectedWallet",
        "wallets",
      ])
    );

  return useCallback(async () => {
    if (selectedWallet === undefined || selectedAccount === undefined) return;

    const currentAccount = wallets[selectedWallet].accounts[selectedAccount];
    if (currentAccount?.address === undefined) return;

    const { count, amount, balance } = (await apiController.getAccountStats(
      currentAccount!.address!
    )) ?? { amount: 0, count: 0, balance: 0 };
    if (
      currentAccount.balance !== balance ||
      currentAccount.inscriptionBalance !== amount / 10 ** 8
    ) {
      await updateSelectedAccount({
        balance: balance,
        inscriptionCounter: count,
        inscriptionBalance: amount / 10 ** 8,
      });
    }
  }, [
    apiController,
    updateSelectedAccount,
    selectedAccount,
    selectedWallet,
    wallets,
  ]);
};

export const useDeleteWallet = () => {
  const { walletController, notificationController } = useControllersState(
    (v) => ({
      walletController: v.walletController,
      notificationController: v.notificationController,
    })
  );
  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));
  const { wallets } = useWalletState(ss(["wallets"]));

  return async (id: number) => {
    if (wallets.length === 1) {
      toast.error(t("hooks.wallet.last_wallet_error"));
      return;
    }

    const {
      wallets: newWallets,
      selectedAccount,
      selectedWallet,
    } = await walletController.deleteWallet(id);

    if (typeof selectedWallet === "undefined")
      throw Error("Internal Error: Selected wallet is not defined");

    if (
      newWallets[selectedWallet].accounts.filter((i) => !!i.address).length ===
      0
    ) {
      newWallets[selectedWallet].accounts =
        await walletController.loadAccountsData(
          selectedWallet,
          newWallets[selectedWallet].accounts
        );
    }
    await updateWalletState({
      wallets: newWallets,
      selectedAccount,
      selectedWallet,
    });
    await notificationController.changedAccount();
  };
};

export const useSwitchNetwork = () => {
  const navigate = useNavigate();
  const { selectedWallet } = useWalletState(ss(["selectedWallet"]));
  const { walletController } = useControllersState(ss(["walletController"]));

  return async (network: Network) => {
    if (selectedWallet === undefined) return;
    await walletController.switchNetwork(network);
    navigate("/");
  };
};
