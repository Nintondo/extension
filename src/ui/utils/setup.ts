import { EVENTS } from "@/shared/constant";
import eventBus from "@/shared/eventBus";
import { Message } from "@/shared/utils/message";
import { IWalletController } from "@/shared/interfaces";
import { IStateController } from "@/shared/interfaces/stateController";
import { useControllersState } from "../states/controllerState";
import { useCallback } from "react";
import { useAppState } from "../states/appState";
import { useWalletState } from "../states/walletState";
import { INotificationController } from "@/shared/interfaces/notification";
import { IApiController } from "@/background/controllers/apiController";
import { IKeyringController } from "@/background/controllers/keyringController";

function setupPm() {
  const { PortMessage } = Message;
  const portMessageChannel = new PortMessage();
  portMessageChannel.connect("popup");

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  portMessageChannel.listen(
    (data: { method: string; params: any[]; type: string }) => {
      if (data.type === "broadcast") {
        eventBus.emit(data.method, data.params);
      }
    }
  );

  eventBus.addEventListener(
    EVENTS.broadcastToBackground,
    async (data: { method: string; data: any }) => {
      await portMessageChannel.request({
        type: "broadcast",
        method: data.method,
        params: data.data,
      });
    }
  );

  return portMessageChannel;
}

const portMessageChannel = setupPm();

type AvailableType =
  | "controller"
  | "openapi"
  | "state"
  | "keyring"
  | "notification";

function setupProxy<T>(type: AvailableType): T {
  const wallet: Record<string, any> = new Proxy(
    {},
    {
      get(_obj, key) {
        return function (...params: any) {
          return portMessageChannel.request({
            type: type,
            method: key,
            params,
          });
        };
      },
    }
  );
  return wallet as T;
}

export function setupWalletProxy() {
  return setupProxy<IWalletController>("controller");
}

export function setupOpenAPIProxy() {
  return setupProxy<IApiController>("openapi");
}

export function setupStateProxy() {
  return setupProxy<IStateController>("state");
}

export function setupKeyringProxy() {
  return setupProxy<IKeyringController>("keyring");
}

export function setupNotificationProxy() {
  return setupProxy<INotificationController>("notification");
}

export function useSyncStorages() {
  const { stateController } = useControllersState((v) => ({
    stateController: v.stateController,
  }));
  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState,
  }));
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));

  return useCallback(async () => {
    const appState = await stateController.getAppState();
    const walletState = await stateController.getWalletState();

    await updateAppState(appState);
    await updateWalletState(walletState);

    return {
      appState,
      walletState,
    };
  }, [stateController, updateAppState, updateWalletState]);
}
