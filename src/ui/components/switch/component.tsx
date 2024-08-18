import { Field, Label, Switch } from "@headlessui/react";
import { FC } from "react";
import cn from "classnames";
import s from "./styles.module.scss";

interface Props {
  locked?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

const SwitchComponent: FC<Props> = ({
  locked,
  onChange,
  value,
  label,
  className,
  disabled,
}) => {
  return (
    <Field>
      <div
        className={cn(className ?? "flex gap-2 items-center mt-4", {
          "opacity-50": locked,
        })}
      >
        <Switch
          disabled={disabled}
          checked={value}
          onChange={(v) => {
            if (locked) return;
            onChange(v);
          }}
          className={cn(
            { "bg-orange-600": value, "bg-gray-500": !value },
            s.switch
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              { "translate-x-6": value, "translate-x-0": !value },
              s.toggle
            )}
          />
        </Switch>
        <Label className="mr-4 text-xs font-medium cursor-pointer">
          {label}
        </Label>
      </div>
    </Field>
  );
};

export default SwitchComponent;
