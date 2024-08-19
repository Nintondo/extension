import s from "./styles.module.scss";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useMemo, useState } from "react";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SwitchAddressType from "@/ui/components/switch-address-type";
import SelectWithHint from "@/ui/components/select-hint/component";
import { t } from "i18next";
import { TailSpin } from "react-loading-icons";
import Switch from "@/ui/components/switch";
import { useAppState } from "@/ui/states/appState";
import { ss } from "@/ui/utils";
import { ADDRESS_TYPES, DEFAULT_HD_PATH } from "@/shared/constant";
import Select from "@/ui/components/select";

const selectOptions = [
  {
    label: "Default",
    value: DEFAULT_HD_PATH,
    lecacyDerivation: false,
    passphrase: "bells",
  },
  {
    label: "Ordinals",
    value: "m/44'/3'/0'/0/0",
    lecacyDerivation: true,
    isLegacySwitchLocked: true,
    passphrase: "",
  },
  {
    label: "Custom",
    value: "",
  },
];

const RestoreMnemonic = () => {
  const [step, setStep] = useState(1);
  const [addressType, setAddressType] = useState(ADDRESS_TYPES[0].value);
  const [hdPath, setHdPath] = useState<string | undefined>(DEFAULT_HD_PATH);
  const [passphrase, setPassphrase] = useState(
    selectOptions[0].passphrase ?? ""
  );
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
        hdPath,
        passphrase,
      });
      navigate("/home");
    } catch (e) {
      console.error(e);
      toast.error(t("new_wallet.restore_mnemonic.invalid_words_error"));
      setStep(1);
    } finally {
      setLoading(false);
    }
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

          <div className="w-full flex flex-col gap-2">
            <div className="flex w-full gap-2 text-sm">
              <input
                disabled={selectedOption.name !== "Custom"}
                className={cn("input w-full mt-1 py-1", s.input)}
                placeholder={t("new_wallet.hd_path")}
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
                  const v = selectOptions.find((i) => i.label === name);

                  if (typeof v !== "undefined") {
                    if (v.lecacyDerivation) {
                      setShowRootAcc(true);
                    } else if (v.lecacyDerivation === false) {
                      setShowRootAcc(false);
                    }
                    setHdPath(v.value);
                    setPassphrase(v.passphrase ?? "");
                  }
                }}
                values={selectOptions.map((i) => ({
                  name: i.label,
                }))}
                className="w-28"
              />
            </div>

            <input
              disabled={selectedOption.name !== "Custom"}
              className={cn(s.input, "input w-full py-2")}
              placeholder={t("new_wallet.passphrase")}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>

          <Switch
            label={t("new_wallet.restore_mnemonic.show_root_acc")}
            value={showRootAcc}
            onChange={() => setShowRootAcc((p) => !p)}
            className="flex gap-2 items-center"
            disabled={
              selectOptions.find((i) => i.value === hdPath)
                ?.isLegacySwitchLocked === true
            }
          />

          <div className="h-11">
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
