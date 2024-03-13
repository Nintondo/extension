import { AddressType } from "bellhdw/src/hd/types";

export const KEYRING_TYPE = {
  HdKeyring: "HD Key Tree",
  SimpleKeyring: "Simple Key Pair",
  Empty: "Empty",
};

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);

export const IS_WINDOWS = /windows/i.test(navigator.userAgent);

export const ADDRESS_TYPES: {
  value: AddressType;
  label: string;
  name: string;
  hdPath: string;
}[] = [
  // {
  //   value: AddressType.P2WPKH,
  //   label: "P2WPKH",
  //   name: "Native Segwit (P2WPKH)",
  //   hdPath: "m/84'/0'/0'/0",
  // },
  // {
  //   value: AddressType.P2SH_P2WPKH,
  //   label: "P2SH-P2WPKH",
  //   name: "Nested Segwit (P2SH-P2WPKH)",
  //   hdPath: "m/49'/0'/0'/0",
  // },
  {
    value: AddressType.P2PKH,
    label: "P2PKH",
    name: "Legacy (P2PKH)",
    hdPath: "m/44'/0'/0'/0",
  },
];

export const EVENTS = {
  broadcastToUI: "broadcastToUI",
  broadcastToBackground: "broadcastToBackground",
  SIGN_FINISHED: "SIGN_FINISHED",
  WALLETCONNECT: {
    STATUS_CHANGED: "WALLETCONNECT_STATUS_CHANGED",
    INIT: "WALLETCONNECT_INIT",
    INITED: "WALLETCONNECT_INITED",
  },
};

export const COIN_NAME = "BELL";
export const COIN_SYMBOL = "BELL";

export const SATS_DOMAIN = ".sats";

export const CHANNEL = "chrome";

export const NINTONDO_API_URL =
  process.env.REACT_APP_API_URL ?? "https://api.nintondo.io/api";
export const BELLS_API_URL = "https://bells.quark.blue";

export const PREVIEW_URL =
  process.env.REACT_APP_PREVIEW_URL ?? "https://static.nintondo.io/pub/preview";
export const HTML_PREVIEW_URL =
  process.env.REACT_APP_PREVIEW_URL ?? "https://static.nintondo.io/pub/html";
export const CONTENT_URL =
  process.env.REACT_APP_CONTENT_URL ?? "https://static.nintondo.io/pub/content";
