import s from "./styles.module.scss";
import { ADDRESS_TYPES } from "@/shared/constant";
import { FC } from "react";
import cn from "classnames";
import { AddressType } from "bellhdw";

interface Props {
  handler: (type: AddressType) => void;
  selectedType: AddressType;
}

const SwitchAddressType: FC<Props> = ({ handler, selectedType }) => {
  return (
    <div className={s.allTypes}>
      {ADDRESS_TYPES.map((i) => (
        <div
          key={i.value}
          className={cn(s.addressType, {
            [s.selected]: selectedType === i.value,
          })}
          onClick={() => handler(i.value)}
        >
          <div className={s.wrapper}>
            <p className={s.title}>{i.name.replace(/ \(.*\)$/, "")}</p>
            <p className={s.value}>{i.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwitchAddressType;
