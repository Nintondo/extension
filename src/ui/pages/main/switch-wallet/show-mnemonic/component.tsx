import CheckPassword from "@/ui/components/check-password";
import { useState } from "react";
import { useParams } from "react-router-dom";
import s from "./styles.module.scss";
import { useControllersState } from "@/ui/states/controllerState";
import { useWalletState } from "@/ui/states/walletState";
import CopyBtn from "@/ui/components/copy-btn";
import { t } from "i18next";
import { ss } from "@/ui/utils";

const ShowMnemonic = () => {
  const [unlocked, setUnlocked] = useState(false);
  const { walletId } = useParams();
  const { stateController } = useControllersState(ss(["stateController"]));
  const [phrase, setPhrase] = useState("");
  const { wallets } = useWalletState(ss(["wallets"]));
  const [walletType, setWalletType] = useState<"simple" | "root">("root");

  const onLogin = async (password: string | undefined) => {
    if (!password) return;
    setPhrase(
      (await stateController.getWalletPhrase(Number(walletId), password)) ?? ""
    );
    setWalletType(wallets[Number(walletId)].type);
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <div className={s.showMnemonic}>
        <CheckPassword handler={onLogin} />
      </div>
    );
  }

  return (
    <div className={s.showMnemonic}>
      <div className={s.phraseDiv}>
        {walletType === "root" ? (
          <div className={s.phraseWrapper}>
            {phrase.split(" ").map((word, index) => (
              <div key={index} className={s.word}>
                <span className={s.wordIdx}>{index + 1}</span>{" "}
                <p className={s.wordWord}>{word}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.privKeyWrapper}>
            <div className={s.secret}>{phrase}</div>
          </div>
        )}
        <div className={s.copyWrapper}>
          <CopyBtn label={t("switch_wallet.copy")} value={phrase} />
        </div>
      </div>
    </div>
  );
};

export default ShowMnemonic;
