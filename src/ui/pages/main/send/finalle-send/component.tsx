import { browserTabsCreate } from "@/shared/utils/browser";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/24/solid";

import s from "./styles.module.scss";
import { t } from "i18next";
import { BELLS_API_URL } from "@/shared/constant";
import { usePushBellsTxCallback } from "@/ui/hooks/transactions";
import toast from "react-hot-toast";

const FinalleSend = () => {
  const { txId } = useParams();
  const location = useLocation();
  const pushTx = usePushBellsTxCallback();
  const navigate = useNavigate();

  const onClick = async () => {
    await browserTabsCreate({
      active: true,
      url: `${BELLS_API_URL}/tx/${txId}`,
    });
  };

  const rebroadcastTransaction = async () => {
    try {
      const txId = (await pushTx(location.state.hex)).txid;
      if (txId) toast(t("successfully_rebroadcasted"));
    } catch (e) {
      toast.error(e.message);
      console.error(e);
      navigate(-1);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.resultContainer}>
        <div className={s.resultIconContainer}>
          <CheckIcon className={s.resultIcon} />
        </div>
        <h3 className={s.result}>{t("send.finalle_send.success")}</h3>
      </div>

      <div className={s.btnContainer}>
        <Link to={"/home"} className="btn primary w-full">
          {t("send.finalle_send.back")}
        </Link>
        <div className="flex w-full justify-center">
          <button
            className={s.btn}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={rebroadcastTransaction}
          >
            {t("send.finalle_send.rebroadcast_transaction")}
          </button>
          <button
            className={s.btn}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={onClick}
          >
            {t("send.finalle_send.explorer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalleSend;
