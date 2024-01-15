/* eslint-disable @typescript-eslint/no-misused-promises */
import { Inscription } from "@/shared/interfaces/inscriptions";
import { useEffect, useState } from "react";
import { t } from "i18next";
import { browserTabsCreate } from "@/shared/utils/browser";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "react-loading";
import Iframe from "@/ui/components/iframe";

type PathOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: K extends string | number
        ? `${K}` | (T[K] extends object ? `${K}.${PathOf<T[K]>}` : never)
        : never;
    }[keyof T & (string | number)]
  : "";

interface InscField<T, K extends PathOf<T> = PathOf<T>> {
  key?: K;
  link?: boolean;
}

const fields: InscField<Inscription>[] = [
  {
    key: "content_length",
  },
  {
    key: "status.block_height",
  },
  {
    key: "content_type",
  },
  {
    key: "genesis",
  },
  {
    key: "preview",
    link: true,
  },
  {
    key: "content",
    link: true,
  },
  {
    key: "offset",
  },
  {
    key: "owner",
  },
  {
    key: "value",
  },
  {
    key: "outpoint",
  },
  {
    key: "inscription_id",
  },
  {
    key: "status.block_time",
  },
];

const InscriptionDetails = () => {
  const currentAccount = useGetCurrentAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [inscription, setInscription] = useState<Inscription | undefined>(
    undefined
  );

  useEffect(() => {
    if (!location.state) return navigate(-1);
    setInscription(location.state);
  }, [location, navigate]);

  const openContent = async (link: string) => {
    await browserTabsCreate({
      url: link,
      active: true,
    });
  };

  const send = () => {
    navigate("/pages/create-send", { state: inscription });
  };

  const getValue = <T,>(key: string) => {
    let current = inscription;
    for (const i in key.split(".")) {
      current = current[i];
    }
    return current as T;
  };

  if (inscription === undefined) return <Loading />;

  return (
    <div className="flex flex-col justify-center align-center break-all gap-3 px-6 py-3">
      <div className="flex w-full justify-center">
        <Iframe preview={inscription.preview} size="big" />
      </div>
      {inscription.owner === currentAccount.address ? (
        <button onClick={send} className="btn primary mx-4 mb-4 md:m-6 md:mb-3">
          {t("components.layout.send")}
        </button>
      ) : undefined}
      {fields.map((f, i) => (
        <div key={i}>
          <label>{t(`inscription_details.${f.key}`)}</label>
          {f.link ? (
            <p
              onClick={async () => {
                await openContent(getValue<string>(f.key));
              }}
              className="text-orange-400"
            >
              link
            </p>
          ) : (
            <p>{inscription[f.key]}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default InscriptionDetails;
