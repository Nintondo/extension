import { EVENTS } from "@/shared/constant";
import eventBus from "@/shared/eventBus";
import { Message } from "@/shared/utils/message";
import { sessionService } from "@/background/services";
import {
  browserRuntimeOnConnect,
  browserRuntimeOnInstalled,
} from "@/shared/utils/browser";
import walletController from "./controllers/walletController";
import apiController from "./controllers/apiController";
import stateController from "./controllers/stateController";
import { keyringController } from "./controllers";
import { providerController } from "./controllers";
import notificationController from "./controllers/notificationController";

const { PortMessage } = Message;

// for page provider
browserRuntimeOnConnect((port: any) => {
  if (
    port.name === "popup" ||
    port.name === "notification" ||
    port.name === "tab"
  ) {
    const pm = new PortMessage(port);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    pm.listen((data: any) => {
      if (!data.method) return;

      if (data?.type) {
        switch (data.type) {
          case "broadcast":
            eventBus.emit(data.method, data.params);
            break;
          case "openapi":
            return (
              apiController[data.method as keyof typeof apiController] as any
            )(...data.params);
          case "keyring":
            return (
              keyringController[
                data.method as keyof typeof keyringController
              ] as any
            )(...data.params);
          case "state":
            return (
              stateController[
                data.method as keyof typeof stateController
              ] as any
            )(...data.params);
          case "notification":
            return (
              notificationController[
                data.method as keyof typeof notificationController
              ] as any
            )(...data.params);
          default:
            if (!walletController[data.method as keyof typeof walletController])
              throw new Error(
                `Method ${data.method} is not founded in the walletController`
              );
            return (
              walletController[
                data.method as keyof typeof walletController
              ] as any
            )(...data.params);
        }
      }
    });

    const broadcastCallback = async (data: any) => {
      await pm.request({
        type: "broadcast",
        method: data.method,
        params: data.params,
      });
    };

    eventBus.addEventListener(EVENTS.broadcastToUI, broadcastCallback);
    port.onDisconnect.addListener(() => {
      eventBus.removeEventListener(EVENTS.broadcastToUI, broadcastCallback);
    });

    return;
  }

  const pm = new PortMessage(port);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  pm.listen(async (data: { method: string; params: any }) => {
    const sessionId = port.sender?.tab?.id;
    if (data.method === "tabCheckin") {
      sessionService.createSession(sessionId, data.params);
      return;
    }
    const session = sessionService.getSession(sessionId);
    if (!session) throw new Error("Session was not initialized");

    const req = { data, session };
    // for background push to respective page
    req.session.pushMessage = (event, data) => {
      pm.send("message", { event, data });
    };

    return providerController(req);
  });

  port.onDisconnect.addListener(() => {
    // todo
  });
});

const addAppInstalledEvent = () => {
  // openExtensionInTab();
  return;
};

browserRuntimeOnInstalled((details: { reason: string }) => {
  if (details.reason === "install") {
    addAppInstalledEvent();
  }
});

const INTERNAL_STAYALIVE_PORT = "CT_Internal_port_alive";
let alivePort: any = null;

setInterval(async () => {
  if (alivePort == null) {
    alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

    alivePort.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        //
      } else {
        //
      }

      alivePort = null;
    });
  }

  if (alivePort) {
    alivePort.postMessage({ content: "keep alive~" });

    if (chrome.runtime.lastError) {
      //
    } else {
      //
    }
  }
}, 5000);
