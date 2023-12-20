import { FC, useState } from "react";
import s from "./styles.module.scss";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";

import Menu from "@/ui/components/menu";
import cn from "classnames";
import { MenuItem } from "../menu/components";
import { t } from "i18next";

interface Props {
  menuItems: MenuItem[];
  id: number;
  selected: boolean;
  name: string;
  onClick: () => void;

  address?: string;
}

const Card: FC<Props> = ({ menuItems, selected, onClick, name, address }) => {
  const [active, setActive] = useState(false);

  const onMenuClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setActive(true);
  };

  return (
    <div className={cn(s.card, { [s.selected]: selected })} onClick={onClick}>
      <div className={s.wrapper}>
        <div className={cn(s.name)}>{name}</div>
        <div className={s.right}>
          {address ? <div className={s.address}>{address}</div> : ""}
          <button className={s.action} onClick={onMenuClick}>
            <Bars3Icon
              className={cn("w-8 h-8", {
                "text-orange-300": selected,
                "text-text": !selected,
              })}
            />
          </button>
        </div>
      </div>
      <Menu
        active={active}
        items={[
          ...menuItems,
          {
            action: () => {
              setActive(false);
            },
            icon: <XMarkIcon title={t("components.card.close")} className="w-8 h-8 cursor-pointer text-bg" />,
          },
        ]}
      />
    </div>
  );
};

export default Card;
