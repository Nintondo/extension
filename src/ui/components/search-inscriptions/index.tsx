import { useDebounce } from "@/ui/hooks/debounce";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { ss } from "@/ui/utils";
import { useOrdinalsManagerContext } from "@/ui/utils/ordinals-ctx";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { useCallback, useState } from "react";
import { useLocation } from "react-router";

enum SearchMode {
  Inscriptions,
  Tokens,
  Runes,
}

const SearchInscriptions = () => {
  const { apiController } = useControllersState(ss(["apiController"]));
  const currentAccount = useGetCurrentAccount();
  const currentRoute = useLocation();

  const {
    setCurrentPage,
    tokens,
    setSearchInscriptions,
    setSearchTokens,
    setSearchRunes,
    runes,
  } = useOrdinalsManagerContext();

  const [open, setOpen] = useState<boolean>(false);

  const type: SearchMode = (() => {
    if (currentRoute.pathname.includes("inscriptions")) {
      return SearchMode.Inscriptions;
    } else if (currentRoute.pathname.includes("tokens")) {
      return SearchMode.Tokens;
    } else if (currentRoute.pathname.includes("runes")) {
      return SearchMode.Runes;
    } else {
      throw new Error("Invalid search mode");
    }
  })();

  const searchInscription = useCallback(
    async (search: string) => {
      if (!currentAccount || !currentAccount.address) return;
      if (!search || !search.trim().length) {
        setSearchInscriptions(undefined);
        return;
      }
      const inscriptionNumber = Number(search);
      if (Number.isNaN(inscriptionNumber)) {
        const searchResult =
          await apiController.searchContentInscriptionByInscriptionId(search);
        setSearchInscriptions(searchResult ? [searchResult] : []);
      } else {
        const searchResult =
          await apiController.searchContentInscriptionByInscriptionNumber(
            currentAccount.address,
            inscriptionNumber
          );
        setSearchInscriptions(searchResult ? searchResult.inscriptions : []);
      }
      setCurrentPage(1);
    },
    [apiController, setCurrentPage, currentAccount, setSearchInscriptions]
  );

  const searchToken = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        setSearchTokens(undefined);
        return;
      }
      setSearchTokens(
        tokens.filter((f) => f.tick.includes(search.trim().toLowerCase()))
      );
      setCurrentPage(1);
    },
    [setCurrentPage, tokens, setSearchTokens]
  );

  const searchRunes = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        setSearchRunes(undefined);
        return;
      }
      setSearchRunes(
        runes.filter((f) =>
          f.runeBalance.rune.includes(search.trim().toLowerCase())
        )
      );
    },
    [runes, setSearchRunes]
  );

  const tokenDebounce = useDebounce<string, typeof searchToken>(
    searchToken,
    10
  );
  const runeDebounce = useDebounce<string, typeof searchToken>(searchRunes, 10);
  const inscriptionDebounce = useDebounce<string, typeof searchInscription>(
    searchInscription,
    200
  );

  if (open) {
    return (
      <div className="absolute left-0 right-0 top-0 p-4 flex gap-2 bg-bg items-center">
        <input
          className="input w-full h-8"
          type="text"
          placeholder={
            type === SearchMode.Inscriptions
              ? t("inscriptions.inscription_search_placeholder")
              : type === SearchMode.Tokens
              ? t("inscriptions.token_search_placeholder")
              : t("inscriptions.rune_search_placeholder")
          }
          onChange={async (e) => {
            const searchValue = e.target.value;
            if (searchValue) {
              switch (type) {
                case SearchMode.Inscriptions:
                  await inscriptionDebounce(searchValue);
                  break;
                case SearchMode.Tokens:
                  await tokenDebounce(searchValue);
                  break;
                case SearchMode.Runes:
                  await runeDebounce(searchValue);
                  break;
                default:
                  throw new Error("Invalid search mode");
              }
            }
          }}
        />
        <XMarkIcon
          onClick={() => {
            setOpen(false);
            setSearchInscriptions(undefined);
            setSearchTokens(undefined);
            setSearchRunes(undefined);
          }}
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    );
  }

  return (
    <MagnifyingGlassIcon
      onClick={() => {
        setOpen(true);
      }}
      className="w-5 h-5 cursor-pointer"
    />
  );
};

export default SearchInscriptions;
