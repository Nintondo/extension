import { Network, networks } from "belcoinjs-lib";
import { AddressType } from "bellhdw/src/hd/types";

export const KEYRING_TYPE = {
  HdKeyring: "HD Key Tree",
  SimpleKeyring: "Simple Key Pair",
  Empty: "Empty",
};

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);

export const IS_WINDOWS = /windows/i.test(navigator.userAgent);

export const NETOWRKS: { name: string; network: Network }[] = [
  { name: "MAINNET", network: networks.bellcoin },
  { name: "TESTNET", network: networks.testnet },
];

export const ADDRESS_TYPES: {
  value: AddressType;
  label: string;
  name: string;
  hdPath: string;
}[] = [
  {
    value: AddressType.P2WPKH,
    label: "P2WPKH",
    name: "Native Segwit (P2WPKH)",
    hdPath: "m/84'/0'/0'/0",
  },
  {
    value: AddressType.P2PKH,
    label: "P2PKH",
    name: "Legacy (P2PKH)",
    hdPath: "m/44'/0'/0'/0",
  },
  {
    value: AddressType.P2TR,
    label: "P2TR",
    name: "Taproot (P2TR)",
    hdPath: "m/86'/0'/0'/0",
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
  process.env.API_URL ?? "https://electrs.nintondo.io/api";

export const PREVIEW_URL =
  process.env.PREVIEW_URL ?? "https://content.nintondo.io/api/pub/preview";
export const HTML_PREVIEW_URL =
  process.env.PREVIEW_URL ?? "https://content.nintondo.io/api/pub/html";
export const CONTENT_URL =
  process.env.CONTENT_URL ?? "https://content.nintondo.io/api/pub";
export const HISTORY_URL =
  process.env.HISTORY_URL ?? "https://history.nintondo.io/pub";

export const NINTONDO_URL = process.env.NINTONDO_URL ?? "https://nintondo.io";

export const TESTNET_NINTONDO_API_URL =
  process.env.TESTNET_API_URL ?? "https://testnet.nintondo.io/electrs";

export const TESTNET_PREVIEW_URL =
  process.env.TESTNET_PREVIEW_URL ??
  "https://testnet.nintondo.io/api/pub/preview";
export const TESTNET_HTML_PREVIEW_URL =
  process.env.TESTNET_HTML_URL ?? "https://testnet.nintondo.io/api/pub/html";
export const TESTNET_CONTENT_URL =
  process.env.TESTNET_CONTENT_URL ?? "https://testnet.nintondo.io/api/pub";
export const TESTNET_HISTORY_URL =
  process.env.TESTNET_HISTORY_URL ?? "https://testnet.nintondo.io/history/pub";

export const DEFAULT_FEES = {
  fast: 5000,
  slow: 2000,
};

export const DEFAULT_SERVICE_FEE = 1_000_000;

export const DEFAULT_HD_PATH = "m/44'/0'/0'/0";
