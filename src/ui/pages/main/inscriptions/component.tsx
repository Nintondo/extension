import { useCallback, useEffect, useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { t } from "i18next";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Inscriptions = () => {
  const {
    loadMoreInscriptions,
    inscriptions,
    currentPage,
    setCurrentPage,
    loading: managerLoading,
    setInscriptionHandler,
  } = useTransactionManagerContext();
  const [loadingMoreInscriptions, setLoadingMoreInscriptions] =
    useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();

  const [foundInscriptions, setFoundInscriptions] = useState<Inscription[]>();

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

  useEffect(() => {
    setInscriptionHandler(setFoundInscriptions);

    return () => {
      setInscriptionHandler(undefined);
    };
  }, [setInscriptionHandler]);

  if (currentAccount?.inscriptionCounter === undefined && managerLoading)
    return <Loading />;

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex flex-col h-full w-full pb-8 overflow-hidden standard:pb-16">
        <div className={s.gridContainer}>
          {(typeof foundInscriptions === "undefined"
            ? inscriptions
            : foundInscriptions
          )
            .slice((currentPage - 1) * 6, (currentPage - 1) * 6 + 6)
            .map((f, i) => (
              <InscriptionCard key={i} inscription={f} />
            ))}
        </div>
      </div>

      {(typeof foundInscriptions !== "undefined" && foundInscriptions.length) ||
      (typeof foundInscriptions === "undefined" && inscriptions.length) ? (
        <div className="w-full absolute bottom-0 p-3 pb-4">
          <Pagination
            currentPage={currentPage}
            onPageChange={changePage}
            pageCount={Math.ceil(
              ((typeof foundInscriptions === "undefined"
                ? currentAccount?.inscriptionCounter
                : foundInscriptions?.length) ?? 0) / 6
            )}
            visiblePageButtonsCount={5}
            leftBtnPlaceholder={<ChevronLeftIcon className="w-4 h-4" />}
            rightBtnPlaceholder={<ChevronRightIcon className="w-4 h-4" />}
            className={s.pagination}
          />
        </div>
      ) : (
        <div className="flex w-full h-4/5 bottom-0 items-center justify-center absolute">
          <p>{t("inscriptions.inscription_not_found")}</p>
        </div>
      )}
    </div>
  );
};

export default Inscriptions;
