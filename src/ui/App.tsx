import ReactLoading from "react-loading";
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
import { excludeKeysFromObj } from "@/shared/utils";
import i18n from "../shared/locales/i18n";
import PortMessage from "@/shared/utils/message/portMessage";
import { ss } from "./utils";

export default function App() {
  const [router, setRouter] = useState<Router>(authenticatedRouter);
  const { isReady, isUnlocked, updateAppState } = useAppState(
    ss(["isReady", "isUnlocked", "updateAppState"])
  );

  const { updateControllers } = useControllersState(ss(["updateControllers"]));

  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));

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
        ...excludeKeysFromObj(appState, ["isReady", "isUnlocked", "password"]),
      });
    }
  }, [updateWalletState, updateAppState, updateControllers]);

  useEffect(() => {
    const pm = new PortMessage().connect("popup");
    //eslint-disable-next-line @typescript-eslint/no-floating-promises
    pm.listen(async (data: { method: string; params: any[]; type: string }) => {
      if (data.type !== "broadcast" || !isReady || !isUnlocked) {
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
  }, [isReady, isUnlocked, updateAppState, updateWalletState]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!isReady) setupApp();
    else if (isReady && isUnlocked) setRouter(authenticatedRouter);
    else setRouter(guestRouter);
  }, [isReady, isUnlocked, router, setRouter, setupApp]);

  return (
    <div>
      <div className="uppercase text-center hidden standard:block font-medium text-xl mb-6 select-none">
        nintondo
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
