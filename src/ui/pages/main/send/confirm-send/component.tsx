import { usePushTidecoinTxCallback } from "@/ui/hooks/transactions";
import s from "./styles.module.scss";
import cn from "classnames";
import { useState } from "react";
import ReactLoading from "react-loading";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUpdateAddressBook } from "@/ui/hooks/app";
import { t } from "i18next";

const ConfirmSend = () => {
  const location = useLocation();
  const pushTx = usePushTidecoinTxCallback();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const updateAddressBook = useUpdateAddressBook();

  const confirmSend = async () => {
    setLoading(true);
    try {
      navigate(
        `/pages/finalle-send/${(await pushTx(location.state.hex))?.txid ?? ""}`
      );

      if (location.state.save) {
        await updateAddressBook(location.state.toAddress);
      }
    } catch (e) {
      toast.error(e);
      console.error(e);
    }
  };

  const fields = [
    {
      label: t("send.confirm_send.to_addrses"),
      value: location.state.toAddress,
    },
    {
      label: t("send.confirm_send.from_address"),
      value: location.state.fromAddress,
    },
    {
      label: t("send.confirm_send.amount"),
      value: location.state.amount + " BEL",
    },
    {
      label: t("send.confirm_send.fee"),
      value: `${location.state.feeAmount / 10 ** 8} BEL (${location.state.includeFeeInAmount
        ? t("send.confirm_send.included")
        : t("send.confirm_send.not_included")
        })`,
    },
  ];

  return (
    <div className={s.wrapper}>
      {!loading ? (
        <div className={s.container}>
          <div className={s.container}>
            {fields.map((i) => (
              <div key={i.label} className={s.item}>
                <div className={s.label}>{i.label}:</div>
                <div className={s.input}>{i.value}</div>
              </div>
            ))}
          </div>
          <button
            className={cn("btn primary", s.confirmBtn)}
            onClick={confirmSend}
          >
            {t("send.confirm_send.confirm")}
          </button>
        </div>
      ) : (
        <ReactLoading type="spin" color="#ffbc42" />
      )}
    </div>
  );
};

export default ConfirmSend;
