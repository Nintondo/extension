import { browserTabsCreate } from "@/shared/utils/browser";
import s from "./styles.module.scss";
import { useAppState } from "@/ui/states/appState";

import {
  UserIcon,
  KeyIcon,
  ArrowsPointingOutIcon,
  ArrowLeftOnRectangleIcon,
  PuzzlePieceIcon,
  LanguageIcon,
} from "@heroicons/react/24/solid";
import Tile from "@/ui/components/tile";
import { TileProps } from "@/ui/components/tile/component";

import config from "../../../../../package.json";
import { t } from "i18next";

const ICON_SIZE = 8;
const ICON_CN = `w-${ICON_SIZE} h-${ICON_SIZE}`;

const Settings = () => {
  const { logout } = useAppState((v) => ({
    logout: v.logout,
  }));

  const expandView = () => {
    browserTabsCreate({
      url: "index.html",
    });
  };

  const items: TileProps[] = [
    {
      icon: <UserIcon className={ICON_CN} />,
      label: t("settings.address_type"),
      link: "/pages/change-addr-type",
    },
    {
      icon: <KeyIcon className={ICON_CN} />,
      label: t("settings.change_password"),
      link: "/pages/change-password",
    },
    {
      icon: <ArrowsPointingOutIcon className={ICON_CN} />,
      label: t("settings.expand_view"),
      onClick: expandView,
    },
    {
      icon: <PuzzlePieceIcon className={ICON_CN} />,
      label: t("settings.connected_sites"),
      link: "/pages/connected-sites",
    },
    {
      icon: <LanguageIcon className={ICON_CN} />,
      label: t("settings.language"),
      link: "/pages/language",
    },
    {
      icon: <ArrowLeftOnRectangleIcon className={ICON_CN} />,
      label: t("settings.logout"),
      onClick: logout,
    },
  ];

  return (
    <div className={s.wrapper}>
      <div className={s.settings}>
        {items.map((i) => (
          <Tile key={i.label} {...i} />
        ))}
      </div>
      <div className={s.version}>
        Version <span>{config.version}</span> | By{" "}
        <a
          href="#"
          onClick={() => {
            browserTabsCreate({
              url: `https://nintondo.io`,
              active: true,
            });
          }}
        >
          Nintondo team
        </a>
      </div>
    </div>
  );
};

export default Settings;
