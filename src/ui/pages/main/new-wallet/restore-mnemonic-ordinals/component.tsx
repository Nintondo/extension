import s from "./styles.module.scss";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useWalletState } from "@/ui/states/walletState";
import { useState } from "react";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SwitchAddressType from "@/ui/components/switch-address-type";
import SelectWithHint from "@/ui/components/select-hint/component";
import { t } from "i18next";
import { AddressType } from "bellhdw";
import Loading from "react-loading";
import { useAppState } from "@/ui/states/appState";
import { ss } from "@/ui/utils";

const RestoreMnemonicOrdinals = () => {
  const [step, setStep] = useState(1);
  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));
  const [addressType, setAddressType] = useState(AddressType.P2PKH);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<(string | undefined)[]>(
    new Array(12).fill("")
  );
  const createNewWallet = useCreateNewWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const { network } = useAppState(ss(["network"]));

  const setMnemonic = (v: string, index: number) => {
    if (!v) {
      return;
    }
    const phrase = v.split(" ");
    if (phrase.length === 12) setMnemonicPhrase(phrase);
    else
      setMnemonicPhrase((prev) => {
        prev[index] = v;
        return prev;
      });
  };

  const onNextStep = () => {
    if (mnemonicPhrase.findIndex((f) => f === undefined) !== -1)
      toast.error(t("new_wallet.restore_mnemonic.incomplete_phrase_error"));
    else setStep(2);
  };

  const onRestore = async () => {
    setLoading(true);
    try {
      await createNewWallet({
        payload: mnemonicPhrase.join(" "),
        walletType: "root",
        addressType,
        hideRoot: false,
        hdPath: "m/44'/3'/0'/0/0",
        passphrase: "",
        network,
      });
      await updateWalletState({ vaultIsEmpty: false }, true);
      navigate("/");
    } catch (e) {
      toast.error(t("new_wallet.restore_mnemonic.invalid_words_error"));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={s.restoreMnemonic}>
      <div className={s.stepTitle}>
        <p className={step === 1 ? s.active : ""}>{t("new_wallet.step_1")}</p>
        <p className={step === 2 ? s.active : ""}>{t("new_wallet.step_2")}</p>
      </div>
      {step === 1 ? (
        <div className={cn(s.step, "justify-between")}>
          <div className={s.phrase}>
            {new Array(12).fill("").map((_, index) => (
              <div key={index} className={s.word}>
                <p className="w-6">{index + 1}.</p>
                <SelectWithHint
                  selected={mnemonicPhrase[index]}
                  setSelected={(v) => setMnemonic(v, index)}
                />
              </div>
            ))}
          </div>
          <div className={s.continueWrapper}>
            <button className="btn primary" onClick={onNextStep}>
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      ) : (
        <div className={cn(s.step, "justify-between pb-2")}>
          <SwitchAddressType
            handler={setAddressType}
            selectedType={addressType}
          />
          <button onClick={onRestore} className="btn primary">
            {t("new_wallet.continue")}
          </button>
        </div>
      )}
    </div>
  );
};

export default RestoreMnemonicOrdinals;
