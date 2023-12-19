import { browserTabsCreate } from "@/shared/utils/browser";
import { Link, useParams } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/24/solid";

import s from "./styles.module.scss";
import { t } from "i18next";

const FinalleSend = () => {
  const { txId } = useParams();

  const onClick = () => {
    browserTabsCreate({
      active: true,
      url: `https://belscan.io/tx/${txId}`,
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
        <Link to={"/home"} className="btn primary w-full">
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
