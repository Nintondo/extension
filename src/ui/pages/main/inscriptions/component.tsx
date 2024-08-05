import { useEffect } from "react";
import s from "./styles.module.scss";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { t } from "i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useInscriptionManagerContext } from "@/ui/utils/inscriptions-ctx";
import { TailSpin } from "react-loading-icons";

const Inscriptions = () => {
  const {
    inscriptions,
    currentPage,
    setCurrentPage,
    loading: managerLoading,
    searchInscriptions,
    updateInscriptions,
  } = useInscriptionManagerContext();
  const currentAccount = useGetCurrentAccount();

  const changePage = async (page: number) => {
    if (!managerLoading) setCurrentPage(page);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateInscriptions(currentPage);
  }, [currentPage, updateInscriptions]);

  if (
    (currentAccount?.inscriptionCounter === undefined && managerLoading) ||
    !inscriptions
  )
    return <TailSpin />;

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex flex-col h-full w-full overflow-hidden pb-8 standard:pb-16">
        <div className={s.gridContainer}>
          {(typeof searchInscriptions === "undefined"
            ? inscriptions
            : searchInscriptions
          ).map((f, i) => (
            <InscriptionCard key={i} inscriptionId={f.id} />
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
