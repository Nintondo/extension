import type { IApiController } from "@/background/controllers/apiController";
import type { IKeyringController } from "@/background/controllers/keyringController";
import type { IWalletController } from "@/shared/types";
import type { INotificationController } from "@/shared/types/notification";
import type { IStateController } from "@/shared/types/stateController";
import { create } from "zustand";

export interface IControllerState {
  walletController: IWalletController;
  apiController: IApiController;
  stateController: IStateController;
  keyringController: IKeyringController;
  notificationController: INotificationController;
  updateControllers: (controllers: Partial<IControllerState>) => void;
}

export const useControllersState = create<IControllerState>()((set) => ({
  walletController: {} as any,
  apiController: {} as any,
  stateController: {} as any,
  keyringController: {} as any,
  notificationController: {} as any,
  updateControllers: (controllers: Partial<IControllerState>) => {
    set(controllers);
  },
}));
