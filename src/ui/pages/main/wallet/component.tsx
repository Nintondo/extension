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

const Wallet = () => {
  const { trottledUpdate } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();

  useEffect(() => {
    trottledUpdate();
  }, [trottledUpdate]);

  if (!currentAccount) return <Loading />;

  return (
    <div className={s.walletDiv}>
      <WalletPanel />
      <AccountPanel />

      <p className={cn(s.transactions)}>{t("wallet_page.transactions")}</p>

      <TransactionList />
    </div>
  );
};

export default Wallet;
