import type { AddressType } from "bellhdw/src/hd/types";
import type { IAccount } from "./accounts";

export interface IWallet {
  id: number;
  accounts: IAccount[];
  name: string;
  addressType: AddressType;
  type: "simple" | "root";
  hideRoot?: boolean;
}

export interface IPrivateWallet extends IWallet {
  data: any;
  phrase?: string;
}

export interface IWalletStateBase {
  wallets: IWallet[];
  vaultIsEmpty: boolean;
  selectedWallet?: number;
  selectedAccount?: number;
}

export interface IWalletState extends IWalletStateBase {
  updateWalletState: (
    state: Partial<IWalletState>,
    updateBack?: boolean
  ) => Promise<void>;
}

export interface INewWalletProps {
  payload: string;
  walletType: "simple" | "root";
  addressType?: AddressType;
  name?: string;
  hideRoot?: boolean;
  restoreFrom?: "wif" | "hex";
}
