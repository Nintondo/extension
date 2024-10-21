import { useControllersState } from "@/ui/states/controllerState";
import s from "./styles.module.scss";
import { FC, useEffect, useState } from "react";
import { TailSpin } from "react-loading-icons";
import { t } from "i18next";
import { ss } from "@/ui/utils";

interface Props {
  documentTitle: string;
  children: React.ReactNode;
  resolveBtnText?: string;
  resolveBtnClassName: string;
}

const Layout: FC<Props> = ({
  children,
  documentTitle,
  resolveBtnClassName,
  resolveBtnText,
}) => {
  const [origin, setOrigin] = useState<string>("");
  const [iconUrl, setIconUrl] = useState<string>("");

  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

  useEffect(() => {
    document.title = documentTitle;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      if (!approval || !approval.params) {
        await notificationController.rejectApproval("Invalid params");
        return;
      }
      setOrigin(approval.params.session.origin);
      setIconUrl(approval.params.session.icon);
    })();
  }, [documentTitle, notificationController]);

  if (!origin) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <TailSpin className="animate-spin" />
      </div>
    );
  }

  const onResolve = async () => {
    await notificationController.resolveApproval();
  };

  const onReject = async () => {
    await notificationController.rejectApproval();
  };

  return (
    <div className={s.container}>
      <div className={s.originWrapper}>
        <img src={iconUrl} className="w-6 h-6 rounded-xl" alt="icon" />
        <span>{origin}</span>
      </div>
      <div className={s.content}>{children}</div>
      <div className={s.btnContainer}>
        <button className={resolveBtnClassName} onClick={onResolve}>
          {resolveBtnText ?? t("provider.resolve")}
        </button>
        <button className={s.reject} onClick={onReject}>
          {t("provider.reject")}
        </button>
      </div>
    </div>
  );
};

export default Layout;
