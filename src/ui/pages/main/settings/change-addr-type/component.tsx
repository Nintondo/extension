import SwitchAddressType from "@/ui/components/switch-address-type";
import { useControllersState } from "@/ui/states/controllerState";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "@/ui/states/walletState";
import { useUpdateCurrentWallet } from "@/ui/hooks/wallet";
import { useCallback } from "react";
import { AddressType } from "bellhdw";
import { useNavigate } from "react-router-dom";

const ChangeAddrType = () => {
  const { keyringController, notificationController, apiController } =
    useControllersState((v) => ({
      keyringController: v.keyringController,
      walletController: v.walletController,
      notificationController: v.notificationController,
      apiController: v.apiController,
    }));
  const currentWallet = useGetCurrentWallet();
  const { selectedWallet } = useWalletState((v) => ({
    selectedWallet: v.selectedWallet,
  }));
  const updateCurrentWallet = useUpdateCurrentWallet();
  const currentAccount = useGetCurrentAccount();
  const navigate = useNavigate();

  const onSwitchAddress = useCallback(
    async (type: AddressType) => {
      if (
        typeof selectedWallet === "undefined" ||
        typeof currentAccount?.id === "undefined"
      )
        return;
      const addresses = await keyringController.changeAddressType(
        selectedWallet,
        type
      );
      const newStats = await apiController.getAccountStats(
        addresses[currentAccount.id]
      );
      await updateCurrentWallet({
        ...currentWallet,
        addressType: type,
        accounts: currentWallet?.accounts.map((f, idx) => ({
          ...f,
          id: idx,
          address: addresses[f.id],
          balance: newStats?.balance ?? f.balance,
          inscriptionBalance: newStats?.amount ?? f.inscriptionBalance,
          inscriptionCounter: newStats?.count ?? f.inscriptionCounter,
        })),
      });
      await notificationController.changedAccount();
      navigate("/");
    },
    [
      updateCurrentWallet,
      keyringController,
      notificationController,
      currentWallet,
      selectedWallet,
      navigate,
      apiController,
      currentAccount?.id,
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
