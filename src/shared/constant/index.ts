import { isTestnet } from "@/ui/utils";
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

const NINTONDO_API_URL =
  process.env.API_URL ?? "https://electrs.nintondo.io/api";

const CONTENT_URL =
  process.env.CONTENT_URL ?? "https://content.nintondo.io/api/pub";
const HISTORY_URL =
  process.env.HISTORY_URL ?? "https://history.nintondo.io/pub";

export const NINTONDO_URL = "https://nintondo.io";
export const SPLITTER_URL = NINTONDO_URL + "/belinals/splitter";

const TESTNET_NINTONDO_API_URL =
  process.env.TESTNET_API_URL ?? "https://testnet.nintondo.io/electrs";
const TESTNET_CONTENT_URL =
  process.env.TESTNET_CONTENT_URL ?? "https://testnet.nintondo.io/api/pub";

export const getContentUrl = (network: Network) =>
  isTestnet(network) ? TESTNET_CONTENT_URL : CONTENT_URL;

export const getApiUrl = (network: Network) =>
  isTestnet(network) ? TESTNET_NINTONDO_API_URL : NINTONDO_API_URL;

export const getHistoryUrl = (network: Network) =>
  isTestnet(network) ? TESTNET_HISTORY_URL : HISTORY_URL;

const TESTNET_HISTORY_URL =
  process.env.TESTNET_HISTORY_URL ?? "https://testnet.nintondo.io/history/pub";

export const DEFAULT_FEES = {
  fast: 5000,
  slow: 2000,
};

export const DEFAULT_SERVICE_FEE = 1_000_000;

export const DEFAULT_HD_PATH = "m/44'/0'/0'/0";
