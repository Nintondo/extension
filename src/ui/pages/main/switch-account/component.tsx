import { TagIcon, KeyIcon } from "@heroicons/react/24/outline";
import s from "./styles.module.scss";
import { shortAddress } from "@/shared/utils/transactions";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
} from "@/ui/states/walletState";
import cn from "classnames";
import CopyBtn from "@/ui/components/copy-btn";
import { useSwitchAccount, useUpdateCurrentWallet } from "@/ui/hooks/wallet";
import { useNavigate } from "react-router-dom";
import Card from "@/ui/components/card";
import Rename from "@/ui/components/rename";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { t } from "i18next";

const SwitchAccount = () => {
  const [renameId, setRenameId] = useState<number | undefined>(undefined);

  const currentAccount = useGetCurrentAccount();
  const currentWallet = useGetCurrentWallet();

  const switchAccount = useSwitchAccount();
  const navigate = useNavigate();

  const updateCurrentWallet = useUpdateCurrentWallet();

  const onRename = async (name: string) => {
    if (currentWallet.accounts.map((i) => i.name).includes(name.trim()))
      return toast.error(t("switch_account.name_already_taken_error"));

    setRenameId(undefined);

    await updateCurrentWallet({
      accounts: currentWallet.accounts.map((i, idx) => {
        if (idx === renameId) {
          return {
            ...i,
            name,
          };
        } else {
          return i;
        }
      }),
    });
  };

  useEffect(() => {
    document.getElementById(String(currentAccount.id)).scrollIntoView();
  }, [currentAccount, currentWallet]);

  return (
    <div className={s.switchAccDiv}>
      <div className={s.accounts}>
        {currentWallet?.accounts.map((acc, i) => (
          <Card
            key={`account-${i}`}
            id={acc.id}
            menuItems={[
              {
                custom: (
                  <CopyBtn
                    title={t("switch_account.copy_address")}
                    value={acc.address}
                    className={cn(s.copy)}
                    iconClassName="text-bg w-8 h-8"
                  />
                ),
              },
              {
                action: () => {
                  setRenameId(acc.id);
                },
                icon: (
                  <TagIcon
                    title={t("switch_account.rename_account")}
                    className="w-8 h-8 cursor-pointer text-bg"
                  />
                ),
              },
              {
                action: () => {
                  navigate(`/pages/show-pk/${acc.id}`);
                },
                icon: (
                  <KeyIcon
                    title={t("switch_account.export_private_key")}
                    className="w-8 h-8 cursor-pointer text-bg"
                  />
                ),
              },
            ]}
            name={acc.name}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              await switchAccount(acc.id);
            }}
            exclamation={
              currentWallet.type === "root" &&
              !currentWallet.hideRoot &&
              acc.id === 0
                ? {
                    description: t("switch_account.account_warning"),
                    aggressive: true,
                  }
                : undefined
            }
            selected={currentAccount.id === acc.id}
            address={shortAddress(acc.address, 7)}
          />
        ))}
      </div>

      <Rename
        active={renameId !== undefined}
        currentName={(() => {
          if (renameId === undefined) return "";
          return currentWallet.accounts[renameId].name;
        })()}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        handler={onRename}
        onClose={() => setRenameId(undefined)}
      />
    </div>
  );
};

export default SwitchAccount;
