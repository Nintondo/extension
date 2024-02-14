/* eslint-disable @typescript-eslint/no-floating-promises */
import { FC } from "react";
import s from "../styles.module.scss";
import {
  MagnifyingGlassCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Loading from "react-loading";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { t } from "i18next";
import { IToken } from "@/shared/interfaces/token";

interface SearchFieldProps {
  setSearchValue: (value: string) => void;
  debounce: (search: string) => Promise<void>;
  searchValue: string;
  loading: boolean;
  foundData: (Inscription | IToken)[] | undefined;
  setFoundData: (undefined) => void;
  tokenSearch?: boolean;
}

const SearchField: FC<SearchFieldProps> = ({
  setSearchValue,
  debounce,
  searchValue,
  loading,
  foundData,
  setFoundData,
  tokenSearch = false,
}) => {
  return (
    <div className="flex align-center gap-1 items-center">
      <input
        tabIndex={0}
        type="text"
        className={s.input}
        placeholder={
          tokenSearch
            ? t("inscriptions.token_search_placeholder")
            : t("inscriptions.inscription_search_placeholder")
        }
        onChange={(e) => {
          setSearchValue(e.target.value);
          debounce(e.target.value);
        }}
        value={searchValue}
      />
      {loading ? (
        <div className="w-8 h-8 flex align-center">
          <Loading />
        </div>
      ) : foundData === undefined ? (
        <MagnifyingGlassCircleIcon className="w-8 h-8" />
      ) : (
        <XMarkIcon
          onClick={() => {
            setFoundData(undefined);
            setSearchValue("");
          }}
          className="w-8 h-8 cursor-pointer"
        />
      )}
    </div>
  );
};

export default SearchField;
