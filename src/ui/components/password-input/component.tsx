import { t } from "i18next";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
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
      {showSeparateLabel && (
        <label className="input-span" htmlFor={name}>
          {label}
        </label>
      )}
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
            required: true,
          })}
          type={hidden ? "password" : "text"}
          className="input w-full"
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
