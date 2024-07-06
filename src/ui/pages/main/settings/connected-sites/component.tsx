import type { ConnectedSite } from "@/background/services/permission";
import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";
import s from "./styles.module.scss";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { t } from "i18next";
import { ss } from "@/ui/utils";

const ConnectedSites = () => {
  const [connectedSites, setConnectedSites] = useState<ConnectedSite[]>([]);
  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    notificationController.getConnectedSites().then(setConnectedSites);
  }, [notificationController]);

  const niceUrl = (url: string) => {
    if (url.includes("http://")) return url.replace("http://", "");
    return url.replace("https://", "");
  };

  const removeSite = async (origin: string) => {
    setConnectedSites(await notificationController.removeSite(origin));
  };

  return (
    <>
      {connectedSites.length > 0 ? (
        <div className={s.sites}>
          {connectedSites.map((f, i) => (
            <div key={i} className={s.site}>
              <img src={f.icon} className="rounded-full w-6" />
              <p className="text-sm">{niceUrl(f.origin)}</p>
              <XMarkIcon
                className={s.icon}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  removeSite(f.origin);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>{t("connected_sites.no_sites_message")}</p>
      )}
    </>
  );
};

export default ConnectedSites;
