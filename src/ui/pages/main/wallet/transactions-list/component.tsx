import s from "../styles.module.scss";
import {
  shortAddress,
  isIncomeTx,
  getTransactionValue,
} from "@/shared/utils/transactions";
import { t } from "i18next";
import { Link } from "react-router-dom";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import LoadingIcons, { TailSpin } from "react-loading-icons";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import DateComponent from "@/ui/components/date";
import { Circle } from "rc-progress";

const TransactionList = () => {
  const { lastBlock, transactions, loadMoreTransactions, currentPrice } =
    useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const { ref, inView } = useInView();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inView) {
      setLoading(true);
      loadMoreTransactions()
        .then(() => setLoading(false))
        .catch(console.error);
    }
  }, [inView, loadMoreTransactions]);

  if (!transactions || !lastBlock || !currentAccount || !currentAccount.address)
    return (
      <div className="min-h-[50vh] w-full flex justify-center items-center">
        <TailSpin className="animate-spin" />
      </div>
    );

  if (!transactions.length)
    return (
      <p className={s.noTransactions}>{t("wallet_page.no_transactions")}</p>
    );

  return (
    <div className={s.transactionsDiv}>
      {Object.entries(
        Object.groupBy(transactions, (i) => {
          if (!i.status.block_time) {
            return "0";
          }
          const date = new Date(i.status.block_time * 1000);

          date.setHours(0, 0, 0, 0);

          return String(date.getTime());
        })
      ).map(([key, txs]) => {
        const isMempool = key === "0";

        if (!txs) return;

        return (
          <div className="w-full" key={key}>
            <div className="my-2 px-4 py-1.5 rounded-xl border border-neutral-700 font-medium uppercase sticky top-0 bg-neutral-900/50 backdrop-blur-sm z-10 w-max">
              {isMempool ? "Unconfirmed" : <DateComponent date={Number(key)} />}
            </div>

            {txs.map((t, txidx) => {
              const isIncome = isIncomeTx(t, currentAccount.address ?? "");
              const value = getTransactionValue(
                t,
                currentAccount.address ?? ""
              );
              const percent = getPercent(lastBlock, t.status.block_height);
              const isConfirmed = percent === 100;

              return (
                <Link
                  className={s.transaction}
                  key={key + ":" + txidx}
                  to={`/pages/transaction-info/${t.txid}`}
                  state={{
                    transaction: t,
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <div
                      className={cn(
                        "rounded-full size-9 text-bg flex items-center justify-center relative",
                        {
                          "bg-gradient-to-r from-green-500/75 to-emerald-600/75":
                            isConfirmed,
                          "bg-gradient-to-r from-gray-500/75 to-gray-600/75":
                            !isConfirmed,
                        }
                      )}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          {
                            "text-green-200": isConfirmed,
                            "text-white": !isConfirmed,
                          }
                        )}
                      >
                        <Circle
                          className={cn("absolute inset-0", {
                            hidden: percent === 100 || percent === 0,
                          })}
                          percent={percent}
                          strokeWidth={4}
                          trailWidth={3}
                          trailColor="rgb(107, 114, 128)"
                          strokeColor={"white"}
                        />
                        {isConfirmed ? (
                          !isIncome ? (
                            <ArrowUpIcon className="size-5" />
                          ) : (
                            <ArrowDownIcon className="size-5" />
                          )
                        ) : t.status.confirmed ? (
                          <span className="text-base font-medium leading-3">
                            {lastBlock - t.status.block_height + 1}
                          </span>
                        ) : undefined}
                      </div>
                    </div>
                    <div className="font-mono text-opacity-80 pt-1">
                      {shortAddress(t.txid)}
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(s.value, {
                        "text-green-500": isIncome && isConfirmed,
                        "text-red-400": !isIncome && isConfirmed,
                        "text-gray-400": !isConfirmed,
                      })}
                    >
                      {isIncome ? "+ " : "- "}
                      {value} BEL
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      {parseFloat((currentPrice! * Number(value)).toFixed(6))} $
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
      <div ref={ref} className="w-full py-1 ">
        {loading && <LoadingIcons.TailSpin className="w-6 h-6 mx-auto" />}
      </div>
    </div>
  );
};

export default TransactionList;

const REQUIRED_CONFIRMATIONS = 6;

const getPercent = (lastBlock: number, currentBlock?: number) => {
  if (!currentBlock) return 0;
  if (lastBlock - currentBlock + 1 > REQUIRED_CONFIRMATIONS) return 100;
  if (lastBlock < currentBlock) return 0;
  return Math.floor(
    ((lastBlock - currentBlock + 1) / REQUIRED_CONFIRMATIONS) * 100
  );
};
