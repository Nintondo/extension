import s from "./styles.module.scss";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useWalletState } from "@/ui/states/walletState";
import { useMemo, useState } from "react";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SwitchAddressType from "@/ui/components/switch-address-type";
import SelectWithHint from "@/ui/components/select-hint/component";
import { t } from "i18next";
import { AddressType } from "bellhdw";
import { TailSpin } from "react-loading-icons";
import Switch from "@/ui/components/switch";
import { useAppState } from "@/ui/states/appState";
import { ss } from "@/ui/utils";
import { DEFAULT_HD_PATH } from "@/shared/constant";
import Select from "@/ui/components/select";

const selectOptions = [
  {
    label: "Default",
    value: DEFAULT_HD_PATH,
  },
  {
    label: "Ordinals",
    value: "m/44'/3'/0'/0/0",
    lecacyDerivation: true,
  },
  {
    label: "Custom",
    value: "",
  },
];

const RestoreMnemonic = () => {
  const [step, setStep] = useState(1);
  const { updateWalletState } = useWalletState(ss(["updateWalletState"]));
  const [addressType, setAddressType] = useState(AddressType.P2PKH);
  const [hdPath, setHdPath] = useState<string | undefined>(DEFAULT_HD_PATH);
  const [mnemonicPhrase, setMnemonicPhrase] = useState<(string | undefined)[]>(
    new Array(12).fill("")
  );
  const createNewWallet = useCreateNewWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [showRootAcc, setShowRootAcc] = useState<boolean>(false);
  const { network } = useAppState(ss(["network"]));

  const setMnemonic = (v: string, index: number) => {
    if (!v) {
      return;
    }
    const phrase = v.split(" ");
    if (phrase.length === 12) setMnemonicPhrase(phrase);
    else {
      setMnemonicPhrase((prev) => {
        prev[index] = v;
        return prev;
      });
    }
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
        hideRoot: !showRootAcc,
        network,
      });
      await updateWalletState({ vaultIsEmpty: false });
      navigate("/home");
    } catch (e) {
      console.error(e);
      toast.error(t("new_wallet.restore_mnemonic.invalid_words_error"));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const onSwitch = () => {
    setShowRootAcc((p) => !p);
  };

  const selectedOption = useMemo(() => {
    const v = selectOptions.find((i) => i.value === hdPath)?.label;

    if (v) return { name: v };

    return { name: selectOptions[selectOptions.length - 1].label };
  }, [hdPath]);

  if (loading) return <TailSpin />;

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
          <div>
            <button className="bottom-btn" onClick={onNextStep}>
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

          <div className="w-full flex flex-col gap-3">
            <h5 className="uppercase text-sm">{t("new_wallet.hd_path")}</h5>
            <div className="flex w-full gap-2">
              <input
                className={cn("input w-full mt-1", s.input)}
                placeholder="HD Path"
                value={hdPath ?? ""}
                onChange={(e) =>
                  e.target.value.length
                    ? setHdPath(e.target.value)
                    : setHdPath(undefined)
                }
              />
              <Select
                anchor="top"
                selected={selectedOption}
                setSelected={({ name }) => {
                  const v = selectOptions.find((i) => i.label === name)?.value;

                  if (typeof v !== "undefined") setHdPath(v);
                }}
                values={selectOptions.map((i) => ({
                  name: i.label,
                }))}
              />
            </div>
            <Switch
              label={t("new_wallet.restore_mnemonic.show_root_acc")}
              value={showRootAcc}
              onChange={onSwitch}
              className="flex gap-2 items-center"
            />
          </div>

          <div>
            <button onClick={onRestore} className="bottom-btn">
              {t("new_wallet.continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestoreMnemonic;
