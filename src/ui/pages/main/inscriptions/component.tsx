import Pagination from "@/ui/components/pagination";
import { useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { t } from "i18next";
import InscriptionCard from "@/ui/components/inscription-card";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

const Inscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { loadMoreInscriptions, inscriptions, inscriptionCounter } =
    useTransactionManagerContext();

  if (!inscriptions.length)
    return (
      <p className={s.noTransactions}>{t("wallet_page.no_inscriptions")}</p>
    );

  const changePage = async (page: number) => {
    if (inscriptions.length <= page * 6 && page * 6 < inscriptionCounter)
      await loadMoreInscriptions();
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col justify-space-between h-full">
      <div className="flex align-center gap-1">
        <input
          tabIndex={0}
          type="text"
          className={s.input}
          placeholder="Number/Inscription id"
        />
        <MagnifyingGlassCircleIcon className="w-8 h-8" />
      </div>
      <div className={s.gridContainer}>
        {inscriptions.slice(currentPage - 1, currentPage + 5).map((f, i) => (
          <InscriptionCard key={i} inscription={f} />
        ))}
      </div>
      <div className="w-full">
        <Pagination
          currentPage={currentPage}
          onPageChange={changePage}
          pageCount={Math.ceil(inscriptionCounter / 6)}
          visiblePageButtonsCount={5}
          leftBtnPlaceholder={"<"}
          rightBtnPlaceholder={">"}
          className={s.pagination}
        />
      </div>
    </div>
  );
};

export default Inscriptions;
