import { useCallback, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { useWalletState } from "@/ui/states/walletState";
import ReactLoading from "react-loading";
import { useLocation, useNavigate } from "react-router-dom";
import { useControllersState } from "@/ui/states/controllerState";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import cn from "classnames";
import { useAppState } from "@/ui/states/appState";
import CopyBtn from "@/ui/components/copy-btn";
import toast from "react-hot-toast";
import SwitchAddressType from "@/ui/components/switch-address-type";
import { t } from "i18next";
import { AddressType } from "bellhdw";
import Switch from "@/ui/components/switch";

const NewMnemonic = () => {
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedPhrase, setSavedPhrase] = useState(false);
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));
  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState,
  }));
  const { walletController, stateController } = useControllersState((v) => ({
    walletController: v.walletController,
    stateController: v.stateController,
  }));
  const [mnemonicPhrase, setMnemonicPhrase] = useState<string | undefined>(
    undefined
  );
  const [addressType, setAddressType] = useState<AddressType>(
    AddressType.P2PKH
  );

  const createNewWallet = useCreateNewWallet();

  const init = useCallback(async () => {
    if (location.state?.pending) {
      return setMnemonicPhrase(location.state.pending);
    }

    const phrase = await walletController.generateMnemonicPhrase();
    await updateAppState({
      pendingWallet: phrase,
    });
    setMnemonicPhrase(phrase);
  }, [
    setMnemonicPhrase,
    updateAppState,
    walletController,
    location.state?.pending,
  ]);

  useEffect(() => {
    if (mnemonicPhrase) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    init();
  }, [mnemonicPhrase, init]);

  const navigate = useNavigate();

  const onCreate = async () => {
    if (!mnemonicPhrase) {
      toast.error(t("new_wallet.new_mnemonic.error_phrase_blank"));
      return;
    }
    setLoading(true);
    await createNewWallet({
      phrase: mnemonicPhrase,
      walletType: "root",
      addressType,
      hideRoot: true,
    });
    await updateWalletState({ vaultIsEmpty: false });
    await stateController.clearPendingWallet();
    setLoading(false);
    navigate("/home");
  };

  const onSwitch = () => {
    setSavedPhrase((p) => !p);
  };

  if (!mnemonicPhrase || loading) {
    return <ReactLoading type="spin" color="#ffbc42" />;
  }

  return (
    <div className={s.newMnemonic}>
      <div className={s.stepTitle}>
        <p className={cn({ [s.active]: step === 1 })}>
          {t("new_wallet.step_1")}
        </p>
        <p className={cn({ [s.active]: step === 2 })}>
          {t("new_wallet.step_2")}
        </p>
      </div>
      {step === 1 ? (
        <div className={cn(s.step, "justify-between")}>
          <div>
            <p className={s.warning}>{t("new_wallet.new_mnemonic.warning")}</p>
            <div className={s.phrase}>
              {mnemonicPhrase.split(" ").map((word, index) => (
                <div key={index} className={s.word}>
                  <span className={s.wordIndex}>{index + 1}.</span>
                  <p className={s.wordWord}>{word}</p>
                </div>
              ))}
            </div>
          </div>
          <CopyBtn
            label={t("new_wallet.new_mnemonic.copy")}
            value={mnemonicPhrase}
            className="mx-auto flex items-center gap-1"
          />
          <Switch
            label={t("new_wallet.new_mnemonic.i_saved_this_phrase")}
            onChange={onSwitch}
            value={savedPhrase}
            className={s.savePhrase}
          />
          <div className={s.continueWrapper}>
            <button
              className="btn primary w-full"
              onClick={() => setStep(2)}
              disabled={!savedPhrase}
            >
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      ) : (
        <div className={s.step}>
          <SwitchAddressType
            handler={setAddressType}
            selectedType={addressType}
          />
          <div className={s.continueWrapper}>
            <button onClick={onCreate} className="btn primary w-full">
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMnemonic;
