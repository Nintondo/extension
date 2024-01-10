import { Inscription, TestInscription } from "@/shared/interfaces/inscriptions";
import InscriptionCard from "@/ui/components/inscription-card";
import { useEffect, useState } from "react";
import s from "./styles.module.scss";

const Discover = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  useEffect(() => {
    setInscriptions(new Array<Inscription>(50).fill(TestInscription));
  }, [setInscriptions]);

  return (
    <div className={s.gridContainer}>
      {inscriptions.map((f, i) => (
        <div className="w-2/5" key={i}>
          <InscriptionCard inscription={f} />
        </div>
      ))}
    </div>
  );
};

export default Discover;
