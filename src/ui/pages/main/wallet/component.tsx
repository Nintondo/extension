import s from "./styles.module.scss";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useEffect } from "react";
import Loading from "react-loading";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import TransactionList from "./transactions-list";
import WalletPanel from "./wallet-panel";
import AccountPanel from "./account-panel";
import { useLocation } from "react-router-dom";

const Wallet = () => {
  const { trottledUpdate } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const location = useLocation();

  useEffect(() => {
    trottledUpdate(!!location.state?.force);
    if (location.state?.force) {
      window.history.replaceState({}, "");
    }
  }, [trottledUpdate, location]);

  if (!currentAccount) return <Loading />;

  return (
    <div className={s.walletDiv}>
      <WalletPanel />
      <AccountPanel />

      <TransactionList />
    </div>
  );
};

export default Wallet;
