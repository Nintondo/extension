import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

interface Props<T extends string> {
  setSelected: (data: { name: T }) => void;
  values: { name: string }[];
  selected: any;
  label?: string;
  displayCheckIcon?: boolean;
  className?: string;
}

const Select = <T extends string>({
  selected,
  setSelected,
  values,
  label,
  displayCheckIcon = true,
  className,
}: Props<T>) => {
  return (
    <div className={className ?? ""}>
      {label !== undefined ? (
        <label className="input-span">{label}</label>
      ) : undefined}
      <Listbox value={selected} onChange={setSelected}>
        <div className={`relative mt-1 w-full`}>
          <Listbox.Button className="relative w-full cursor-default rounded-xl bg-input-bg py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-bg py-1">
              {values.map((value, valueIdx) => (
                <Listbox.Option
                  key={valueIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 ${
                      active ? "bg-input-bg text-text" : "text-text"
                    } ${
                      displayCheckIcon ? "pl-10 pr-4" : "flex justify-center"
                    }`
                  }
                  value={value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {value.name}
                      </span>
                      {selected && displayCheckIcon ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Select;
