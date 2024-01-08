import type { IAppStateBase, IWalletStateBase } from "@/shared/interfaces";

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
    vault: [],
    addressBook: [],
    language: "en",
  };
}
