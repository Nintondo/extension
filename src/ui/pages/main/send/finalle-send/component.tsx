import { browserTabsCreate } from "@/shared/utils/browser";
import { CheckIcon } from "@heroicons/react/24/outline";

import s from "./styles.module.scss";
import { t } from "i18next";
import { NINTONDO_URL } from "@/shared/constant";
import { Link, useParams } from "react-router-dom";

const FinalleSend = () => {
  const { txId } = useParams();

  const onClick = async () => {
    await browserTabsCreate({
      active: true,
      url: `${NINTONDO_URL}/explorer/tx/${txId}`,
    });
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
        <Link to={"/"} className={s.btn}>
          {t("send.finalle_send.back")}
        </Link>
        <button className={s.btn} onClick={onClick}>
          {t("send.finalle_send.explorer")}
        </button>
      </div>
    </div>
  );
};

export default FinalleSend;
