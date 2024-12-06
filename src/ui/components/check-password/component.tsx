import { FC, useId } from "react";
import s from "./styles.module.scss";
import { useAppState } from "@/ui/states/appState";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { t } from "i18next";
import { ss } from "@/ui/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  handler: (password?: string) => void;
}

interface FormType {
  password: string;
}

const CheckPassword: FC<Props> = ({ handler }) => {
  const { password: appPassword } = useAppState(ss(["password"]));

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
    <form className={s.form} onSubmit={handleSubmit(checkPassword)}>
      <div className="flex flex-col gap-2">
        <label htmlFor={pwdId} className={s.formTitle}>
          {t("components.check_password.password")}
        </label>
        <input
          id={pwdId}
          type="password"
          className="input"
          {...register("password")}
        />
        <button className="bottom-btn" type="submit">
          {t("components.check_password.continue")}
        </button>
      </div>

      <div className="flex gap-2">
        <div>
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
        </div>
        <span className="text-sm text-gray-200">
          {t("components.check_password.warning")}
        </span>
      </div>
    </form>
  );
};

export default CheckPassword;
