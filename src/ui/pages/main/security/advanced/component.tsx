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
      await updateWalletState({
        wallets: await Promise.all(
          wallets.map(async (i) => {
            const accounts = await walletController.getAccounts();
            let newAccounts = i.accounts;
            if (await walletController.getCurrentAccountHideRootState()) {
              accounts.forEach((account) => {
                if (!newAccounts.find((f) => f.address === account)) {
                  newAccounts.push({
                    id: newAccounts.length + 1,
                    name: `Account ${newAccounts.length + 1}`,
                    address: account,
                    balance: 0,
                  });
                }
              });
              newAccounts = newAccounts.slice(1);
            } else {
              newAccounts = [
                {
                  id: 0,
                  name: "Root Account",
                  address: accounts[0],
                  balance: 0,
                },
                ...newAccounts,
              ];
            }
            const result = {
              ...i,
              hideRoot: i.id === currentWallet.id ? !i.hideRoot : i.hideRoot,
              accounts: await walletController.loadAccountsData(
                i.id,
                newAccounts
              ),
            };
            return result;
          })
        ),
        selectedAccount: 0,
      });
      navigate("/");
    } catch (e) {
      console.log(e);
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
