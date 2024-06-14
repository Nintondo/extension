import s from "./styles.module.scss";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useEffect } from "react";
import Loading from "react-loading";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import TransactionList from "./transactions-list";
import WalletPanel from "./wallet-panel";
import AccountPanel from "./account-panel";

const Wallet = () => {
  const { trottledUpdate } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();

  useEffect(() => {
    trottledUpdate(true);
  }, [trottledUpdate]);

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
