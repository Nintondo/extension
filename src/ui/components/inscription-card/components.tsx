import { Inscription } from "@/shared/interfaces/inscriptions";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import Iframe from "../iframe";

interface Props {
  inscription: Inscription;
}

const InscriptionCard: FC<Props> = ({ inscription }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full rounded-xl overflow-hidden">
      <div
        className="cursor-pointer bg-input-bg flex flex-col justify-center align-center"
        onClick={() => {
          navigate("/pages/details", { state: inscription });
        }}
      >
        <Iframe
          preview={inscription.preview}
          className={"w-20 h-20 bg-input-bg"}
        />
      </div>
    </div>
  );
};

export default InscriptionCard;
