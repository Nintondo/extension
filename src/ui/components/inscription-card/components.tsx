import { Inscription } from "@/shared/interfaces/inscriptions";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import Iframe from "../iframe";
import { shortAddress } from "@/shared/utils/transactions";

interface Props {
  inscription: Inscription;
}

const InscriptionCard: FC<Props> = ({ inscription }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full rounded-xl overflow-hidden">
      <div
        className="cursor-pointer bg-input-bg flex flex-col justify-center align-center relative"
        onClick={() => {
          navigate("/pages/details", { state: inscription });
        }}
      >
        <Iframe preview={inscription.preview} size="default" />
        <div className="absolute bottom-2 left-2 right-2 text-sm bg-slate-100 bg-opacity-50 backdrop-blur-sm rounded-md text-white text-center">
          {shortAddress(inscription.id, 6)}
        </div>
      </div>
    </div>
  );
};

export default InscriptionCard;
