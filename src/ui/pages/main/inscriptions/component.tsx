/* eslint-disable @typescript-eslint/no-floating-promises */
import { useCallback, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import {
  MagnifyingGlassCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { t } from "i18next";
import { useDebounce } from "@/ui/hooks/debounce";

const Inscriptions = () => {
  const {
    loadMoreInscriptions,
    inscriptions,
    currentPage,
    setCurrentPage,
    forceUpdateInscriptions,
  } = useTransactionManagerContext();
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMoreInscriptions, setLoadingMoreInscriptions] =
    useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();
  const [searchValue, setSearchValue] = useState<string>("");
  const [loadedOnce, setLoadedOnce] = useState<boolean>(false);

  const changePage = useCallback(
    async (page: number) => {
      if (!loadingMoreInscriptions) {
        if (
          inscriptions.length <= page * 6 &&
          page * 6 < (currentAccount?.inscriptionCounter ?? 0)
        ) {
          setLoadingMoreInscriptions(true);
          await loadMoreInscriptions();
          setLoadingMoreInscriptions(false);
        }
        setCurrentPage(page);
      }
    },
    [
      currentAccount?.inscriptionCounter,
      inscriptions.length,
      loadMoreInscriptions,
      loadingMoreInscriptions,
      setCurrentPage,
    ]
  );
  const [foundInscription, setFoundInscriptions] = useState<
    Inscription[] | undefined
  >(undefined);

  const searchInscription = useCallback(
    async (search: string) => {
      if (!search || !search.trim().length) {
        setFoundInscriptions(undefined);
        return;
      }
      setLoading(true);
      const inscriptionNumber = Number(search);
      setFoundInscriptions(
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
      setLoading(false);
    },
    [apiController, setCurrentPage, currentAccount.address]
  );

  const debounce = useDebounce(searchInscription, 200);

  useEffect(() => {
    if (inscriptions) {
      setFoundInscriptions(undefined);
    }
  }, [setFoundInscriptions, inscriptions]);

  useEffect(() => {
    if (!loadedOnce) {
      setLoadedOnce(true);
      forceUpdateInscriptions();
    }
  }, [forceUpdateInscriptions, loadedOnce]);

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex flex-col h-full w-full pb-8 overflow-hidden md:pb-16">
        <div className="flex align-center gap-1 items-center">
          <input
            tabIndex={0}
            type="text"
            className={s.input}
            placeholder="Number/Inscription id"
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
          ) : foundInscription === undefined ? (
            <MagnifyingGlassCircleIcon className="w-8 h-8" />
          ) : (
            <XMarkIcon
              onClick={() => {
                setFoundInscriptions(undefined);
                setSearchValue("");
              }}
              className="w-8 h-8 cursor-pointer"
            />
          )}
        </div>

        <div className={s.gridContainer}>
          {(foundInscription === undefined ? inscriptions : foundInscription)
            .slice((currentPage - 1) * 6, (currentPage - 1) * 6 + 6)
            .map((f, i) => (
              <InscriptionCard key={i} inscription={f} />
            ))}
        </div>
      </div>

      {!(
        (foundInscription === undefined &&
          !currentAccount?.inscriptionCounter) ||
        (foundInscription !== undefined && !foundInscription.length)
      ) ? (
        <div className="w-full absolute bottom-0 p-3">
          <Pagination
            currentPage={currentPage}
            onPageChange={changePage}
            pageCount={Math.ceil(
              (foundInscription !== undefined
                ? foundInscription.length
                : currentAccount?.inscriptionCounter ?? 0) / 6
            )}
            visiblePageButtonsCount={5}
            leftBtnPlaceholder={"<"}
            rightBtnPlaceholder={">"}
            className={s.pagination}
          />
        </div>
      ) : (
        <div className="flex w-full h-full items-center justify-center absolute pt-10">
          <p>{t("inscriptions.inscription_not_found")}</p>
        </div>
      )}
    </div>
  );
};

export default Inscriptions;
