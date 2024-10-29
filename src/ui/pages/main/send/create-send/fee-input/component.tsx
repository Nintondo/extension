import cn from "classnames";
import { FC, useEffect, useMemo, useState } from "react";
import s from "./styles.module.scss";
import { t } from "i18next";
import { useAppState } from "@/ui/states/appState";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { DEFAULT_FEES } from "@/shared/constant";
import { ss } from "@/ui/utils";
import InputNumber from "@/ui/components/input-number";

interface Props {
  onChange: (value?: number) => void;
  value?: number;
}

const MAX_FEE = 200_000;

const FeeInput: FC<Props> = ({ onChange, value }) => {
  const { feeRates } = useTransactionManagerContext();
  const [selected, setSelected] = useState<number>(
    feeRates?.slow ?? DEFAULT_FEES.slow
  );

  const onSelect = (value: number) => {
    setSelected(value);
    if (value !== 3) {
      onChange(value);
    }
  };

  const cards = useMemo(
    () => [
      {
        title: t("send.create_send.fee_input.slow"),
        description: `${feeRates?.slow ?? DEFAULT_FEES.slow} sat/Vb`,
        value: feeRates?.slow ?? DEFAULT_FEES.slow,
      },
      {
        title: t("send.create_send.fee_input.fast"),
        description: `${feeRates?.fast ?? DEFAULT_FEES.fast} sat/Vb`,
        value: feeRates?.fast ?? DEFAULT_FEES.fast,
      },
      {
        title: t("send.create_send.fee_input.custom"),
        description: "",
        value: 3,
      },
    ],
    [feeRates]
  );

  useEffect(() => {
    setSelected((prev) => {
      if (prev === 3) return prev;
      if (cards.some((i) => i.value === prev)) return prev;
      return feeRates?.slow ?? DEFAULT_FEES.slow;
    });
  }, [feeRates, cards]);

  return (
    <div className={s.container}>
      <div className={s.cardWrapper}>
        {cards.map((f, i) => (
          <FeeCard
            key={i}
            description={f.description}
            title={f.title}
            onSelect={() => onSelect(f.value)}
            selected={f.value === selected}
          />
        ))}
      </div>
      {selected === 3 && (
        <InputNumber
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          onlyInt
          max={MAX_FEE}
        />
      )}
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
  const { language } = useAppState(ss(["language"]));

  return (
    <div
      className={cn(s.card, { [s.cardSelected]: selected })}
      onClick={onSelect}
    >
      <div className={cn(s.title, language === "ru" && s.russian)}>{title}</div>
      {description ? <div className={s.description}>{description}</div> : ""}
    </div>
  );
};

export default FeeInput;
