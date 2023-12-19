export interface IAppStateBase {
  isReady: boolean;
  isUnlocked: boolean;
  vault: string[];
  password?: string;
  addressBook: string[];
  pendingWallet?: string;
  language: string;
}

export interface IAppState extends IAppStateBase {
  updateAppState: (app: Partial<IAppState>) => Promise<void>;
  logout: () => Promise<void>;
}
