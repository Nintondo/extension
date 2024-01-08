import type {
  ApprovalData,
  INotificationController,
} from "@/shared/interfaces/notification";
import {
  notificationService,
  permissionService,
  sessionService,
  storageService,
} from "../services";
import type { ConnectedSite } from "../services/permission";

class NotificationController implements INotificationController {
  async getApproval(): Promise<ApprovalData> {
    return notificationService.getApproval();
  }

  async rejectApproval(
    err?: string,
    stay = false,
    isInternal = false
  ): Promise<void> {
    await notificationService.rejectApproval(err, stay, isInternal);
  }

  async resolveApproval(data?: any, forceReject = false): Promise<void> {
    const password = storageService.appState.password;
    if (
      (await notificationService.resolveApproval(data, forceReject)) &&
      password
    ) {
      await storageService.saveWallets({
        wallets: storageService.walletState.wallets,
        password,
      });
    }
  }

  async changedAccount(): Promise<void> {
    permissionService.disconnectSites();
    sessionService.broadcastEvent(
      "accountsChanged",
      storageService.currentAccount
    );
  }

  async getConnectedSites(): Promise<ConnectedSite[]> {
    return permissionService.allSites;
  }

  async removeSite(origin: string): Promise<ConnectedSite[]> {
    const password = storageService.appState.password;
    if (password) {
      permissionService.removeSite(origin);
      await storageService.saveWallets({
        wallets: storageService.walletState.wallets,
        password,
      });
    }
    return permissionService.allSites;
  }
}

export default new NotificationController();
