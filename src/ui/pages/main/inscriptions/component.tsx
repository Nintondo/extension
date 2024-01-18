/* eslint-disable @typescript-eslint/no-floating-promises */
import { useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { useControllersState } from "@/ui/states/controllerState";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { t } from "i18next";

const Inscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { loadMoreInscriptions, inscriptions } = useTransactionManagerContext();
  const [inscriptionId, setInscriptionId] = useState<string>("");
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();

  const changePage = async (page: number) => {
    if (
      inscriptions.length <= page * 6 &&
      page * 6 < (currentAccount?.inscriptionCounter ?? 0)
    )
      await loadMoreInscriptions();
    setCurrentPage(page);
  };
  const [foundInscription, setFoundInscriptions] = useState<
    Inscription[] | undefined
  >(undefined);

  const searchInscription = async () => {
    setLoading(true);
    const inscriptionNumber = Number(inscriptionId);
    setFoundInscriptions(
      await apiController.getInscription(
        Number.isNaN(inscriptionNumber)
          ? {
              inscriptionId: inscriptionId.trim(),
              address: currentAccount.address,
            }
          : { inscriptionNumber, address: currentAccount.address }
      )
    );
    setCurrentPage(1);
    setLoading(false);
  };

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex align-center gap-1 items-center">
        <input
          tabIndex={0}
          type="text"
          className={s.input}
          placeholder="Number/Inscription id"
          onChange={(e) => {
            setInscriptionId(e.target.value);
          }}
          value={inscriptionId}
        />
        {loading ? (
          <div className="w-8 h-8 flex align-center">
            <Loading />
          </div>
        ) : (
          <MagnifyingGlassCircleIcon
            onClick={searchInscription}
            className="w-8 h-8"
          />
        )}
      </div>

      {!(
        foundInscription === undefined && !currentAccount?.inscriptionCounter
      ) ? (
        <>
          <div className={s.gridContainer}>
            {foundInscription === undefined
              ? inscriptions
                  .slice(currentPage - 1, currentPage + 5)
                  .map((f, i) => <InscriptionCard key={i} inscription={f} />)
              : foundInscription
                  .slice(currentPage - 1, currentPage + 5)
                  .map((f, i) => <InscriptionCard key={i} inscription={f} />)}
          </div>

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
        </>
      ) : (
        <div className="flex w-full h-full items-center justify-center">
          <p>{t("inscriptions.inscription_not_found")}</p>
        </div>
      )}
    </div>
  );
};

export default Inscriptions;
