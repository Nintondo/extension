/* eslint-disable @typescript-eslint/no-floating-promises */
import { useState } from "react";
import s from "./styles.module.scss";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import { t } from "i18next";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
import { useControllersState } from "@/ui/states/controllerState";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "react-loading";
import InscriptionCard from "@/ui/components/inscription-card";
import Pagination from "@/ui/components/pagination";

const Inscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { loadMoreInscriptions, inscriptions, inscriptionCounter } =
    useTransactionManagerContext();
  const [inscriptionId, setInscriptionId] = useState<string>("");
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const changePage = async (page: number) => {
    if (inscriptions.length <= page * 6 && page * 6 < inscriptionCounter)
      await loadMoreInscriptions();
    setCurrentPage(page);
  };

  const searchInscription = async () => {
    setLoading(true);
    const inscriptionNumber = Number(inscriptionId);
    const foundInscription = await apiController.getInscription(
      Number.isNaN(inscriptionNumber)
        ? { inscriptionId: inscriptionId.trim() }
        : { inscriptionNumber }
    );
    if (foundInscription === undefined)
      toast(t("inscriptions.inscription_not_found"));
    else navigate("/pages/inscription-details", { state: foundInscription });
    setLoading(false);
  };

  return (
    <div className={s.inscriptionDiv}>
      <div className="flex align-center gap-1">
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
