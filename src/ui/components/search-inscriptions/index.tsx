import { useDebounce } from "@/ui/hooks/debounce";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { ss } from "@/ui/utils";
import { useInscriptionManagerContext } from "@/ui/utils/inscriptions-ctx";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { useCallback, useState } from "react";
import { useLocation } from "react-router";

const SearchInscriptions = () => {
  const { apiController } = useControllersState(ss(["apiController"]));
  const currentAccount = useGetCurrentAccount();
  const currentRoute = useLocation();

  const { setCurrentPage, tokens, setSearchInscriptions, setSearchTokens } =
    useInscriptionManagerContext();

  const [open, setOpen] = useState<boolean>(false);

  const type: "inscriptions" | "tokens" = currentRoute.pathname.includes(
    "inscriptions"
  )
    ? "inscriptions"
    : "tokens";

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

  const tokenDebounce = useDebounce<string, typeof searchToken>(
    searchToken,
    10
  );
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
            type === "inscriptions"
              ? t("inscriptions.inscription_search_placeholder")
              : t("inscriptions.token_search_placeholder")
          }
          onChange={async (e) => {
            if (typeof e.target.value === "string") {
              if (type === "inscriptions") {
                await inscriptionDebounce(e.target.value);
              } else {
                await tokenDebounce(e.target.value);
              }
            }
          }}
        />
        <XMarkIcon
          onClick={() => {
            setOpen(false);
            setSearchInscriptions(undefined);
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
