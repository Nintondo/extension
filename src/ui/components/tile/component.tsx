import { FC } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import s from "./styles.module.scss";

export interface TileProps {
  className?: string;
  onClick?: () => void;
  label: string;
  link?: string;
  icon: React.ReactNode;
}

const Tile: FC<TileProps> = ({ label, className, link, onClick, icon }) => {
  if (!link && onClick) {
    return (
      <div className={cn(s.card, className)} onClick={onClick}>
        {icon}
        <div>{label}</div>
      </div>
    );
  }

  return (
    <Link className={cn(s.card, className)} to={link ?? "#"}>
      {icon}
      <div>{label}</div>
    </Link>
  );
};

export default Tile;
