import toast from "react-hot-toast";
import { useAppState } from "@/ui/states/appState";
import { useControllersState } from "@/ui/states/controllerState";
import { useForm } from "react-hook-form";
import PasswordInput from "@/ui/components/password-input";
import { t } from "i18next";

interface FormType {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const formFields: { name: keyof FormType; label: string }[] = [
    {
      name: "oldPassword",
      label: t("change_password.old_password"),
    },
    {
      name: "password",
      label: t("change_password.new_password"),
    },
    {
      name: "confirmPassword",
      label: t("change_password.confirm_password"),
    },
  ];
  const { register, handleSubmit, reset } = useForm<FormType>({
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { appPassword, logout } = useAppState((v) => ({
    appPassword: v.password,
    logout: v.logout,
  }));

  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState,
  }));
  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));

  const executeChangePassword = async ({ confirmPassword, oldPassword, password }: FormType) => {
    if (appPassword === oldPassword && password === confirmPassword && password !== appPassword) {
      await walletController.saveWallets(undefined, password);
      await updateAppState({ password });
      logout();
    } else {
      reset();
      toast.error("Try again");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(executeChangePassword)}>
      {formFields.map((i) => (
        <PasswordInput key={i.name} register={register} {...i} />
      ))}

      <button className="btn primary" type="submit">
        {t("change_password.change_password")}
      </button>
    </form>
  );
};

export default ChangePassword;
