import type {
  IAppStateBase,
  IWalletState,
  IWalletStateBase,
} from "@/shared/interfaces";
import type { IStateController } from "@/shared/interfaces/stateController";
import { storageService } from "../services";

class StateController implements IStateController {
  async init(): Promise<void> {
    await storageService.init();
  }

  async updateAppState(state: Partial<IAppStateBase>): Promise<void> {
    await storageService.updateAppState(state);
  }

  async updateWalletState(state: Partial<IWalletState>): Promise<void> {
    await storageService.updateWalletState(state);
  }

  async clearPendingWallet(): Promise<void> {
    await storageService.clearPendingWallet();
  }

  async getPendingWallet(): Promise<string | undefined> {
    return await storageService.getPengingWallet();
  }

  async getWalletPhrase(index: number, password: string): Promise<string> {
    return await storageService.getWalletPhrase(index, password);
  }

  async getAppState(): Promise<IAppStateBase> {
    return storageService.appState;
  }

  async getWalletState(): Promise<IWalletStateBase> {
    return storageService.walletState;
  }
}

export default new StateController();
