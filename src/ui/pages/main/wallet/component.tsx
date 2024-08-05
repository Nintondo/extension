import s from "./styles.module.scss";
import { useEffect } from "react";
import { TailSpin } from "react-loading-icons";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import TransactionList from "./transactions-list";
import WalletPanel from "./wallet-panel";
import AccountPanel from "./account-panel";
import { useLocation } from "react-router-dom";
import { useGetCurrentAccount } from "@/ui/states/walletState";

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

  if (!currentAccount) return <TailSpin />;

  return (
    <div className={s.walletDiv}>
      <WalletPanel />
      <AccountPanel />

      <TransactionList />
    </div>
  );
};

export default Wallet;
