import { FC, useId } from "react";
import s from "./styles.module.scss";
import { useAppState } from "@/ui/states/appState";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { t } from "i18next";

interface Props {
  handler: (password?: string) => void;
}

interface FormType {
  password: string;
}

const CheckPassword: FC<Props> = ({ handler }) => {
  const { appPassword } = useAppState((v) => ({ appPassword: v.password }));

  const pwdId = useId();

  const { register, handleSubmit } = useForm<FormType>();

  const checkPassword = ({ password }: FormType) => {
    if (password !== appPassword)
      return toast.error(
        t("components.check_password.incorrect_password_error")
      );
    handler(password);
  };

  return (
    <form
      className={s.form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(checkPassword)}
    >
      <label htmlFor={pwdId} className={s.formTitle}>
        {t("components.check_password.password")}
      </label>
      <input
        id={pwdId}
        type="password"
        className="input"
        {...register("password")}
      />
      <button className="btn primary" type="submit">
        {t("components.check_password.continue")}
      </button>
    </form>
  );
};

export default CheckPassword;
