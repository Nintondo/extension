import type { IAppStateBase, IWalletStateBase } from "@/shared/types";
import { networks } from "belcoinjs-lib";

export function emptyWalletState(): IWalletStateBase {
  return {
    wallets: [],
    vaultIsEmpty: true,
  };
}

export function emptyAppState(): IAppStateBase {
  return {
    isReady: false,
    isUnlocked: false,
    addressBook: [],
    language: "en",
    network: networks.bellcoin,
  };
}
