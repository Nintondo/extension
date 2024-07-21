import s from "../styles.module.scss";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { shortAddress } from "@/shared/utils/transactions";
import CopyBtn from "@/ui/components/copy-btn";
import { t } from "i18next";
import cn from "classnames";
import { calcBalanceLength } from "@/ui/utils";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
} from "@/ui/states/walletState";

const AccountPanel = () => {
  const { currentPrice } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const currentWallet = useGetCurrentWallet();

  const cardinalBalance = currentAccount?.balance ?? 0;
  const ordinalBalance = currentAccount?.inscriptionBalance ?? 0;
  const balance = (cardinalBalance + ordinalBalance) / 10 ** 8;


  return (
    <div className={s.accPanel}>
      <div className="relative w-full flex">
        <div className={s.balance}>
          <div className="flex items-center justify-center gap-2">
            {currentAccount?.balance === undefined ? (
              <div className="pb-1">
                <div className="animate-pulse w-40 h-8 rounded-md bg-gray-600 bg-opacity-70" />
              </div>
            ) : (
              calcBalanceLength(balance)
            )}
            <span className="text-xl pb-0.5 text-slate-300">BEL</span>
          </div>
        </div>
        {currentAccount?.balance !== undefined ? (
          currentPrice !== undefined ? (
            <div className="text-gray-500 text-sm">
              ~
              {(balance * currentPrice)?.toFixed(3)}
              $
            </div>
          ) : undefined
        ) : undefined}

      </div>
      <div className="flex gap-3 items-center">
        {currentWallet?.type === "root" ? (
          <Link to={"/pages/switch-account"}>
            <ListBulletIcon
              title={"Switch account"}
              className={s.accountsIcon}
            />
          </Link>
        ) : undefined}
        <div>
          <p>
            {currentAccount?.id === 0 &&
              !currentWallet?.hideRoot &&
              currentWallet?.type === "root"
              ? "Root account"
              : currentAccount?.name}
          </p>
          <CopyBtn
            title={currentAccount?.address}
            className={s.accPubAddress}
            label={shortAddress(currentAccount?.address, 9)}
            value={currentAccount?.address}
          />
        </div>
      </div>

      <div className={cn(s.receiveSendBtns)}>
        <Link
          to={"/pages/receive"}
          className={cn(s.btn, "w-full px-3 bg-text text-bg")}
        >
          {t("wallet_page.receive")}
        </Link>
        <Link
          to={"/pages/create-send"}
          className={cn(s.btn, "w-full px-3 hover:bg-text hover:text-bg")}
        >
          {t("wallet_page.send")}
        </Link>
      </div>
    </div>
  );
};

export default AccountPanel;
