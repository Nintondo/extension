import s from "./styles.module.scss";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useWalletState } from "@/ui/states/walletState";
import { useCallback, useState } from "react";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SwitchAddressType from "@/ui/components/switch-address-type";
import SelectWithHint from "@/ui/components/select-hint/component";
import { t } from "i18next";
import { AddressType } from "bellhdw";
import Loading from "react-loading";

const RestoreMnemonic = () => {
  const [step, setStep] = useState(1);
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const [addressType, setAddressType] = useState(AddressType.P2PKH);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<(string | undefined)[]>(
    new Array(12).fill("")
  );
  const createNewWallet = useCreateNewWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const setMnemonic = useCallback(
    (v: string, index: number) => {
      if (!v) {
        return;
      }
      const phrase = v.split(" ");
      if (phrase.length === 12) setMnemonicPhrase(phrase);
      else setMnemonicPhrase(mnemonicPhrase.with(index, v));
    },
    [mnemonicPhrase]
  );

  const onNextStep = () => {
    if (mnemonicPhrase.findIndex((f) => f === undefined) !== -1)
      toast.error(t("new_wallet.restore_mnemonic.incomplete_phrase_error"));
    else setStep(2);
  };

  const onRestore = async () => {
    setLoading(true);
    try {
      await createNewWallet(mnemonicPhrase.join(" "), "root", addressType);
      await updateWalletState({ vaultIsEmpty: false });
      navigate("/home");
    } catch (e) {
      toast.error(t("new_wallet.restore_mnemonic.invalid_words_error"));
      setStep(1);
    }finally { setLoading(false) }
  };

  if(loading) return <Loading />

  return (
    <div className={s.restoreMnemonic}>
      <div className={s.stepTitle}>
        <p className={step === 1 ? s.active : ""}>{t("new_wallet.step_1")}</p>
        <p className={step === 2 ? s.active : ""}>{t("new_wallet.step_2")}</p>
      </div>
      {step === 1 ? (
        <div className={cn(s.stepOneWrapper, s.step)}>
          <div className={cn(s.stepOne, s.step)}>
            <div>
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
            </div>
            <div className={s.continueWrapper}>
              <button
                className={cn(s.continue, "btn", "primary")}
                onClick={onNextStep}
              >
                {t("new_wallet.continue")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(s.stepTwo, s.step)}>
          <div className={s.continueWrapper}>
            <SwitchAddressType
              handler={setAddressType}
              selectedType={addressType}
            />
            <button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={onRestore}
              className={cn(s.continue, "btn", "primary")}
            >
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestoreMnemonic;
