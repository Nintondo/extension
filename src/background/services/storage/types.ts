import { AddressType } from "bellhdw";
import { ConnectedSite } from "../permission";

interface StorageAccountItem {
  id: number;
  name: string;
}

interface StorageWalletItem {
  name: string;
  addressType: AddressType;
  type: "simple" | "root";
  accounts: StorageAccountItem[];
}

export type DecryptedSecrets = { id: number; data: any; phrase?: string }[];

export interface StorageInterface {
  enc: Record<"data" | "iv" | "salt", string>;
  cache: {
    wallets: StorageWalletItem[];
    addressBook: string[];
    selectedWallet?: number;
    selectedAccount?: number;
    pendingWallet?: string;
    connectedSites: ConnectedSite[];
    language?: string;
  };
}
