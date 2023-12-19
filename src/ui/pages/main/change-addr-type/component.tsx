import SwitchAddressType from "@/ui/components/switch-address-type";
import { useControllersState } from "@/ui/states/controllerState";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "@/ui/states/walletState";
import {
  useUpdateCurrentAccountBalance,
  useUpdateCurrentWallet,
} from "@/ui/hooks/wallet";
import { useCallback } from "react";
import { AddressType } from "bellhdw";

const ChangeAddrType = () => {
  const { keyringController, notificationController } = useControllersState(
    (v) => ({
      keyringController: v.keyringController,
      walletController: v.walletController,
      notificationController: v.notificationController,
    })
  );
  const currentWallet = useGetCurrentWallet();
  const { selectedWallet } = useWalletState((v) => ({
    selectedWallet: v.selectedWallet,
  }));
  const udpateCurrentWallet = useUpdateCurrentWallet();
  const updateCurrentAccountBalance = useUpdateCurrentAccountBalance();
  const currentAccount = useGetCurrentAccount();

  const onSwitchAddress = useCallback(
    async (type: AddressType) => {
      const addresses = await keyringController.changeAddressType(
        selectedWallet,
        type
      );
      await udpateCurrentWallet({
        ...currentWallet,
        addressType: type,
        accounts: currentWallet?.accounts.map((f) => ({
          ...f,
          address: addresses[f.id],
        })),
      });
      await updateCurrentAccountBalance(
        addresses[currentAccount?.id as any as number]
      );
      await notificationController.changedAccount();
    },
    [
      udpateCurrentWallet,
      keyringController,
      updateCurrentAccountBalance,
      notificationController,
      currentAccount?.id,
      currentWallet,
      selectedWallet,
    ]
  );

  return (
    <div className="px-6 h-full w-full">
      <SwitchAddressType
        selectedType={currentWallet?.addressType ?? AddressType.P2PKH}
        handler={onSwitchAddress}
      />
    </div>
  );
};

export default ChangeAddrType;
