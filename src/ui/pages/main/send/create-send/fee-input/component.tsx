import cn from "classnames";
import { FC, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { t } from "i18next";
import { useAppState } from "@/ui/states/appState";
import { useControllersState } from "@/ui/states/controllerState";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";

interface Props {
  onChange: (value: number) => void;
  value: number;
}

const FeeInput: FC<Props> = ({ onChange, value }) => {
  const [selected, setSelected] = useState<number>(0);
  const [cards, setCards] = useState<
    { title: string; description?: string; value: number }[]
  >([]);
  const { feeRates } = useTransactionManagerContext();

  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));

  useEffect(() => {
    if (selected !== 3) {
      onChange(selected);
    }
  }, [selected, onChange]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      setCards([
        {
          title: t("send.create_send.fee_input.slow"),
          description: `${feeRates.slow ?? "~"} sat/Vb`,
          value: feeRates.slow,
        },
        {
          title: t("send.create_send.fee_input.fast"),
          description: `${feeRates.fast ?? "~"} sat/Vb`,
          value: feeRates.fast,
        },
        {
          title: t("send.create_send.fee_input.custom"),
          value: 3,
        },
      ]);
      setSelected(feeRates.slow);
    })();
  }, [apiController, feeRates]);

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

const FeeCard: FC<FeeCardProps> = ({
  selected,
  onSelect,
  title,
  description,
}) => {
  const { language } = useAppState((v) => ({
    language: v.language,
  }));

  return (
    <div
      className={cn(s.card, { [s.cardSelected]: selected })}
      onClick={onSelect}
    >
      <div className={cn(s.title, language !== "en" && s.russian)}>{title}</div>
      {description ? <div className={s.description}>{description}</div> : ""}
    </div>
  );
};

export default FeeInput;
