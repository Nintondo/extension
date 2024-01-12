import { Inscription } from "@/shared/interfaces/inscriptions";
import { shortAddress } from "@/shared/utils/transactions";
import { FC, useState } from "react";
import Modal from "../modal";
import { t } from "i18next";
import InscriptionDetails from "../inscription-details";

interface Props {
  inscription: Inscription;
}

const InscriptionCard: FC<Props> = ({ inscription }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="flex justify-center w-full">
      <div
        className="cursor-pointer bg-input-bg flex flex-col justify-center align-center"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        <img src={inscription.content} />
        <p>{shortAddress(inscription.id)}</p>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title={t("components.inscription_card.modal_title")}
      >
        <InscriptionDetails inscription={inscription} />
      </Modal>
    </div>
  );
};

export default InscriptionCard;
