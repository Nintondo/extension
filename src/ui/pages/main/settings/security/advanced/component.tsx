import Switch from "@/ui/components/switch";
import { t } from "i18next";
import s from "./styles.module.scss";
import { useGetCurrentWallet, useWalletState } from "@/ui/states/walletState";
import { useState } from "react";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";
import { useNavigate } from "react-router-dom";
import { ss } from "@/ui/utils";

const Advanced = () => {
  const { walletController } = useControllersState(ss(["walletController"]));
  const { updateWalletState, wallets } = useWalletState(
    ss(["updateWalletState", "wallets"])
  );
  const currentWallet = useGetCurrentWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleRootAccount = async () => {
    try {
      setLoading(true);
      await walletController.toggleRootAccount();
      const accounts = await walletController.getAccounts();
      const newWallets = wallets.map((i) => {
        if (i.id !== currentWallet?.id) return i;
        return {
          ...i,
          hideRoot: !i.hideRoot,
          accounts: accounts.map((a, idx) => {
            const prevAcc = i.accounts.find((i) => i.address === a);
            return {
              id: idx,
              address: a,
              balance: prevAcc?.balance ?? 0,
              name: prevAcc?.name ?? `Account ${idx + 1}`,
            };
          }),
        };
      });
      await walletController.saveWallets({
        wallets: newWallets,
      });
      await updateWalletState({
        selectedAccount: 0,
      });
      await updateWalletState(
        {
          wallets: newWallets,
        },
        false
      );
      navigate("/");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={s.wrapper}>
      {currentWallet?.type === "root" ? (
        <Switch
          label={t("advanced.root_acc_warning")}
          value={!currentWallet?.hideRoot}
          onChange={toggleRootAccount}
          locked={false}
        />
      ) : (
        <div className={s.blank}>{t("advanced.blank")}</div>
      )}
    </div>
  );
};

export default Advanced;
