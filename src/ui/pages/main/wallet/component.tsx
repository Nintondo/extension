import { Link } from "react-router-dom";

import {
  ListBulletIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import s from "./styles.module.scss";
import { shortAddress } from "@/shared/utils/transactions";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
} from "@/ui/states/walletState";
import cn from "classnames";
import { useEffect } from "react";
import CopyBtn from "@/ui/components/copy-btn";
import { getTransactionValue, isIncomeTx } from "@/shared/utils/transactions";
import { Circle } from "rc-progress";
import { t } from "i18next";
import { useInView } from "react-intersection-observer";
import Loading from "react-loading";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";

const Wallet = () => {
  const { currentPrice, lastBlock, loadMore, transactions } =
    useTransactionManagerContext();
  const currentWallet = useGetCurrentWallet();

  const currentAccount = useGetCurrentAccount();

  const { ref, inView } = useInView();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (inView) loadMore();
  }, [inView, loadMore]);

  if (!currentAccount) return <Loading />;

  return (
    <div className={s.walletDiv}>
      <div className="flex justify-between mt-2 items-center mb-4">
        <Link
          className="flex gap-3 items-center select-none cursor-pointer"
          to={"/pages/switch-wallet"}
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-950 rounded-full w-6 h-6 flex items-center justify-center">
            {currentWallet.name
              ? currentWallet.name.split(/.*?/u)[0].toUpperCase()
              : "W"}
          </div>
          <div className="flex gap-2 items-center">
            <div className={s.change}>{currentWallet?.name ?? "wallet"} </div>
            <ChevronDownIcon className="w-3 h-3" />
          </div>
        </Link>

        <Link to={"/pages/settings"} className="cursor-pointer">
          <Cog6ToothIcon className="w-6 h-6 hover:rotate-90 transition-transform" />
        </Link>
      </div>

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
              currentAccount?.balance
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

      <p className={s.transactions}>{t("wallet_page.transactions")}</p>
      {transactions.length > 0 ? (
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
                      hidden:
                        getPercent(lastBlock, t.status.block_height) === 100,
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
                  "text-green-500": isIncomeTx(t, currentAccount.address),
                  "text-red-500": !isIncomeTx(t, currentAccount.address),
                })}
              >
                {isIncomeTx(t, currentAccount.address) ? "+ " : "- "}
                {getTransactionValue(t, currentAccount.address)} BEL
              </div>
            </Link>
          ))}
          <div ref={ref}></div>
        </div>
      ) : (
        <p className={s.noTransactions}>{t("wallet_page.no_transactions")}</p>
      )}
    </div>
  );
};

const getPercent = (lastBlock: number, currentBlock?: number) => {
  if (!currentBlock) return 0;
  if (lastBlock - currentBlock > 6) {
    return 100;
  }
  return Math.floor(((lastBlock - currentBlock) / 6) * 100);
};

const getConfirmationsCount = (lastBlock: number, currentBlock?: number) => {
  if (!currentBlock)
    return (
      <div className="p-0.5 flex items-center justify-center leading-[159%]">
        0
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

export default Wallet;
