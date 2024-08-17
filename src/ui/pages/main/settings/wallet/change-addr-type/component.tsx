import SwitchAddressType from "@/ui/components/switch-address-type";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentWallet, useWalletState } from "@/ui/states/walletState";
import { AddressType } from "bellhdw";
import { useNavigate } from "react-router-dom";
import { ss } from "@/ui/utils";
import toast from "react-hot-toast";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { ADDRESS_TYPES } from "@/shared/constant";

const ChangeAddrType = () => {
  const { keyringController, notificationController } = useControllersState(
    ss(["keyringController", "notificationController"])
  );
  const { selectedWallet, updateSelectedWallet, selectedAccount } =
    useWalletState(
      ss(["selectedWallet", "updateSelectedWallet", "selectedAccount"])
    );
  const currentWallet = useGetCurrentWallet();
  const navigate = useNavigate();
  const { trottledUpdate } = useTransactionManagerContext();

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
    await updateSelectedWallet({
      addressType: type,
      accounts: currentWallet.accounts.map((f, idx) => ({
        ...f,
        address: addresses[idx],
        id: idx,
      })),
    });
    trottledUpdate(true);
    await notificationController.changedAccount();
    navigate("/");
  };

  return (
    <div className="px-6 h-full w-full">
      <SwitchAddressType
        selectedType={currentWallet?.addressType ?? ADDRESS_TYPES[0].value}
        handler={onSwitchAddress}
      />
    </div>
  );
};

export default ChangeAddrType;
