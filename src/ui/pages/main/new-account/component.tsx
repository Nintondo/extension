import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateNewAccount } from "@/ui/hooks/wallet";
import { useForm } from "react-hook-form";
import { t } from "i18next";
import { useState } from "react";
import { TailSpin } from "react-loading-icons";
import { useGetCurrentWallet } from "@/ui/states/walletState";

interface FormType {
  name: string;
}

const NewAccount = () => {
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      name: "",
    },
  });
  const navigate = useNavigate();

  const createNewAccount = useCreateNewAccount();
  const currentWallet = useGetCurrentWallet();
  const [loading, setLoading] = useState<boolean>(false);

  const nameAlreadyExists = (name: string) => {
    return (
      currentWallet?.accounts.find((f) => f.name?.trim() === name.trim()) !==
      undefined
    );
  };

  const createNewAcc = async ({ name }: FormType) => {
    if (name.length > 10) return toast.error(t("new_account.max_length_error"));
    if (nameAlreadyExists(name))
      return toast.error(t("new_account.name_taken_error"));
    setLoading(true);
    await createNewAccount(name);
    toast.success(t("new_account.account_created_message"));
    navigate("/");
  };

  if (loading) {
    return <TailSpin className="animate-spin" />;
  }

  return (
    <form className="form" onSubmit={handleSubmit(createNewAcc)}>
      <p className="form-title">{t("new_account.enter_name_label")}</p>
      <input
        type="text"
        className="input"
        {...register("name", {
          maxLength: 14,
        })}
      />
      <button className="btn primary" type="submit">
        {t("new_account.create_new_account")}
      </button>
    </form>
  );
};

export default NewAccount;
