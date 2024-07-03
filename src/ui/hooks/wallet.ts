import type { INewWalletProps, IWallet } from "@/shared/interfaces";
import { useControllersState } from "../states/controllerState";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "../states/walletState";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useTransactionManagerContext } from "../utils/tx-ctx";
import { Network } from "belcoinjs-lib";
import { useAppState } from "../states/appState";
import { ss } from "../utils";

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

    await updateWalletState(
      {
        wallets: newWallets,
      },
      false
    );

    await updateWalletState(
      {
        selectedAccount: 0,
        selectedWallet: wallet.id,
      },
      true
    );

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

    await updateWalletState(
      {
        wallets: newWallets,
      },
      false
    );

    await updateWalletState(
      {
        selectedAccount:
          updatedWallet.accounts[updatedWallet.accounts.length - 1].id,
      },
      true
    );

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
    await updateWalletState({ wallets }, false);
    await updateWalletState(
      {
        selectedWallet: wallet.id,
        selectedAccount: accKey ?? 0,
      },
      true
    );
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
  const { setCurrentPage } = useTransactionManagerContext();

  return async (id: number) => {
    await updateWalletState(
      {
        selectedAccount: id,
      },
      true
    );

    await notificationController.changedAccount();
    navigate("/");
    setCurrentPage(1);
  };
};

export const useUpdateCurrentAccountBalance = () => {
  const { apiController } = useControllersState(ss(["apiController"]));
  const currentAccount = useGetCurrentAccount();

  const { updateSelectedAccount } = useWalletState(
    ss(["updateSelectedAccount"])
  );

  return async () => {
    if (currentAccount?.address === undefined) return;

    const { count, amount, balance } = (await apiController.getAccountStats(
      currentAccount!.address!
    )) ?? { amount: 0, count: 0, balance: 0 };
    await updateSelectedAccount(
      {
        balance: balance,
        inscriptionCounter: count,
        inscriptionBalance: amount / 10 ** 8,
      },
      true
    );
  };
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
    await updateWalletState(
      {
        wallets: newWallets,
        selectedAccount,
        selectedWallet,
      },
      false
    );
    await notificationController.changedAccount();
  };
};

export const useSwitchNetwork = () => {
  const navigate = useNavigate();
  const { updateAppState } = useAppState(ss(["updateAppState"]));
  const { updateWalletState, selectedWallet, wallets } = useWalletState(
    ss(["updateWalletState", "selectedWallet", "wallets"])
  );
  const { walletController, notificationController } = useControllersState(
    ss(["walletController", "notificationController"])
  );

  return async (network: Network) => {
    if (selectedWallet === undefined) return;
    const updatedWallets = wallets;
    await Promise.all([
      updateAppState({ network }, true),
      walletController.switchNetwork(network),
    ]);
    updatedWallets[selectedWallet].accounts =
      await walletController.loadAccountsData(
        selectedWallet,
        updatedWallets[selectedWallet].accounts
      );
    await updateWalletState({ wallets: updatedWallets }, true);
    await notificationController.switchedNetwork(network);
    navigate("/");
  };
};
