import Pagination from "@/ui/components/pagination";
import { useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { t } from "i18next";
import InscriptionCard from "@/ui/components/inscription-card";

const Inscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { loadMoreInscriptions, inscriptions } = useTransactionManagerContext();

  if (!inscriptions.length)
    return (
      <p className={s.noTransactions}>{t("wallet_page.no_inscriptions")}</p>
    );

  return (
    <div className="flex flex-col justify-space-between h-full">
      <div className={s.gridContainer}>
        {inscriptions.map((f, i) => (
          <InscriptionCard key={i} inscription={f} />
        ))}
      </div>
      <div className="w-full">
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageCount={15}
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
