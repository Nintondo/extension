import type { ConnectedSite } from "../permission";
import type { IWallet } from "@/shared/interfaces";

interface StorageAccountItem {
  id: number;
  name: string;
}

interface StorageWalletItem extends Omit<IWallet, "accounts" | "id"> {
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
