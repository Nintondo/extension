import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import type { IAppState } from "@/shared/interfaces";

const proxy = setupStateProxy();

export const useAppState = create<IAppState>()((set) => ({
  isReady: false,
  isUnlocked: false,
  vault: [],
  addressBook: [],
  language: "en",
  updateAppState: async (app: Partial<IAppState>, updateBack = true) => {
    if (updateBack) {
      await proxy.updateAppState(app);
    }
    set(app);
  },
  logout: async () => {
    await proxy.updateAppState({ password: undefined, isUnlocked: false });
    set({ password: undefined, isUnlocked: false });
  },
}));
