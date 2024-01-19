import s from "../styles.module.scss";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
} from "@/ui/states/walletState";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import Loading from "react-loading";
import { shortAddress } from "@/shared/utils/transactions";
import CopyBtn from "@/ui/components/copy-btn";
import { t } from "i18next";
import cn from "classnames";

const AccountPanel = () => {
  const currentWallet = useGetCurrentWallet();
  const currentAccount = useGetCurrentAccount();

  const { currentPrice } = useTransactionManagerContext();

  return (
    <div className={s.accPanel}>
      <div className="flex gap-2 pb-2">
        <div className={s.balance}>
          {currentAccount?.balance === undefined ? (
            <Loading
              type="spin"
              color="#ffbc42"
              width={"2.5rem"}
              height={"2rem"}
              className="react-loading pr-2"
            />
          ) : (
            (currentAccount?.balance ?? 0).toFixed(8)
          )}
          <span className="text-xl pb-0.5 text-slate-300">BEL</span>
        </div>
        {currentAccount?.balance !== undefined ? (
          currentPrice !== undefined ? (
            <div className="text-gray-500 text-sm">
              ~{(currentAccount.balance * currentPrice).toFixed(3)}$
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
            {currentAccount.id === 0 &&
            !currentWallet.hideRoot &&
            currentWallet.type === "root"
              ? "Root account"
              : currentAccount.name}
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
        <Link to={"/pages/receive"} className={s.btn}>
          {t("wallet_page.receive")}
        </Link>
        <Link to={"/pages/create-send"} className={s.btn}>
          {t("wallet_page.send")}
        </Link>
      </div>
    </div>
  );
};

export default AccountPanel;
