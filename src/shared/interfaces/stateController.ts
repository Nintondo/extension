import type { IAppStateBase, IWalletState, IWalletStateBase } from ".";

export interface IStateController {
  init(): Promise<[IAppStateBase, IWalletStateBase]>;
  updateAppState(state: Partial<IAppStateBase>): Promise<void>;
  updateWalletState(state: Partial<IWalletState>): Promise<void>;
  getAppState(): Promise<IAppStateBase>;
  getWalletState(): Promise<IWalletStateBase>;
  getWalletPhrase(index: number, password: string): Promise<string | undefined>;
  clearPendingWallet(): Promise<void>;
  getPendingWallet(): Promise<string | undefined>;
}
