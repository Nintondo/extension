import PasswordInput from "@/ui/components/password-input";
import { useCreateNewWallet } from "@/ui/hooks/wallet";
import { useWalletState } from "@/ui/states/walletState";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface FormType {
  privKey: string;
}

const RestorePrivKey = () => {
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      privKey: "",
    },
  });

  const createNewWallet = useCreateNewWallet();
  const navigate = useNavigate();
  const { updateWalletState } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
  }));

  const recoverWallet = async ({ privKey }: FormType) => {
    try {
      await createNewWallet(privKey, "simple");
      await updateWalletState({ vaultIsEmpty: false });
      navigate("/home");
    } catch (e) {
      toast.error(t("new_wallet.restore_private.invalid_private_key_error"));
    }
  };

  return (
    <form
      className="form"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(recoverWallet)}
    >
      <PasswordInput
        label={t("new_wallet.restore_private.private_key")}
        register={register}
        name="privKey"
      />
      <button className="btn primary" type="submit">
        {t("new_wallet.restore_private.recover")}
      </button>
    </form>
  );
};

export default RestorePrivKey;
