import s from "./styles.module.scss";
import { TileProps } from "@/ui/components/tile/component";
import { GlobeAltIcon, KeyIcon, PlusIcon } from "@heroicons/react/24/outline";
import Tile from "@/ui/components/tile";
import { t } from "i18next";

const ICON_SIZE = 8;
const ICON_CN = `w-${ICON_SIZE} h-${ICON_SIZE}`;

const NewWallet = () => {
  const items: TileProps[] = [
    {
      icon: <PlusIcon className={ICON_CN} />,
      label: t("new_wallet.new_mnemonic_label"),
      link: "/pages/new-mnemonic",
    },
    {
      icon: <GlobeAltIcon className={ICON_CN} />,
      label: t("new_wallet.restore_mnemonic_label"),
      link: "/pages/restore-mnemonic",
    },
    {
      icon: <KeyIcon className={ICON_CN} />,
      label: t("new_wallet.restore_from_private_key_label"),
      link: "/pages/restore-priv-key",
    },
  ];
  return (
    <div className={s.container}>
      <div className={s.choice}>
        {items.map((i) => (
          <Tile key={i.label} {...i} />
        ))}
      </div>
    </div>
  );
};

export default NewWallet;
