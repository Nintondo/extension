import { useAppState } from "@/ui/states/appState";
import PasswordInput from "@/ui/components/password-input";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { t } from "i18next";
import { ss } from "@/ui/utils";

interface FormType {
  password: string;
  confirmPassword: string;
}

const CreatePassword = () => {
  const formFields: { name: keyof FormType; label: string }[] = [
    {
      label: t("create_password.password"),
      name: "password",
    },
    {
      label: t("create_password.confirm_password"),
      name: "confirmPassword",
    },
  ];

  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });
  const { updateAppState } = useAppState(ss(["updateAppState"]));

  const createPassword = async ({ confirmPassword, password }: FormType) => {
    if (password === confirmPassword) {
      await updateAppState({ password, isUnlocked: true });
    } else {
      toast.error("Passwords dismatches");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(createPassword)}>
      <p className="form-title">{t("create_password.create_password")}</p>
      {formFields.map((i, f) => (
        <PasswordInput
          tabIndex={f + 1}
          showSeparateLabel={false}
          key={i.name}
          register={register}
          {...i}
        />
      ))}

      <button className="btn primary" type="submit">
        {t("create_password.create_password")}
      </button>
    </form>
  );
};

export default CreatePassword;
