import { create } from "zustand";
import { setupStateProxy } from "../utils/setup";
import { IAppState } from "@/shared/interfaces";

export const useAppState = create<IAppState>()((set) => ({
  isReady: false,
  isUnlocked: false,
  vault: [],
  addressBook: [],
  language: "en",
  updateAppState: async (app: Partial<IAppState>) => {
    const proxy = setupStateProxy();
    await proxy.updateAppState(app);
    set(app);
  },
  logout: async () => {
    const proxy = setupStateProxy();
    await proxy.updateAppState({ password: undefined, isUnlocked: false });
    set({ password: undefined, isUnlocked: false });
  },
}));
