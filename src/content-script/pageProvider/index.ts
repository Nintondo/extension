// this script is injected into webpage's context
import { ethErrors, serializeError } from "eth-rpc-errors";
import { EventEmitter } from "events";

import BroadcastChannelMessage from "@/shared/utils/message/broadcastChannelMessage";

import PushEventHandlers from "./pushEventHandlers";
import ReadyPromise from "./readyPromise";
import { $, domReadyCall } from "./utils";
import type { SendTDC } from "@/background/services/keyring/types";

const script = document.currentScript;
const channelName = script?.getAttribute("channel") || "TIDEWALLET";

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export class BellsProvider extends EventEmitter {
  _selectedAddress: string | null = null;
  _network: string | null = null;
  _isConnected = false;
  _initialized = false;
  _isUnlocked = false;

  _state: StateProvider = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false,
  };

  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(0);

  private _bcm = new BroadcastChannelMessage(channelName);

  constructor({ maxListeners = 100 } = {}) {
    super();
    this.setMaxListeners(maxListeners);
    this.initialize();
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async () => {
    document.addEventListener(
      "visibilitychange",
      this._requestPromiseCheckVisibility
    );

    this._bcm.connect().on("message", this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = window.top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name =
        document.title ||
        ($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
        origin;

      this._bcm.request({
        method: "tabCheckin",
        params: { icon, name, origin },
      });

      // Do not force to tabCheckin
      // this._requestPromise.check(2);
    });

    try {
      const { network, accounts, isUnlocked }: any = await this._request({
        method: "getProviderState",
      });
      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.emit("connect", {});
      this._pushEventHandlers.networkChanged({
        network,
      });

      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit("_initialized");
    }

    this.keepAlive();
  };

  /**
   * Sending a message to the extension to receive will keep the service worker alive.
   */
  private keepAlive = async () => {
    await this._request({
      method: "keepAlive",
      params: {},
    });
    return setTimeout(() => {
      this.keepAlive();
    }, 1000);
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === "visible") {
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    if (this._pushEventHandlers[event]) {
      return this._pushEventHandlers[event](data);
    }

    this.emit(event, data);
  };

  _request = async (data) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      return this._bcm
        .request(data)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          throw serializeError(err);
        });
    });
  };

  // public methods
  connect = async () => {
    return this._request({
      method: "connect",
    });
  };

  getBalance = async () => {
    return this._request({
      method: "getBalance",
    });
  };

  getAccountName = async () => {
    return this._request({
      method: "getAccountName",
    });
  };

  isConnected = async () => {
    return this._request({
      method: "isConnected",
    });
  };

  getAccount = async () => {
    return this._request({
      method: "getAccount",
    });
  };

  getPublicKey = async () => {
    return this._request({
      method: "getPublicKey",
    });
  };

  createTx = async (data: SendTDC) => {
    return this._request({
      method: "createTx",
      params: {
        ...data,
      },
    });
  };

  // getNetwork = async () => {
  //   return this._request({
  //     method: "getNetwork",
  //   });
  // };

  // switchNetwork = async (network: string) => {
  //   return this._request({
  //     method: "switchNetwork",
  //     params: {
  //       network,
  //     },
  //   });
  // };

  // getAccounts = async () => {
  //   return this._request({
  //     method: "getAccounts",
  //   });
  // };

  // getPublicKey = async () => {
  //   return this._request({
  //     method: "getPublicKey",
  //   });
  // };

  // getBalance = async () => {
  //   return this._request({
  //     method: "getBalance",
  //   });
  // };

  // getInscriptions = async (cursor = 0, size = 20) => {
  //   return this._request({
  //     method: "getInscriptions",
  //     params: {
  //       cursor,
  //       size,
  //     },
  //   });
  // };

  signMessage = async (text: string) => {
    return this._request({
      method: "signMessage",
      params: {
        text,
      },
    });
  };

  signTx = async (hex: string) => {
    return this._request({
      method: "signTx",
      params: {
        hex,
      },
    });
  };

}

declare global {
  interface Window {
    bells: BellsProvider;
  }
}

const provider = new BellsProvider();

Object.defineProperty(window, "bells", {
  value: new Proxy(provider, {
    deleteProperty: () => true,
  }),
  writable: false,
});

window.dispatchEvent(new Event("bells#initialized"));
