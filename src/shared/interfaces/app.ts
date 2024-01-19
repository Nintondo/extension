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
  tab?: chrome.tabs.Tab;
  setCurrentTab: (tab: chrome.tabs.Tab | undefined) => void;
  updateAppState: (
    app: Partial<IAppState>,
    updateBack?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateTab: () => void;
}
