import ReactLoading from "react-loading";
import { RouterProvider } from "react-router-dom";
import { Router } from "@remix-run/router";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  setupKeyringProxy,
  setupNotificationProxy,
  setupOpenAPIProxy,
  setupPm,
  setupStateProxy,
  setupWalletProxy,
} from "@/ui/utils/setup";
import { useAppState } from "./states/appState";
import { useWalletState } from "./states/walletState";
import { guestRouter, authenticatedRouter } from "@/ui/pages/router";
import { useControllersState } from "./states/controllerState";
import { excludeKeysFromObj } from "@/shared/utils";
import i18n from "../shared/locales/i18n";
import { networks } from "belcoinjs-lib";

export default function App() {
  const [router, setRouter] = useState<Router>(authenticatedRouter);
  const { isReady, isUnlocked, updateAppState } = useAppState((v) => ({
    isReady: v.isReady,
    isUnlocked: v.isUnlocked,
    updateAppState: v.updateAppState,
  }));

  const { updateControllers } = useControllersState((v) => ({
    updateControllers: v.updateControllers,
  }));

  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));

  const { stateController } = useControllersState((v) => ({
    stateController: v.stateController,
  }));
  const setupApp = useCallback(async () => {
    const stateController = setupStateProxy();
    const walletController = setupWalletProxy();
    const apiController = setupOpenAPIProxy();
    const keyringController = setupKeyringProxy();
    const notificationController = setupNotificationProxy();

    updateControllers({
      walletController,
      apiController,
      stateController,
      keyringController,
      notificationController,
    });

    await stateController.init();
    const appState = await stateController.getAppState();
    const walletState = await stateController.getWalletState();
    await i18n.changeLanguage(appState.language ?? "en");
    await apiController.setTestnet(
      (appState.network ?? networks.bellcoin).pubKeyHash === 33 &&
        (appState.network ?? networks.bellcoin).scriptHash === 22
    );
    if (
      appState.isReady &&
      appState.isUnlocked &&
      walletState.selectedWallet !== undefined
    ) {
      await updateWalletState(walletState, false);
      await updateAppState(appState, false);
    } else {
      await updateWalletState({
        vaultIsEmpty: await walletController.isVaultEmpty(),
        ...excludeKeysFromObj(walletState, ["vaultIsEmpty", "wallets"]),
      });
      await updateAppState({
        isReady: true,
        ...excludeKeysFromObj(appState, [
          "isReady",
          "isUnlocked",
          "password",
          "vault",
        ]),
      });
    }
  }, [updateWalletState, updateAppState, updateControllers]);

  const updateFromStore = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (isReady && isUnlocked) {
      const appState = await stateController.getAppState();
      const walletState = await stateController.getWalletState();
      await updateWalletState(walletState, false);
      await updateAppState(appState, false);
    }
  }, [isReady, isUnlocked, stateController, updateAppState, updateWalletState]);

  useEffect(() => {
    const pm = setupPm();
    //eslint-disable-next-line @typescript-eslint/no-floating-promises
    pm.listen((data: { method: string; params: any[]; type: string }) => {
      if (data.type === "broadcast") {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        if (data.method === "updateFromStore") updateFromStore();
      }
    });
    return () => {
      pm.removeAllListeners();
    };
  }, [updateFromStore]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!isReady) setupApp();
    else if (isReady && isUnlocked) setRouter(authenticatedRouter);
    else setRouter(guestRouter);
  }, [
    isReady,
    isUnlocked,
    updateWalletState,
    updateAppState,
    router,
    setRouter,
    setupApp,
  ]);

  return (
    <div>
      <div className="uppercase text-center hidden standard:block font-medium text-xl mb-6 select-none">
        Bells
      </div>
      <div className="app">
        {isReady ? (
          <RouterProvider router={router} />
        ) : (
          <ReactLoading type="spin" color="#ffbc42" />
        )}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "toast",
            success: {
              duration: 900,
              className: "toast success",
            },
            error: {
              duration: 4000,
              className: "toast error",
            },
          }}
        />
      </div>
    </div>
  );
}
