/* eslint-disable @typescript-eslint/no-misused-promises */
import { Inscription } from "@/shared/interfaces/inscriptions";
import { useEffect, useState } from "react";
import { t } from "i18next";
import { browserTabsCreate } from "@/shared/utils/browser";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "react-loading";
import Iframe from "@/ui/components/iframe";

interface InscriptionItem {
  name: string;
  value: any;
  link: boolean;
}

const InscriptionDetails = () => {
  const currentAccount = useGetCurrentAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [inscriptionData, setInscirptionData] = useState<InscriptionItem[]>([]);
  const [inscription, setInscription] = useState<Inscription | undefined>(
    undefined
  );

  useEffect(() => {
    if (!location.state) navigate(-1);
    const stateInscription = location.state as Inscription;
    const toReturn: InscriptionItem[] = [];
    for (const key in stateInscription) {
      toReturn.push({
        name: t(`components.inscription_card.${key}`),
        value: stateInscription[key],
        link: key === "content" || key === "preview",
      });
    }
    setInscription(stateInscription);
    setInscirptionData(toReturn);
  }, [location, setInscirptionData, navigate]);

  const openContent = async (link: string) => {
    await browserTabsCreate({
      url: link,
      active: true,
    });
  };

  const send = () => {
    navigate("/pages/create-send", { state: inscription });
  };

  if (inscription === undefined) return <Loading />;

  return (
    <div className="flex flex-col justify-center align-center break-all gap-3 px-6 py-3">
      <div className="flex w-full justify-center">
        <Iframe
          preview={inscription.preview}
          className={"w-20 h-20 bg-input-bg"}
        />
      </div>
      {inscription.address === currentAccount.address ? (
        <button onClick={send} className="btn primary mx-4 mb-4 md:m-6 md:mb-3">
          {t("components.layout.send")}
        </button>
      ) : undefined}
      {inscriptionData.map((f, i) => (
        <div key={i}>
          <label>{f.name}</label>
          {f.link ? (
            <p
              onClick={async () => {
                await openContent(f.value);
              }}
              className="text-orange-400"
            >
              link
            </p>
          ) : (
            <p>{f.value}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default InscriptionDetails;
