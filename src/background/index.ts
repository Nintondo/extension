import { EVENTS } from "@/shared/constant";
import eventBus from "@/shared/eventBus";
import { Message } from "@/shared/utils/message";
import { sessionService, storageService } from "@/background/services";
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
import { fetchBELLMainnet } from "@/shared/utils";

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
            return apiController[data.method].apply(null, data.params);
          case "keyring":
            return keyringController[data.method].apply(null, data.params);
          case "state":
            return stateController[data.method].apply(null, data.params);
          case "notification":
            return notificationController[data.method].apply(null, data.params);
          default:
            if (!walletController[data.method])
              throw new Error(
                `Method ${data.method} is not founded in the walletController`
              );
            return walletController[data.method].apply(null, data.params);
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
  pm.listen(async (data) => {
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

browserRuntimeOnInstalled((details) => {
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

  if (
    storageService.currentAccount !== undefined &&
    storageService.currentAccount.address !== undefined
  ) {
    storageService.currentAccount.balance = (
      await fetchBELLMainnet<
        { amount: number; count: number; balance: number } | undefined
      >({
        path: `/address/${storageService.currentAccount.address}/stats`,
      })
    ).balance;
  }
}, 5000);

// setInterval(async () => {
//   const unpushedHexes = JSON.parse(localStorage.getItem("topush")) as string[];
//   console.log(unpushedHexes);
//   const failedToPush: string[] = [];
//   for (const hex of unpushedHexes) {
//     const txid = (await apiController.pushTx(hex)).txid ?? "";
//     if (txid.length !== 64 || txid.includes("RPC error"))
//       failedToPush.push(hex);
//   }
//   if (failedToPush.length)
//     localStorage.setItem("topush", JSON.stringify(failedToPush));
// }, 1000);
