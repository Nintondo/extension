import type { IAppStateBase, IWalletState } from "@/shared/interfaces";
import type { IStateController } from "@/shared/interfaces/stateController";
import { storageService } from "../services";

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
    return await storageService.getPengingWallet();
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
