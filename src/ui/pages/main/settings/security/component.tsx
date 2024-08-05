import { Cog6ToothIcon, KeyIcon } from "@heroicons/react/24/outline";
import Tile from "@/ui/components/tile";
import { TileProps } from "@/ui/components/tile/component";

import { t } from "i18next";
import SettingsLayout from "@/ui/components/settings-layout";

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
    <SettingsLayout>
      {items.map((i) => (
        <Tile key={i.label} {...i} />
      ))}
    </SettingsLayout>
  );
};

export default Security;
