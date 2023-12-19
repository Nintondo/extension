import { FC, Fragment, useId } from "react";
import s from "./styles.module.scss";
import cn from "classnames";

export interface MenuItem {
  icon?: JSX.Element;
  action?: () => void;
  custom?: JSX.Element;
}

interface Props {
  items: MenuItem[];
  active: boolean;
}

const Menu: FC<Props> = ({ items, active }) => {
  const prefix = useId();

  return (
    <div className={cn(s.menu, { [s.active]: active })} onClick={(e) => e.stopPropagation()}>
      {items.map((i, index) => {
        if (!i.custom) {
          return (
            <div key={`${index}${prefix}`} onClick={i.action} className={s.item}>
              {i.icon}
            </div>
          );
        } else if (i.custom) {
          return <Fragment key={`${index}${prefix}`}>{i.custom}</Fragment>;
        }
      })}
    </div>
  );
};

export default Menu;
