import { TagIcon, KeyIcon } from "@heroicons/react/24/outline";
import s from "./styles.module.scss";
import { shortAddress } from "@/shared/utils/transactions";
import cn from "classnames";
import CopyBtn from "@/ui/components/copy-btn";
import { useSwitchAccount } from "@/ui/hooks/wallet";
import { useNavigate } from "react-router-dom";
import Card from "@/ui/components/card";
import Rename from "@/ui/components/rename";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { t } from "i18next";
import {
  useGetCurrentAccount,
  useGetCurrentWallet,
  useWalletState,
} from "@/ui/states/walletState";
import { ss } from "@/ui/utils";

const SwitchAccount = () => {
  const [renameId, setRenameId] = useState<number | undefined>(undefined);

  const switchAccount = useSwitchAccount();
  const navigate = useNavigate();
  const { updateAccount } = useWalletState(ss(["updateAccount"]));

  const currentAccount = useGetCurrentAccount();
  const currentWallet = useGetCurrentWallet();
  const onRename = async (name: string) => {
    if (!currentWallet || typeof renameId === "undefined") return;
    if (currentWallet.accounts.map((i) => i.name).includes(name.trim()))
      return toast.error(t("switch_account.name_already_taken_error"));

    await updateAccount(currentWallet.id, renameId, { name }, true);
    setRenameId(undefined);
  };

  useEffect(() => {
    if (!currentWallet || !currentAccount) return;
    if (
      currentWallet.accounts.findIndex(
        (f) => f.address === currentAccount.address
      ) > 5
    ) {
      const element = document.getElementById(String(currentAccount.id));
      if (element) {
        element.scrollIntoView();
      }
    }
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
            name={acc.name ?? "Error"}
            onClick={async () => {
              await switchAccount(acc.id);
            }}
            isRoot={
              currentWallet.type === "root" &&
              !currentWallet.hideRoot &&
              acc.id === 0
            }
            selected={currentAccount?.id === acc.id}
            address={shortAddress(acc.address, 7)}
          />
        ))}
      </div>

      <Rename
        active={renameId !== undefined}
        currentName={(() => {
          if (renameId === undefined) return "";
          return currentWallet?.accounts[renameId].name;
        })()}
        handler={onRename}
        onClose={() => setRenameId(undefined)}
      />
    </div>
  );
};

export default SwitchAccount;
