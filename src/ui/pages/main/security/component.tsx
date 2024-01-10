import { browserTabsCreate } from "@/shared/utils/browser";
import s from "./styles.module.scss";

import { Cog6ToothIcon, KeyIcon } from "@heroicons/react/24/solid";
import Tile from "@/ui/components/tile";
import { TileProps } from "@/ui/components/tile/component";

import config from "../../../../../package.json";
import { t } from "i18next";

const ICON_SIZE = 8;
const ICON_CN = `w-${ICON_SIZE} h-${ICON_SIZE}`;

const Security = () => {
  const items: TileProps[] = [
    {
      icon: <KeyIcon className={ICON_CN} />,
      label: t("components.layout.change_password"),
      link: "/pages/change-password",
    },
    {
      icon: <Cog6ToothIcon className={ICON_CN} />,
      label: t("components.layout.advanced"),
      link: "/pages/advanced",
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
          onClick={async () => {
            await browserTabsCreate({
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

export default Security;
