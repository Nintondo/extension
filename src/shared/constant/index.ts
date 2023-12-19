/* eslint-disable quotes */

/* constants pool */
import { AddressType } from "bellhdw";
import { Chain } from "../types";

export enum CHAINS_ENUM {
  TDC = "TDC",
}

export const CHAINS: Record<string, Chain> = {
  [CHAINS_ENUM.TDC]: {
    name: "TDC",
    enum: CHAINS_ENUM.TDC,
    logo: "",
    network: "mainnet",
  },
};

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

export const SORT_WEIGHT = {
  [KEYRING_TYPE.HdKeyring]: 1,
  [KEYRING_TYPE.SimpleKeyring]: 2,
};

export const GASPRICE_RANGE = {
  [CHAINS_ENUM.TDC]: [0, 10000],
};

export const COIN_NAME = "TDC";
export const COIN_SYMBOL = "TDC";

export const COIN_DUST = 1000;

export const TO_LOCALE_STRING_CONFIG = {
  minimumFractionDigits: 8,
};

export const SATS_DOMAIN = ".sats";

export const CHANNEL = "chrome";

export const BELLS_API_URL = "https://bells.quark.blue/api";
export const TEST_API_URL = "http://65.109.171.29:3000";
export const BELLS_MAINNET_PATH = "";
