import { ConnectedSite } from "@/background/services/permission";
import { useControllersState } from "@/ui/states/controllerState";
import { useCallback, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { t } from "i18next";

const ConnectedSites = () => {
  const [connectedSites, setConnectedSites] = useState<ConnectedSite[]>([]);
  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  const updateConnectedSites = useCallback(async () => {
    setConnectedSites(await notificationController.getConnectedSites());
  }, [notificationController, setConnectedSites]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateConnectedSites();
  }, [updateConnectedSites]);

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
              <p>{niceUrl(f.origin)}</p>
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
