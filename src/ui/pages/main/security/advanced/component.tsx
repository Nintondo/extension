import Switch from "@/ui/components/switch";
import s from "./styles.module.scss";
import { t } from "i18next";
import { useGetCurrentWallet, useWalletState } from "@/ui/states/walletState";
import { useState } from "react";
import CheckPassword from "@/ui/components/check-password";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";

const Advanced = () => {
  const currentWallet = useGetCurrentWallet();
  const [unlocked, setUnlocked] = useState(true);
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const [loading, setLoading] = useState<boolean>(false);

  const toogleRootAccount = async (password: string) => {
    try {
      setLoading(true);
      const wallets = await walletController.toogleRootAccount(password);
      await updateWalletState({ wallets });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked)
    return (
      <CheckPassword
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        handler={toogleRootAccount}
      />
    );

  if (loading) return <Loading />;

  return (
    <div className={s.wrapper}>
      <Switch
        label={t("advanced.root_acc_warning")}
        value={currentWallet.hideRoot}
        onChange={() => {
          setUnlocked(false);
        }}
        locked={false}
      />
    </div>
  );
};

export default Advanced;
