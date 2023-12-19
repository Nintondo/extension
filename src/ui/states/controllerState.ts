import { IApiController } from "@/background/controllers/apiController";
import { IKeyringController } from "@/background/controllers/keyringController";
import { IWalletController } from "@/shared/interfaces";
import { INotificationController } from "@/shared/interfaces/notification";
import { IStateController } from "@/shared/interfaces/stateController";
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
