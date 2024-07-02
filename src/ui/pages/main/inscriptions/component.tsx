import { useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { t } from "i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useGetCurrentAccount } from "@/ui/states/walletState";

const Inscriptions = () => {
  const {
    loadMoreInscriptions,
    inscriptions,
    currentPage,
    setCurrentPage,
    loading: managerLoading,
    searchInscriptions,
  } = useTransactionManagerContext();
  const [loadingMoreInscriptions, setLoadingMoreInscriptions] =
    useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();

  const changePage = async (page: number) => {
    if (!inscriptions) return;
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
  };

  if (
    (currentAccount?.inscriptionCounter === undefined && managerLoading) ||
    !inscriptions
  )
    return <Loading />;

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex flex-col h-full w-full overflow-hidden pb-8 standard:pb-16">
        <div className={s.gridContainer}>
          {(typeof searchInscriptions === "undefined"
            ? inscriptions
            : searchInscriptions
          )
            .slice((currentPage - 1) * 6, (currentPage - 1) * 6 + 6)
            .map((f, i) => (
              <InscriptionCard key={i} inscription={f} />
            ))}
        </div>
      </div>

      {(typeof searchInscriptions !== "undefined" &&
        searchInscriptions.length) ||
      (typeof searchInscriptions === "undefined" && inscriptions.length) ? (
        <div className="w-full absolute bottom-0 p-3">
          <Pagination
            currentPage={currentPage}
            onPageChange={changePage}
            pageCount={Math.ceil(
              ((typeof searchInscriptions === "undefined"
                ? currentAccount?.inscriptionCounter
                : searchInscriptions?.length) ?? 0) / 6
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
