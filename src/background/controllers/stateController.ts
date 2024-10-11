import type { IAppStateBase } from "@/shared/types";
import type { IStateController } from "@/shared/types/stateController";
import { storageService } from "../services";
import type { IWalletState } from "@/ui/states/walletState";

class StateController implements IStateController {
  async init() {
    return await storageService.init();
  }

  async updateAppState(state: Partial<IAppStateBase>) {
    await storageService.updateAppState(state);
  }

  async updateWalletState(state: Partial<IWalletState>) {
    await storageService.updateWalletState(state);
  }

  async clearPendingWallet() {
    await storageService.clearPendingWallet();
  }

  async getPendingWallet() {
    return await storageService.getPendingWallet();
  }

  async getWalletPhrase(index: number, password: string) {
    return await storageService.getWalletPhrase(index, password);
  }

  async getAppState() {
    return storageService.appState;
  }

  async getWalletState() {
    return storageService.walletState;
  }
}

export default new StateController();
