import { ethErrors } from "eth-rpc-errors";
import { EthereumProviderError } from "eth-rpc-errors/dist/classes";
import Events from "events";
import { event, remove, openNotification } from "../webapi";
import { IS_CHROME, IS_LINUX } from "@/shared/constant";
import {
  Approval,
  ApprovalData,
  OpenNotificationProps,
} from "@/shared/interfaces/notification";

// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends Events {
  approval: Approval | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    super();

    event.on("windowRemoved", (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.rejectApproval();
      }
    });

    event.on("windowFocusChange", (winId: number) => {
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        if (IS_CHROME && winId === chrome.windows.WINDOW_ID_NONE && IS_LINUX) {
          // Wired issue: When notification popuped, will focus to -1 first then focus on notification
          return;
        }
        // this.rejectApproval();
      }
    });
  }

  getApproval = (): ApprovalData => {
    return { ...this.approval.data };
  };

  resolveApproval = async (data?: any, forceReject = false) => {
    let connectedSite = false;
    if (forceReject) {
      this.approval?.reject(new EthereumProviderError(4001, "User Cancel"));
    } else {
      this.approval?.resolve(data);
      if (this.approval.data.params.method === "connect") connectedSite = true;
    }
    this.approval = null;
    this.emit("resolve", data);
    await this.clear();
    return connectedSite;
  };

  rejectApproval = async (err?: string, stay = false, isInternal = false) => {
    if (!this.approval) return;
    if (isInternal) {
      this.approval?.reject(ethErrors.rpc.internal(err));
    } else {
      this.approval?.reject(ethErrors.provider.userRejectedRequest<any>(err));
    }

    await this.clear(stay);
    this.emit("reject", err);
  };

  // currently it only support one approval at the same time
  requestApproval = async (
    data?: any,
    winProps?: OpenNotificationProps
  ): Promise<any> => {
    // if (preferenceService.getPopupOpen()) {
    //   this.approval = null;
    //   throw ethErrors.provider.userRejectedRequest('please request after user close current popup');
    // }

    // We will just override the existing open approval with the new one coming in
    return new Promise((resolve, reject) => {
      this.approval = {
        data,
        resolve,
        reject,
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.openNotification(winProps);
    });
  };

  clear = async (stay = false) => {
    this.approval = null;
    if (this.notifiWindowId && !stay) {
      await remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
  };

  unLock = () => {
    this.isLocked = false;
  };

  lock = () => {
    this.isLocked = true;
  };

  openNotification = async (winProps: OpenNotificationProps) => {
    // if (this.isLocked) return;
    // this.lock();
    if (this.notifiWindowId) {
      await remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
    const winId = await openNotification(winProps);
    this.notifiWindowId = winId;
  };
}

export default new NotificationService();
