import SwitchAddressType from "@/ui/components/switch-address-type";
import { useControllersState } from "@/ui/states/controllerState";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "@/ui/states/walletState";
import { AddressType } from "bellhdw";
import { useNavigate } from "react-router-dom";
import { ss } from "@/ui/utils";

const ChangeAddrType = () => {
  const { keyringController, notificationController, apiController } =
    useControllersState(
      ss(["keyringController", "notificationController", "apiController"])
    );
  const { selectedWallet, updateSelectedWallet } = useWalletState(
    ss(["selectedWallet", "updateSelectedWallet"])
  );
  const currentAccount = useGetCurrentAccount();
  const currentWallet = useGetCurrentWallet();
  const navigate = useNavigate();

  const onSwitchAddress = async (type: AddressType) => {
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
    await updateSelectedWallet({
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
