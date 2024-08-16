import { useCallback, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { useWalletState } from "@/ui/states/walletState";
import { TailSpin } from "react-loading-icons";
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
import { ss } from "@/ui/utils";

const NewMnemonic = () => {
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedPhrase, setSavedPhrase] = useState(false);
  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));
  const { updateAppState, network } = useAppState(
    ss(["updateAppState", "network"])
  );
  const { walletController, stateController } = useControllersState(
    ss(["walletController", "stateController"])
  );
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
  }, [updateAppState, walletController, location.state?.pending]);

  useEffect(() => {
    if (mnemonicPhrase) return;
    init().catch((e) => {
      if ((e as Error).message) toast.error((e as Error).message);
    });
  }, [mnemonicPhrase, init]);

  const navigate = useNavigate();

  const onCreate = async () => {
    if (!mnemonicPhrase) {
      toast.error(t("new_wallet.new_mnemonic.error_phrase_blank"));
      return;
    }
    setLoading(true);
    try {
      await stateController.clearPendingWallet();
      await createNewWallet({
        payload: mnemonicPhrase,
        walletType: "root",
        addressType,
        hideRoot: true,
        network,
      });
      await updateWalletState({ vaultIsEmpty: false });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(e.message);
    }
    setLoading(false);
    navigate("/");
  };

  const onSwitch = () => {
    setSavedPhrase((p) => !p);
  };

  if (!mnemonicPhrase || loading) {
    return <TailSpin />;
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
          <div className="px-4">
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
            className="mx-auto flex items-center gap-1 px-4 py-2 text-base bg-neutral-900 border border-neutral-800 rounded-xl"
          />
          <Switch
            label={t("new_wallet.new_mnemonic.i_saved_this_phrase")}
            onChange={onSwitch}
            value={savedPhrase}
            className={s.savePhrase}
          />
          <div>
            <button
              className="bottom-btn disabled:cursor-not-allowed"
              onClick={() => setStep(2)}
              disabled={!savedPhrase}
            >
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      ) : (
        <div className={s.step}>
          <div className="px-4">
            <SwitchAddressType
              handler={setAddressType}
              selectedType={addressType}
            />
          </div>
          <div>
            <button onClick={onCreate} className="bottom-btn">
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMnemonic;
