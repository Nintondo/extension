import { useDebounce } from "@/ui/hooks/debounce";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { useCallback, useState } from "react";
import { useLocation } from "react-router";

const SearchInscriptions = () => {
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const currentAccount = useGetCurrentAccount();

  const currentRoute = useLocation();

  const { setCurrentPage, tokens, inscriptionHandler, tokenHandler } =
    useTransactionManagerContext();

  const [open, setOpen] = useState<boolean>(false);

  const type: "inscriptions" | "tokens" = currentRoute.pathname.includes(
    "inscriptions"
  )
    ? "inscriptions"
    : "tokens";

  const searchInscription = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        inscriptionHandler(undefined);
        return;
      }
      const inscriptionNumber = Number(search);
      inscriptionHandler(
        await apiController.getInscription(
          Number.isNaN(inscriptionNumber)
            ? {
                inscriptionId: search.trim(),
                address: currentAccount.address,
              }
            : { inscriptionNumber, address: currentAccount.address }
        )
      );
      setCurrentPage(1);
    },
    [apiController, setCurrentPage, currentAccount.address, inscriptionHandler]
  );

  const searchToken = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        tokenHandler(undefined);
        return;
      }
      tokenHandler(
        tokens.filter((f) => f.tick.includes(search.trim().toLowerCase()))
      );
      setCurrentPage(1);
    },
    [setCurrentPage, tokens, tokenHandler]
  );

  const tokenDebounce = useDebounce(searchToken, 10);

  const inscriptionDebounce = useDebounce(searchInscription, 200);

  if (open) {
    return (
      <div className="absolute left-0 right-0 top-0 p-3 flex gap-2 bg-bg items-center">
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
            inscriptionHandler(undefined);
            setOpen(false);
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
