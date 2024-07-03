import toast from "react-hot-toast";
import { useAppState } from "@/ui/states/appState";
import { useControllersState } from "@/ui/states/controllerState";
import { useForm } from "react-hook-form";
import PasswordInput from "@/ui/components/password-input";
import { t } from "i18next";
import { ss } from "@/ui/utils";

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

  const { password: appPassword, logout } = useAppState(
    ss(["password", "logout"])
  );

  const { updateAppState } = useAppState(ss(["updateAppState"]));
  const { walletController } = useControllersState(ss(["walletController"]));

  const executeChangePassword = async ({
    confirmPassword,
    oldPassword,
    password,
  }: FormType) => {
    if (
      appPassword === oldPassword &&
      password === confirmPassword &&
      password !== appPassword
    ) {
      await walletController.saveWallets({
        newPassword: password,
      });
      await updateAppState({ password }, true);
      await logout();
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
