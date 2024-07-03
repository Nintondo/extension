import SwitchAddressType from "@/ui/components/switch-address-type";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentWallet, useWalletState } from "@/ui/states/walletState";
import { AddressType } from "bellhdw";
import { useNavigate } from "react-router-dom";
import { ss } from "@/ui/utils";
import toast from "react-hot-toast";

const ChangeAddrType = () => {
  const { keyringController, notificationController, apiController } =
    useControllersState(
      ss(["keyringController", "notificationController", "apiController"])
    );
  const { selectedWallet, updateSelectedWallet, selectedAccount } =
    useWalletState(
      ss(["selectedWallet", "updateSelectedWallet", "selectedAccount"])
    );
  const currentWallet = useGetCurrentWallet();
  const navigate = useNavigate();

  const onSwitchAddress = async (type: AddressType) => {
    if (
      typeof selectedWallet === "undefined" ||
      typeof selectedAccount === "undefined" ||
      typeof currentWallet === "undefined"
    )
      return toast.error("Internal error: Selected wallet not found.");
    const addresses = await keyringController.changeAddressType(
      selectedWallet,
      type
    );
    const newStats = await apiController.getAccountStats(
      addresses[selectedAccount]
    );
    await updateSelectedWallet(
      {
        addressType: type,
        accounts: currentWallet.accounts.map((f, idx) => {
          if (f.id !== selectedWallet) {
            return { ...f, address: addresses[idx], id: idx };
          }
          return {
            ...f,
            id: idx,
            address: addresses[f.id],
            balance: newStats?.balance ?? f.balance,
            inscriptionBalance: newStats?.amount ?? f.inscriptionBalance,
            inscriptionCounter: newStats?.count ?? f.inscriptionCounter,
          };
        }),
      },
      true
    );
    await notificationController.changedAccount();
    navigate("/");
  };

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
