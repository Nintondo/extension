import { useAppState } from "@/ui/states/appState";

import {
  UserIcon,
  ArrowLeftOnRectangleIcon,
  PuzzlePieceIcon,
  LanguageIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import Tile from "@/ui/components/tile";
import { TileProps } from "@/ui/components/tile/component";

import { t } from "i18next";
import SettingsLayout from "@/ui/components/settings-layout";
import { ss } from "@/ui/utils";

const ICON_SIZE = 8;
const ICON_CN = `w-${ICON_SIZE} h-${ICON_SIZE}`;

const Settings = () => {
  const { logout } = useAppState(ss(["logout"]));

  const items: TileProps[] = [
    {
      icon: <UserIcon className={ICON_CN} />,
      label: t("settings.address_type"),
      link: "/pages/change-addr-type",
    },
    {
      icon: <ShieldCheckIcon className={ICON_CN} />,
      label: t("settings.security_settings"),
      link: "/pages/security",
    },
    {
      icon: <WalletIcon className={ICON_CN} />,
      label: t("components.layout.wallet_settings"),
      link: "/pages/wallet-settings",
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
    <SettingsLayout>
      {items.map((i) => (
        <Tile key={i.label} {...i} />
      ))}
    </SettingsLayout>
  );
};

export default Settings;
