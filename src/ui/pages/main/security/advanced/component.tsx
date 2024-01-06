import Switch from "@/ui/components/switch";
import { t } from "i18next";
import s from "./styles.module.scss";
import { useGetCurrentWallet, useWalletState } from "@/ui/states/walletState";
import { useState } from "react";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";
import { useNavigate } from "react-router-dom";

const Advanced = () => {
  const currentWallet = useGetCurrentWallet();
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));
  const { updateWalletState, wallets } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
    wallets: v.wallets,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const toogleRootAccount = async () => {
    try {
      setLoading(true);
      await walletController.toogleRootAccount();
      const accounts = await walletController.getAccounts();
      await updateWalletState({
        wallets: wallets.map((i) => {
          if (i.id !== currentWallet.id) return i;
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
        }),
        selectedAccount: 0,
      });
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
      <Switch
        label={t("advanced.root_acc_warning")}
        value={currentWallet.hideRoot}
        onChange={() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          toogleRootAccount();
        }}
        locked={false}
      />
    </div>
  );
};

export default Advanced;
