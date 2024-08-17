import s from "../styles.module.scss";
import {
  shortAddress,
  isIncomeTx,
  getTransactionValue,
} from "@/shared/utils/transactions";
import { t } from "i18next";
import { Circle } from "rc-progress";
import { Link } from "react-router-dom";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { CheckIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { TailSpin } from "react-loading-icons";
import { useGetCurrentAccount } from "@/ui/states/walletState";

const TransactionList = () => {
  const { lastBlock, transactions, loadMoreTransactions } =
    useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const { ref, inView } = useInView();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (inView) loadMoreTransactions();
  }, [inView, loadMoreTransactions]);

  if (!transactions || !lastBlock || !currentAccount || !currentAccount.address)
    return (
      <div className="min-h-[50vh] w-full flex justify-center items-center">
        <TailSpin />
      </div>
    );

  if (!transactions.length)
    return (
      <p className={s.noTransactions}>{t("wallet_page.no_transactions")}</p>
    );

  return (
    <div className={s.transactionsDiv}>
      {transactions.map((t, index) => (
        <Link
          className={s.transaction}
          key={index}
          to={`/pages/transaction-info/${t.txid}`}
          state={{
            transaction: t,
            lastBlock,
          }}
        >
          <div className="flex gap-3 items-center">
            <div
              className={cn(
                "rounded-full w-6 h-6 text-bg flex items-center justify-center relative",
                {
                  "bg-gradient-to-r from-green-400 to-emerald-600":
                    getPercent(lastBlock, t.status.block_height) === 100,
                  "bg-gradient-to-r from-gray-200 to-gray-500":
                    getPercent(lastBlock, t.status.block_height) < 100,
                }
              )}
            >
              <Circle
                className={cn("absolute -inset-1", {
                  hidden: getPercent(lastBlock, t.status.block_height) === 100,
                })}
                percent={getPercent(lastBlock, t.status.block_height)}
                strokeWidth={3}
              />
              <div className="absolute inset-0">
                {getConfirmationsCount(lastBlock, t.status.block_height)}
              </div>
            </div>
            <div>{shortAddress(t.txid)}</div>
          </div>
          <div
            className={cn(s.value, {
              "text-green-500": isIncomeTx(t, currentAccount.address ?? ""),
              "text-red-500": !isIncomeTx(t, currentAccount.address ?? ""),
            })}
          >
            {isIncomeTx(t, currentAccount.address ?? "") ? "+ " : "- "}
            {getTransactionValue(t, currentAccount.address ?? "")} BEL
          </div>
        </Link>
      ))}
      <div ref={ref}></div>
    </div>
  );
};

export default TransactionList;

const getPercent = (lastBlock: number, currentBlock?: number) => {
  if (!currentBlock) return 0;
  if (lastBlock - currentBlock > 6) return 100;
  if (lastBlock < currentBlock) return 0;
  return Math.floor(((lastBlock - currentBlock) / 6) * 100);
};

const getConfirmationsCount = (lastBlock: number, currentBlock?: number) => {
  let confirmations = currentBlock ? Math.max(lastBlock - currentBlock, 0) : 0;

  if (!currentBlock || lastBlock - currentBlock < 6 || lastBlock < currentBlock)
    return (
      <div className="p-0.5 flex items-center justify-center leading-[159%]">
        {confirmations}
      </div>
    );
  if (lastBlock - currentBlock < 6) {
    return (
      <div className="p-0.5 flex items-center justify-center leading-[159%]">
        {lastBlock - currentBlock}
      </div>
    );
  }
  return <CheckIcon className="w-6 h-6 p-0.5" />;
};
