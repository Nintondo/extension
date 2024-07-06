import { Switch } from "@headlessui/react";
import { FC } from "react";
import cn from "classnames";

interface Props {
  locked?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  className?: string;
}

const SwitchComponent: FC<Props> = ({
  locked,
  onChange,
  value,
  label,
  className,
}) => {
  return (
    <Switch.Group>
      <div
        className={cn(className ?? "flex gap-2 items-center mt-4", {
          "opacity-50": locked,
        })}
      >
        <Switch
          checked={value}
          onChange={(v) => {
            if (locked) return;
            onChange(v);
          }}
          className={`${value ? "bg-orange-600" : "bg-gray-500"}
          relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span
            aria-hidden="true"
            className={`${value ? "translate-x-6" : "translate-x-0"}
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
        <Switch.Label className="mr-4 cursor-pointer text-xs">
          {label}
        </Switch.Label>
      </div>
    </Switch.Group>
  );
};

export default SwitchComponent;
