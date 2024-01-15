import { Inscription } from "@/shared/interfaces/inscriptions";
import InscriptionCard from "@/ui/components/inscription-card";
import { useEffect, useState } from "react";
import s from "./styles.module.scss";
import { useControllersState } from "@/ui/states/controllerState";

const Discover = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const receivedInscriptions = await apiController.getDiscovery();
      setInscriptions(receivedInscriptions);
    })();
  }, [setInscriptions, apiController]);

  return (
    <div className={s.gridContainer}>
      {inscriptions.map((f, i) => (
        <InscriptionCard key={i} inscription={f} />
      ))}
    </div>
  );
};

export default Discover;
