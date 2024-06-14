import { ethErrors } from "eth-rpc-errors";
import { EthereumProviderError } from "eth-rpc-errors/dist/classes";
import Events from "events";
import { event, remove, openNotification } from "../webapi";
import type {
  Approval,
  ApprovalData,
  OpenNotificationProps,
} from "@/shared/interfaces/notification";

// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends Events {
  approval?: Approval;
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
  }

  getApproval = (): ApprovalData | undefined => {
    return this.approval?.data;
  };

  resolveApproval = async (data?: any, forceReject = false) => {
    let connectedSite = false;
    if (forceReject) {
      this.approval?.reject(new EthereumProviderError(4001, "User Cancel"));
    } else {
      this.approval?.resolve(data);
      if (this.approval?.data?.params?.method === "connect")
        connectedSite = true;
    }
    await this.clear();
    this.emit("resolve", data);
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
    // if (this.approval) {
    //   throw ethErrors.provider.userRejectedRequest(
    //     "please request after user close current popup"
    //   );
    // }

    // We will just override the existing open approval with the new one coming in
    return new Promise((resolve, reject) => {
      this.approval = {
        data,
        resolve,
        reject,
      };

      this.openNotification(winProps);
    });
  };

  clear = async (stay = false) => {
    this.unLock();
    this.approval = undefined;
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

  openNotification = (winProps?: OpenNotificationProps) => {
    if (this.isLocked) return;
    this.lock();
    if (this.notifiWindowId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
    openNotification(winProps)
      .then((winId) => {
        if (winId !== undefined) {
          this.notifiWindowId = winId;
        }
      })
      .catch((e) => console.error(e));
  };
}

export default new NotificationService();
