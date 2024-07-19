import s from "../styles.module.scss";
import { Cog6ToothIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import cn from "classnames";
import { useGetCurrentWallet } from "@/ui/states/walletState";

const WalletPanel = () => {
  const currentWallet = useGetCurrentWallet();

  return (
    <div className="flex justify-between mt-2 items-center mb-4">
      <Link
        className="flex gap-3 items-center select-none cursor-pointer"
        to={"/pages/switch-wallet"}
      >
        <div className="bg-gradient-to-br from-orange-400 to-bg rounded-full w-6 h-6 flex items-center justify-center">
          {currentWallet?.name
            ? currentWallet?.name.split(/.*?/u)[0].toUpperCase()
            : "W"}
        </div>
        <div className="flex gap-2 items-center">
          <div className={s.change}>{currentWallet?.name ?? "wallet"} </div>
          <ChevronDownIcon className="w-3 h-3" />
        </div>
      </Link>

      <div className="flex gap-3 items-center">
        <Link
          to={"/pages/inscriptions"}
          className="cursor-pointer flex items-center justify-center"
        >
          <img src="/nft.png" alt="nft" className={cn("w-12", s.nftImage)} />
        </Link>
        <div className="w-[1px] bg-white bg-opacity-25 h-5" />
        <Link to={"/pages/settings"} className="cursor-pointer">
          <Cog6ToothIcon className="w-6 h-6 hover:rotate-90 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default WalletPanel;
