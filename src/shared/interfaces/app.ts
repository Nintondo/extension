import { Network } from "belcoinjs-lib";

export interface IAppStateBase {
  isReady: boolean;
  isUnlocked: boolean;
  password?: string;
  addressBook: string[];
  pendingWallet?: string;
  language: string;
  network: Network;
}
