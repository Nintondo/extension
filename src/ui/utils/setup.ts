import { EVENTS } from "@/shared/constant";
import eventBus from "@/shared/eventBus";
import { Message } from "@/shared/utils/message";
import type { IWalletController } from "@/shared/interfaces";
import type { IStateController } from "@/shared/interfaces/stateController";
import type { INotificationController } from "@/shared/interfaces/notification";
import type { IApiController } from "@/background/controllers/apiController";
import type { IKeyringController } from "@/background/controllers/keyringController";

export function setupPm() {
  const { PortMessage } = Message;
  const portMessageChannel = new PortMessage();
  portMessageChannel.connect("popup");

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
