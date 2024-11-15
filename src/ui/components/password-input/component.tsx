import { t } from "i18next";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import s from "./styles.module.scss";

const PasswordInput = <T extends FieldValues>({
  label,
  name,
  register,
  showSeparateLabel = true,
  tabIndex,
}: {
  register: UseFormRegister<T>;
  name: Path<T>;
  label: string;
  showSeparateLabel?: boolean;
  tabIndex?: number;
}) => {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="form-field">
      {showSeparateLabel ? (
        <label className="input-span" htmlFor={name}>
          {label}
        </label>
      ) : undefined}
      <div className={s.inputWrapper}>
        <input
          tabIndex={tabIndex ?? 0}
          id={name}
          {...register(name, {
            minLength: {
              value: 1,
              message: t(
                "components.password_input.should_be_more_than_1_symbol"
              ),
            },
            maxLength: {
              value: 70,
              message: t(
                "components.password_input.should_be_less_than_70_symbols"
              ),
            },
            required: {
              value: true,
              message: t("components.password_input.required"),
            },
          })}
          type={hidden ? "password" : "text"}
          className={"input w-full"}
          placeholder={showSeparateLabel ? "" : label}
        />
        <div
          className={s.hideBtn}
          onClick={(e) => {
            e.preventDefault();
            setHidden((p) => !p);
          }}
        >
          {hidden ? (
            <EyeIcon className={s.icon} />
          ) : (
            <EyeSlashIcon className={s.icon} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordInput;
