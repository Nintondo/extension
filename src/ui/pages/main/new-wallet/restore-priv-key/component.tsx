import PasswordInput from "@/ui/components/password-input";
import Select from "@/ui/components/select";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useAppState } from "@/ui/states/appState";
import { ss } from "@/ui/utils";
import { t } from "i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TailSpin } from "react-loading-icons";
import { useNavigate } from "react-router-dom";

interface FormType {
  privKey: string;
}

const waysToRestore: { name: "wif" | "hex" }[] = [
  { name: "wif" },
  { name: "hex" },
];

const RestorePrivKey = () => {
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      privKey: "",
    },
  });
  const [selectedWayToRestore, setSelectedWayToRestore] = useState<{
    name: "wif" | "hex";
  }>(waysToRestore[0]);

  const createNewWallet = useCreateNewWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const { network } = useAppState(ss(["network"]));

  const recoverWallet = async ({ privKey }: FormType) => {
    setLoading(true);
    try {
      await createNewWallet({
        payload: privKey,
        walletType: "simple",
        restoreFrom: selectedWayToRestore.name,
        network,
      });
      navigate("/");
    } catch (e) {
      console.error(e);
      toast.error(t("new_wallet.restore_private.invalid_private_key_error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TailSpin className="animate-spin" />;

  return (
    <form className="form" onSubmit={handleSubmit(recoverWallet)}>
      <div className="flex flex-col gap-4">
        <PasswordInput
          label={t("new_wallet.restore_private.private_key")}
          register={register}
          name="privKey"
        />
        <Select<"wif" | "hex">
          label={t("new_wallet.restore_from_label")}
          values={waysToRestore}
          selected={selectedWayToRestore}
          setSelected={(name) => {
            setSelectedWayToRestore(name);
          }}
        />
      </div>
      <button className="bottom-btn" type="submit">
        {t("new_wallet.restore_private.recover")}
      </button>
    </form>
  );
};

export default RestorePrivKey;
