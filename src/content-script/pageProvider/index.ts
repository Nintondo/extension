import { ethErrors, serializeError } from "eth-rpc-errors";
import { EventEmitter } from "events";

import BroadcastChannelMessage from "@/shared/utils/message/broadcastChannelMessage";

import PushEventHandlers from "./pushEventHandlers";
import ReadyPromise from "./readyPromise";
import { $, domReadyCall } from "./utils";
import type {
  SendBEL,
  SignPsbtOptions,
} from "@/background/services/keyring/types";
import { INintondoProvider, NetworkType } from "nintondo-sdk";

const script = document.currentScript;
const channelName = script?.getAttribute("channel") || "NINTONDOWALLET";

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

interface NintondoProviderProps {
  maxListeners?: number;
  onInit?: () => void;
}

export class NintondoProvider
  extends EventEmitter
  implements INintondoProvider
{
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

  constructor({ maxListeners = 100, onInit }: NintondoProviderProps) {
    super();
    this.setMaxListeners(maxListeners);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.initialize(onInit);
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async (onInit?: () => void) => {
    document.addEventListener(
      "visibilitychange",
      this._requestPromiseCheckVisibility
    );

    this._bcm.connect().on("message", this._handleBackgroundMessage);
    domReadyCall(async () => {
      const origin = window.top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name =
        document.title ||
        ($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
        origin;

      try {
        await this._bcm.request({
          method: "tabCheckin",
          params: { icon, name, origin },
        });
        if (onInit) {
          onInit();
        }
      } catch {
        //
      }
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
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === "visible") {
      this._requestPromise.check(1);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({
    event,
    data,
  }: {
    event: string;
    data: any;
  }) => {
    if (
      this._pushEventHandlers[event as keyof typeof this._pushEventHandlers]
    ) {
      return (
        this._pushEventHandlers[
          event as keyof typeof this._pushEventHandlers
        ] as any
      )(data);
    }

    this.emit(event, data);
  };

  _request = async (data: any) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(async () => {
      try {
        return await this._bcm.request(data);
      } catch (e) {
        throw serializeError(e);
      }
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

  createTx = async (data: SendBEL) => {
    return this._request({
      method: "createTx",
      params: {
        ...data,
      },
    });
  };

  signMessage = async (text: string) => {
    return this._request({
      method: "signMessage",
      params: {
        text,
      },
    });
  };

  calculateFee = async (hex: string, feeRate: number) => {
    return this._request({
      method: "calculateFee",
      params: {
        hex,
        feeRate,
      },
    });
  };

  signPsbt = async (psbtBase64: string, options?: SignPsbtOptions) => {
    return this._request({
      method: "signPsbt",
      params: {
        psbtBase64,
        options,
      },
    });
  };

  inscribeTransfer = async (tick: string) => {
    return this._request({
      method: "inscribeTransfer",
      params: {
        tick,
      },
    });
  };

  multiPsbtSign = async (
    data: { psbtBase65: string; options: SignPsbtOptions }[]
  ) => {
    return this._request({
      method: "multiPsbtSign",
      params: {
        data,
      },
    });
  };

  getVersion = async () => {
    return this._request({
      method: "getVersion",
    });
  };

  switchNetwork = async (data: { network: NetworkType }) => {
    return this._request({
      method: "switchNetwork",
      params: { data },
    });
  };

  getNetwork = async () => {
    return this._request({
      method: "getNetwork",
    });
  };
}

declare global {
  interface Window {
    nintondo: INintondoProvider;
  }
}

const provider = new NintondoProvider({
  onInit: () => {
    Object.defineProperty(window, "nintondo", {
      value: new Proxy(provider, {
        deleteProperty: () => true,
      }),
      writable: false,
    });
    window.dispatchEvent(new Event("nintondo#initialized"));
  },
});
