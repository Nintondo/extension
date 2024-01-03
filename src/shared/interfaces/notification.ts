import { ConnectedSite } from "@/background/services/permission";
import { EthereumProviderError } from "eth-rpc-errors";

export interface INotificationController {
  getApproval(): Promise<ApprovalData>;
  rejectApproval(
    err?: string,
    stay?: boolean,
    isInternal?: boolean
  ): Promise<void>;
  resolveApproval(data?: any, forceReject?: boolean): Promise<void>;
  changedAccount(): Promise<void>;
  getConnectedSites(): Promise<ConnectedSite[]>;
  removeSite(origin: string): Promise<ConnectedSite[]>;
}

export interface Approval {
  data: ApprovalData;
  resolve(params?: any): void;
  reject(err: EthereumProviderError<any>): void;
}

export interface Session {
  origin: string;
  name: string;
}

export interface ApprovalData {
  state: number;
  params?: Params;
  origin?: string;
  approvalComponent: string;
  session: Session;
  requestDefer?: Promise<any>;
  approvalType: string;
}

export interface Params {
  method: string;
  data: any;
  session: Session;
}

export interface CreateTxProps {
  to: string;
  amount: number;
  feeRate: number;
  receiverToPayFee: boolean;
}
export interface CreateTransaction {
  address: string;
  amount: number;
  feeRate: number;
}

type NotificationDefault = Partial<Omit<chrome.windows.CreateData, "url">>;
export type CreateNotificationProps = NotificationDefault & { url: string };
export type OpenNotificationProps = NotificationDefault & { route: string };
