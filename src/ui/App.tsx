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

export default function App() {
  const [router, setRouter] = useState<Router>(authenticatedRouter);
  const { isReady, isUnlocked, updateAppState, setCurrentTab } = useAppState(
    (v) => ({
      isReady: v.isReady,
      isUnlocked: v.isUnlocked,
      updateAppState: v.updateAppState,
      setCurrentTab: v.setCurrentTab,
    })
  );

  const { updateControllers } = useControllersState((v) => ({
    updateControllers: v.updateControllers,
  }));

  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));

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

    await stateController.init();
    const appState = await stateController.getAppState();
    const walletState = await stateController.getWalletState();
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
        ...excludeKeysFromObj(appState, [
          "isReady",
          "isUnlocked",
          "password",
          "vault",
        ]),
      });
    }
  }, [updateWalletState, updateAppState, updateControllers]);

  const updateFromStore = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (request, sender, sendResponse) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setupApp();
      sendResponse();
    },
    [setupApp]
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(updateFromStore);
    return () => {
      chrome.runtime.onMessage.removeListener(updateFromStore);
    };
  }, [updateFromStore]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const tab = tabs[0];
        if (tab && tab.url) {
          setCurrentTab(tab.url.includes(chrome.runtime.id) ? tab : undefined);
        }
      });
    })();

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
    setCurrentTab,
  ]);

  return (
    <div>
      <div className="uppercase text-center hidden md:block font-medium text-xl mb-6 select-none">
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
