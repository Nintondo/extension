import s from "../styles.module.scss";
import {
  Cog6ToothIcon,
  ChevronDownIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useGetCurrentWallet } from "@/ui/states/walletState";

const WalletPanel = () => {
  const currentWallet = useGetCurrentWallet();

  return (
    <div className="flex justify-between mt-2 items-center mb-4">
      <Link
        className="flex gap-3 items-center select-none cursor-pointer"
        to={"/pages/switch-wallet"}
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-950 rounded-full w-6 h-6 flex items-center justify-center">
          {currentWallet.name
            ? currentWallet.name.split(/.*?/u)[0].toUpperCase()
            : "W"}
        </div>
        <div className="flex gap-2 items-center">
          <div className={s.change}>{currentWallet?.name ?? "wallet"} </div>
          <ChevronDownIcon className="w-3 h-3" />
        </div>
      </Link>

      <div className="flex gap-3">
        <Link to={"/pages/discover"} className="cursor-pointer">
          <NewspaperIcon className="w-6 h-6" />
        </Link>
        <Link to={"/pages/settings"} className="cursor-pointer">
          <Cog6ToothIcon className="w-6 h-6 hover:rotate-90 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default WalletPanel;
