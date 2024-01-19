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
  activeTabs: [],
  updateAppState: async (app: Partial<IAppState>, updateBack = true) => {
    const { updateTab } = get();
    if (updateBack) {
      await proxy.updateAppState(app);
      if (app.activeTabs === undefined) await updateTab();
      else {
        app.activeTabs = (await proxy.getAppState()).activeTabs.filter(
          (f) => f !== app.activeTabs[app.activeTabs.length - 1]
        );
      }
    }
    set(app);
  },
  logout: async () => {
    await proxy.updateAppState({ password: undefined, isUnlocked: false });
    set({ password: undefined, isUnlocked: false });
  },
  updateTab: async () => {
    const { activeTabs } = get();
    if (!activeTabs || !activeTabs.length) return;
    activeTabs.forEach((tabId) => {
      chrome.tabs.sendMessage(tabId, { forceUpdate: true }, () => {
        if (chrome.runtime.lastError) {
          //handle error
        }
      });
    });
  },
}));
