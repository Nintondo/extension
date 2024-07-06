import { InputHTMLAttributes, useCallback, useState } from "react";

interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "min" | "max"
  > {
  onChange?: (v?: number) => void;
  value?: number;
  min?: number;
  max?: number;
  onlyInt?: boolean;
}

export default function InputNumber({
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  value,
  onlyInt = false,
  ...props
}: Props) {
  const [textValue, setTextValue] = useState(value ? String(value) : "");

  const validateNumber = useCallback(
    (v: string): boolean => {
      const numberReg = onlyInt ? /^\d*$/ : /^\d*\.{0,1}\d{0,8}$/;
      return numberReg.test(v);
    },
    [onlyInt]
  );

  const onInputChange = useCallback(
    (value: string) => {
      if (validateNumber(value)) {
        const last = value.length - 1;
        const v =
          value[last] === "."
            ? parseInt(value.slice(0, Math.max(1, last - 1)))
            : parseFloat(value);
        if (v <= max && v >= min) {
          setTextValue(value);
          onChange && onChange(v);
        } else if (value === "") {
          setTextValue(value);
        }
      }
    },
    [max, min, onChange, validateNumber]
  );

  return (
    <input
      type="text"
      value={textValue}
      className={"input"}
      onChange={(e) => onInputChange(e.target.value)}
      {...props}
    />
  );
}
