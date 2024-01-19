import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import type { IAppState } from "@/shared/interfaces";

const proxy = setupStateProxy();

export const useAppState = create<IAppState>()((set, get) => ({
  isReady: false,
  isUnlocked: false,
  vault: [],
  addressBook: [],
  language: "en",
  setCurrentTab: (tab) => {
    set({ tab });
  },
  updateAppState: async (app: Partial<IAppState>, updateBack = true) => {
    const { updateTab } = get();
    if (updateBack) {
      await proxy.updateAppState(app);
      updateTab();
    }
    set(app);
  },
  logout: async () => {
    await proxy.updateAppState({ password: undefined, isUnlocked: false });
    set({ password: undefined, isUnlocked: false });
  },
  updateTab: () => {
    const { tab } = get();
    if (tab !== undefined) {
      chrome.tabs.sendMessage(tab.id, { forceUpdate: true }, () => {});
    }
  },
}));
