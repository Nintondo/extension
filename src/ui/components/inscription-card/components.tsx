import { FC } from "react";

interface Props {
  label?: string;
  value?: string;
  className?: string;
  iconClassName?: string;
  title?: string;
}

const InscriptionCard: FC<Props> = ({
  label,
  value,
  className,
  iconClassName,
  title,
  ...props
}) => {
  return <div></div>;
};

export default InscriptionCard;
