import s from "./styles.module.scss";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import cn from "classnames";
import { useEffect } from "react";
import { t } from "i18next";
import Loading from "react-loading";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import TransactionList from "./transactions-list";
import WalletPanel from "./wallet-panel";
import AccountPanel from "./account-panel";
import { useNavigate } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

const Wallet = () => {
  const { trottledUpdate } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    trottledUpdate();
  }, [trottledUpdate]);

  if (!currentAccount) return <Loading />;

  return (
    <div className={s.walletDiv}>
      <WalletPanel />
      <AccountPanel />

      <div className={cn("flex justify-center gap-3 align-center w-full")}>
        <p className={cn(s.transactions, s.active)}>
          {t("wallet_page.transactions")}
        </p>
        <div className={cn("flex align-center", s.transactions)}>
          <p
            onClick={() => {
              navigate("/pages/inscriptions");
            }}
          >
            {t("wallet_page.inscriptions")}
          </p>
          <ArrowUpRightIcon className="w-5 h-5" />
        </div>
      </div>

      <TransactionList />
    </div>
  );
};

export default Wallet;
