import type { IAppStateBase } from "@/shared/interfaces";
import type { IStateController } from "@/shared/interfaces/stateController";
import { storageService } from "../services";
import type { IWalletState } from "@/ui/states/walletState";

class StateController implements IStateController {
  async init() {
    return await storageService.init();
  }

  async updateAppState(state: Partial<IAppStateBase>, updateFront = true) {
    await storageService.updateAppState(state, updateFront);
  }

  async updateWalletState(state: Partial<IWalletState>, updateFront = true) {
    await storageService.updateWalletState(state, updateFront);
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
