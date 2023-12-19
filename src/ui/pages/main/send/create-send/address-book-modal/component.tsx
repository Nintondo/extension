import { shortAddress } from "@/shared/utils/transactions";
import Modal from "@/ui/components/modal";
import { useAppState } from "@/ui/states/appState";
import { MinusCircleIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { FormType } from "../component";

import s from "./styles.module.scss";
import { t } from "i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormType>>;
}

const AddressBookModal: FC<Props> = ({ isOpen, onClose, setFormData }) => {
  const { addressBook, updateAppState } = useAppState((v) => ({
    addressBook: v.addressBook,
    updateAppState: v.updateAppState,
  }));

  const onRemove = (address: string) => {
    updateAppState({
      addressBook: addressBook.filter((i) => i !== address),
    });
  };

  const onSelect = (address: string) => {
    setFormData((prev) => ({ ...prev, address }));
    onClose();
  };

  return (
    <Modal onClose={onClose} open={isOpen} title={t("send.create_send.address_book.address_book")}>
      {!addressBook.length && <div className={s.empty}>{t("send.create_send.address_book.no_addresses")}</div>}
      <div className={s.items}>
        {addressBook.map((i, idx) => (
          <div key={`ab-${idx}`} className={s.item}>
            <div onClick={() => onSelect(i)} className={s.address}>{shortAddress(i, 17)}</div>
            <div className={s.remove} onClick={() => onRemove(i)}>
              <MinusCircleIcon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AddressBookModal;
