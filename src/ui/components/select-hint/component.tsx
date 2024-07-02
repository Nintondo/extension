import { Combobox, Transition } from "@headlessui/react";
import { FC, Fragment, useEffect, useState } from "react";
import englishWords from "bip39/src/wordlists/english.json";
import cn from "classnames";

import s from "./styles.module.scss";

export interface Props {
  selected?: string;
  setSelected: (value: string) => void;
}

const SelectWithHint: FC<Props> = ({ selected, setSelected }) => {
  const [query, setQuery] = useState<string>("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [unblured, setUnblured] = useState(false);

  const getFiltered = (word: string) => {
    return englishWords.filter((w) => w.startsWith(word.trim())).slice(0, 4);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phrase = (event.target.value as string).trim();
    if (phrase.split(" ").length === 12) {
      setSelected(phrase.trim());
    } else {
      const filtered = getFiltered(phrase);
      if (filtered.length === 1 && filtered.includes(phrase)) {
        setSelected(phrase);
      }
      setQuery(phrase);
      if (filtered.length === 1 && filtered[0] === phrase) {
        setFiltered([]);
      } else {
        setFiltered(filtered);
      }
    }
  };

  const unBlurred = () => {
    setUnblured(true);
    if (filtered.includes(query.trim())) {
      setSelected(query);
    }
  };

  useEffect(() => {
    if (selected?.length) {
      setQuery(selected);
    }
  }, [selected, setQuery]);

  return (
    <Combobox value={selected} onChange={setSelected} nullable={true}>
      <div className="relative w-full">
        <div className={s.inputBox}>
          <Combobox.Input
            autoComplete="off"
            className={cn(s.input, {
              [s.error]: unblured && selected !== query,
            })}
            displayValue={(word: string) => word}
            onChange={onChange}
            onBlur={unBlurred}
            value={query}
          />
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className={s.optionsBox}>
            {filtered.length === 0 && query !== "" ? (
              <></>
            ) : (
              filtered.map((word) => (
                <Combobox.Option
                  key={word}
                  className={({ active }) =>
                    cn(s.options, { [s.optionsActive]: active })
                  }
                  value={word}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {word}
                      </span>
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default SelectWithHint;
