import type { IWalletState } from "@/ui/states/walletState";
import type { IAppStateBase, IWalletStateBase } from ".";

export interface IStateController {
  init(): Promise<[IAppStateBase, IWalletStateBase]>;
  updateAppState(
    state: Partial<IAppStateBase>,
    updateFront?: boolean
  ): Promise<void>;
  updateWalletState(
    state: Partial<IWalletState>,
    updateFront?: boolean
  ): Promise<void>;
  getAppState(): Promise<IAppStateBase>;
  getWalletState(): Promise<IWalletStateBase>;
  getWalletPhrase(index: number, password: string): Promise<string | undefined>;
  clearPendingWallet(): Promise<void>;
  getPendingWallet(): Promise<string | undefined>;
}
