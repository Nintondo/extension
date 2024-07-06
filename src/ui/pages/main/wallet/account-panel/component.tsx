import s from "../styles.module.scss";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { shortAddress } from "@/shared/utils/transactions";
import CopyBtn from "@/ui/components/copy-btn";
import { t } from "i18next";
import cn from "classnames";
import { Popover, Transition, useClose } from "@headlessui/react";
import { Fragment, useRef } from "react";
import { calcBalanceLength } from "@/ui/utils";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
} from "@/ui/states/walletState";

const AccountPanel = () => {
  const { currentPrice } = useTransactionManagerContext();
  const currentAccount = useGetCurrentAccount();
  const currentWallet = useGetCurrentWallet();

  const close = useClose();
  const leaveTimeOutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeOutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = (isOpen: boolean) => {
    if (
      !currentAccount ||
      currentAccount.address ||
      leaveTimeOutRef.current === null
    )
      return;
    if (currentAccount.balance === undefined) return;
    if (leaveTimeOutRef.current !== null) {
      clearTimeout(leaveTimeOutRef.current);
    }
    enterTimeOutRef.current = setTimeout(() => {
      !isOpen && close();
    }, 240);
  };

  const handleLeave = (isOpen: boolean) => {
    if (enterTimeOutRef.current !== null) {
      clearTimeout(enterTimeOutRef.current);
    }
    leaveTimeOutRef.current = setTimeout(() => {
      isOpen && close();
    }, 240);
  };

  return (
    <div className={s.accPanel}>
      <Popover className="relative w-full flex">
        {({ open }) => (
          <>
            <div
              className={s.balance}
              onMouseEnter={() => handleEnter(open)}
              onMouseLeave={() => handleLeave(open)}
            >
              <div className="flex items-center justify-center gap-2">
                {currentAccount?.balance === undefined ? (
                  <div className="pb-1">
                    <div className="animate-pulse w-40 h-8 rounded-md bg-gray-600 bg-opacity-70" />
                  </div>
                ) : (
                  calcBalanceLength((currentAccount?.balance ?? 0) / 10 ** 8)
                )}
                <span className="text-xl pb-0.5 text-slate-300">BEL</span>
              </div>
            </div>
            {currentAccount?.balance !== undefined ? (
              currentPrice !== undefined ? (
                <div className="text-gray-500 text-sm">
                  ~
                  {((currentAccount.balance / 10 ** 8) * currentPrice)?.toFixed(
                    3
                  )}
                  $
                </div>
              ) : undefined
            ) : undefined}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-[-50%]"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-[-50%]"
            >
              <Popover.Panel
                onMouseEnter={() => handleEnter(open)}
                onMouseLeave={() => handleLeave(open)}
                className="absolute w-full flex flex-col top-full left-0 bg-opacity-90 bg-black rounded-xl p-3 text-sm"
              >
                <p>
                  {`${t("wallet_page.amount_in_transactions")}: `}
                  {`${currentAccount?.balance?.toFixed(8)} BEL`}
                </p>
                <p>
                  {`${t("wallet_page.amount_in_inscriptions")}: `}
                  {`${currentAccount?.inscriptionBalance?.toFixed(8)} BEL`}
                </p>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
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
            {currentAccount?.id === 0 &&
            !currentWallet?.hideRoot &&
            currentWallet?.type === "root"
              ? "Root account"
              : currentAccount?.name}
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
        <Link
          to={"/pages/receive"}
          className={cn(s.btn, "w-full px-3 bg-text text-bg")}
        >
          {t("wallet_page.receive")}
        </Link>
        <Link
          to={"/pages/create-send"}
          className={cn(s.btn, "w-full px-3 hover:bg-text hover:text-bg")}
        >
          {t("wallet_page.send")}
        </Link>
      </div>
    </div>
  );
};

export default AccountPanel;
