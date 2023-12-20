import cn from "classnames";
import { FC, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { t } from "i18next";
import { useAppState } from "@/ui/states/appState";

interface Props {
  onChange: (value: number) => void;
  value: number;
}

const FeeInput: FC<Props> = ({ onChange, value }) => {
  const [selected, setSelected] = useState<10 | 20 | 3>(value === 10 || value === 20 ? value : 3);

  const cards = [
    {
      title: t("send.create_send.fee_input.slow"),
      description: "10 sat/Vb",
      value: 10,
    },
    {
      title: t("send.create_send.fee_input.fast"),
      description: "20 sat/Vb",
      value: 20,
    },
    {
      title: t("send.create_send.fee_input.custom"),
      value: 3,
    },
  ];

  useEffect(() => {
    if (selected !== 3) {
      onChange(selected);
    }
  }, [selected, onChange]);

  return (
    <div className={s.container}>
      <div className={s.cardWrapper}>
        {cards.map((i) => (
          <FeeCard
            key={i.value}
            description={i.description}
            title={i.title}
            onSelect={() => setSelected(i.value as typeof selected)}
            selected={i.value === selected}
          />
        ))}
      </div>
      <input
        type="number"
        className={cn("input", { hidden: selected !== 3 })}
        placeholder="sat/Vb"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

interface FeeCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

const FeeCard: FC<FeeCardProps> = ({ selected, onSelect, title, description }) => {

  const { language } = useAppState((v) => ({
    language: v.language
  }));

  return (
    <div className={cn(s.card, { [s.cardSelected]: selected })} onClick={onSelect}>
      <div className={cn(s.title, language !== "en" && s.russian)}>{title}</div>
      {description ? <div className={s.description}>{description}</div> : ""}
    </div>
  );
};

export default FeeInput;
