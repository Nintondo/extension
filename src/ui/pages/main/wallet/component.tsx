import s from "./styles.module.scss";
import { TailSpin } from "react-loading-icons";
import TransactionList from "./transactions-list";
import WalletPanel from "./wallet-panel";
import AccountPanel from "./account-panel";
import { useGetCurrentAccount } from "@/ui/states/walletState";

const Wallet = () => {
  const currentAccount = useGetCurrentAccount();

  if (!currentAccount) return <TailSpin className="animate-spin" />;

  return (
    <div className={s.walletDiv}>
      <WalletPanel />
      <AccountPanel />

      <TransactionList />
    </div>
  );
};

export default Wallet;
