import { useEffect, useState } from "react";
import s from "./styles.module.scss";
import CheckPassword from "@/ui/components/check-password";
import { useParams } from "react-router-dom";
import { useGetCurrentWallet } from "@/ui/states/walletState";
import { useControllersState } from "@/ui/states/controllerState";
import CopyBtn from "@/ui/components/copy-btn";
import { t } from "i18next";

const ShowPk = () => {
  const [unlocked, setUnlocked] = useState(false);
  const { accId } = useParams();
  const currentWallet = useGetCurrentWallet();
  const { keyringController } = useControllersState((v) => ({
    keyringController: v.keyringController,
  }));
  const [secret, setSecret] = useState("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const address = currentWallet.accounts[Number(accId)].address;
      setSecret(await keyringController.exportAccount(address ?? ""));
    })();
  }, [setSecret, keyringController, accId, currentWallet]);

  return (
    <div className={s.showPk}>
      {unlocked ? (
        <div className={s.showPkDiv}>
          <div className={s.secretContainer}>
            <div className={s.secret}>{secret}</div>
          </div>
          <CopyBtn label={t("switch_account.show_pk.copy")} value={secret} />
        </div>
      ) : (
        <CheckPassword
          handler={() => {
            setUnlocked(true);
          }}
        />
      )}
    </div>
  );
};

export default ShowPk;
