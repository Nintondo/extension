import { RouterProvider } from "react-router-dom";
import { Router } from "@remix-run/router";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  setupKeyringProxy,
  setupNotificationProxy,
  setupOpenAPIProxy,
  setupStateProxy,
  setupWalletProxy,
} from "@/ui/utils/setup";
import { useAppState } from "./states/appState";
import { useWalletState } from "./states/walletState";
import { guestRouter, authenticatedRouter } from "@/ui/pages/router";
import { useControllersState } from "./states/controllerState";
import i18n from "../shared/locales/i18n";
import PortMessage from "@/shared/utils/message/portMessage";
import { ss } from "./utils";
import { useInscriptionManagerContext } from "./utils/inscriptions-ctx";
import { TailSpin } from "react-loading-icons";

export default function App() {
  const [router, setRouter] = useState<Router>(authenticatedRouter);
  const { isReady, isUnlocked, updateAppState } = useAppState(
    ss(["isReady", "isUnlocked", "updateAppState"])
  );

  const { updateControllers } = useControllersState(ss(["updateControllers"]));
  const { updateWalletState, selectedAccount, selectedWallet } = useWalletState(
    ss(["updateWalletState", "selectedWallet", "selectedAccount"])
  );
  const { resetProvider } = useInscriptionManagerContext();

  const setupApp = useCallback(async () => {
    const walletController = setupWalletProxy();
    const apiController = setupOpenAPIProxy();
    const stateController = setupStateProxy();
    const keyringController = setupKeyringProxy();
    const notificationController = setupNotificationProxy();

    updateControllers({
      walletController,
      apiController,
      stateController,
      keyringController,
      notificationController,
    });

    const [appState, walletState] = await stateController.init();
    await i18n.changeLanguage(appState.language ?? "en");

    if (!appState.isReady) {
      walletState.vaultIsEmpty = await walletController.isVaultEmpty();
      appState.isReady = true;

      await updateAppState({
        isReady: true,
      });
      await updateWalletState({
        vaultIsEmpty: walletState.vaultIsEmpty,
      });
      await updateAppState(
        {
          isReady: true,
        },
        false
      );
    }

    await updateWalletState(walletState, false);
    await updateAppState(appState, false);
  }, [updateWalletState, updateAppState, updateControllers]);

  useEffect(() => {
    const pm = new PortMessage().connect("popup");
    //eslint-disable-next-line @typescript-eslint/no-floating-promises
    pm.listen(async (data: { method: string; params: any[]; type: string }) => {
      if (data.type !== "broadcast") {
        return;
      }
      if (data.method === "updateFromAppState") {
        await updateAppState(data.params[0], false);
      } else if (data.method === "updateFromWalletState") {
        await updateWalletState(data.params[0], false);
      }
    });
    return () => {
      pm.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!isReady) setupApp();
    else if (isReady && isUnlocked) setRouter(authenticatedRouter);
    else setRouter(guestRouter);
  }, [isReady, isUnlocked, router, setRouter, setupApp]);

  useEffect(() => {
    resetProvider();
  }, [selectedAccount, selectedWallet, resetProvider]);

  return (
    <div>
      <div className="uppercase text-center hidden standard:block font-medium text-xl mb-6 select-none">
        nintondo
      </div>
      <div className="app">
        {isReady ? <RouterProvider router={router} /> : <TailSpin />}
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
