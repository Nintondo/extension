import { FC } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import s from "./styles.module.scss";

export interface TileProps {
  className?: string;
  onClick?: () => void;
  label: string;
  link?: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
}

const Tile: FC<TileProps> = ({
  label,
  className,
  link,
  onClick,
  icon,
  description,
  selected,
}) => {
  const content = (
    <>
      {icon && <div className={s.iconContainer}>{icon}</div>}
      <div className={s.content}>
        <div className={s.label}>{label}</div>
        {description && <div className={s.description}>{description}</div>}
      </div>
    </>
  );

  if (!link && onClick) {
    return (
      <div
        className={cn(s.card, { [s.selected]: selected }, className)}
        onClick={onClick}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      className={cn(s.card, { [s.selected]: selected }, className)}
      to={link ?? "#"}
    >
      {content}
    </Link>
  );
};

export default Tile;
