import { shortAddress } from "@/shared/utils/transactions";
import { Combobox, Transition } from "@headlessui/react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import s from "./styles.module.scss";
import { FC, Fragment, useState } from "react";
import { useAppState } from "@/ui/states/appState";
import { t } from "i18next";

interface Props {
  address: string;
  onChange: (value: string) => void;
  onOpenModal: () => void;
}

const AddressInput: FC<Props> = ({ address, onChange, onOpenModal }) => {
  const [filtered, setFiltered] = useState([]);

  const { addressBook } = useAppState((v) => ({
    addressBook: v.addressBook,
  }));

  const getFiltered = (query: string) => {
    return addressBook.filter((i) => i.startsWith(query));
  };

  return (
    <div className="flex gap-2">
      <Combobox value={address} onChange={onChange}>
        <div className="relative w-full">
          <Combobox.Input
            displayValue={(address: string) => address}
            autoComplete="off"
            className="input w-full"
            value={address}
            placeholder={t(
              "send.create_send.address_input.address_placeholder"
            )}
            onChange={(v) => {
              onChange(v.target.value.trim());
              setFiltered(getFiltered(v.target.value.trim()));
            }}
          />

          {filtered.length > 0 ? (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className={s.addressbookoptions}>
                {filtered.map((address) => (
                  <Combobox.Option
                    className={s.addressbookoption}
                    key={address}
                    value={address}
                  >
                    {shortAddress(address, 14)}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          ) : (
            ""
          )}
        </div>
      </Combobox>
      <button
        className="bg-input-bg px-2 rounded-xl"
        title={t("send.create_send.address_input.address_book")}
        onClick={(e) => {
          e.preventDefault();
          onOpenModal();
        }}
      >
        <BookOpenIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AddressInput;
