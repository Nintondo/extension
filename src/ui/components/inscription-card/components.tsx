import { Inscription } from "@/shared/interfaces/inscriptions";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { shortAddress } from "@/shared/utils/transactions";
import { PREVIEW_URL } from "@/shared/constant";

interface Props {
  inscription: Inscription;
}

const InscriptionCard: FC<Props> = ({ inscription }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full">
      <div
        className="cursor-pointer flex flex-col justify-center align-center relative"
        onClick={() => {
          navigate("/pages/inscription-details", { state: inscription });
        }}
      >
        <div className="rounded-xl w-full bg-slate-950 bg-opacity-50">
          <img
            src={`${PREVIEW_URL}/${inscription.inscription_id}`}
            alt="content"
            className="object-cover rounded-xl h-38 w-38"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </div>
        <div className="absolute top-2 left-5 right-5 text-sm bg-slate-100 bg-opacity-40 backdrop-blur-sm rounded-md text-white text-center">
          {shortAddress(inscription.inscription_id, 6)}
        </div>
      </div>
    </div>
  );
};

export default InscriptionCard;
