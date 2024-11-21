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
  const { register, handleSubmit } = useForm<FormType>({
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
    if (appPassword !== oldPassword) {
      toast.error(t("change_password.errors.incorrect_password"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("change_password.errors.passwords_do_not_match"));
      return;
    }
    await walletController.saveWallets({
      newPassword: password,
    });
    await updateAppState({ password });
    await logout();
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit(executeChangePassword, (errors) => {
        const message = Object.values(errors).find(
          (i) => typeof i.message !== "undefined"
        )?.message;
        if (message) {
          toast.error(message);
        }
      })}
    >
      {formFields.map((i) => (
        <PasswordInput key={i.name} register={register} {...i} />
      ))}

      <button className="bottom-btn" type="submit">
        {t("change_password.change_password")}
      </button>
    </form>
  );
};

export default ChangePassword;
