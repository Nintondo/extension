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
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { useNavigate } from "react-router-dom";

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
  const { trottledUpdate } = useTransactionManagerContext();
  const navigate = useNavigate();

  const onSwitchAddress = useCallback(
    async (type: AddressType) => {
      if (selectedWallet === undefined) return;
      const addresses = await keyringController.changeAddressType(
        selectedWallet,
        type
      );
      await udpateCurrentWallet({
        ...currentWallet,
        addressType: type,
        accounts: currentWallet?.accounts.map((f, idx) => ({
          ...f,
          id: idx,
          address: addresses[f.id],
        })),
      });
      await updateCurrentAccountBalance(
        addresses[currentAccount?.id as any as number]
      );
      await notificationController.changedAccount();
      trottledUpdate(true);
      navigate("/");
    },
    [
      udpateCurrentWallet,
      keyringController,
      updateCurrentAccountBalance,
      notificationController,
      currentAccount?.id,
      currentWallet,
      selectedWallet,
      trottledUpdate,
      navigate,
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
