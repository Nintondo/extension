/* eslint-disable @typescript-eslint/no-misused-promises */
import { CompletedInscription } from "@/shared/interfaces/inscriptions";
import { useCallback, useEffect, useState } from "react";
import { t } from "i18next";
import { browserTabsCreate } from "@/shared/utils/browser";
import { useLocation, useNavigate } from "react-router-dom";
import { TailSpin } from "react-loading-icons";
import {
  CONTENT_URL,
  HTML_PREVIEW_URL,
  PREVIEW_URL,
  TESTNET_HTML_PREVIEW_URL,
} from "@/shared/constant";
import s from "./styles.module.scss";
import Iframe from "@/ui/components/iframe";
import { useAppState } from "@/ui/states/appState";
import { isTestnet, ss } from "@/ui/utils";
import { useControllersState } from "@/ui/states/controllerState";
import { parseLocation } from "@/shared/utils";

type PathOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: K extends string | number
        ? `${K}` | (T[K] extends object ? `${K}.${PathOf<T[K]>}` : never)
        : never;
    }[keyof T & (string | number)]
  : "";

interface InscField<T, K extends PathOf<T> = PathOf<T>> {
  key: K;
  link?: boolean;
  defaultValue?: any;
}

const fields: InscField<CompletedInscription>[] = [
  {
    key: "content_length",
  },
  {
    key: "inscription_number",
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
    defaultValue: 0,
  },
  {
    key: "value",
    defaultValue: "-",
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
  const navigate = useNavigate();
  const location = useLocation();
  const [inscription, setInscription] = useState<
    CompletedInscription | undefined
  >(undefined);
  const { network } = useAppState(ss(["network"]));
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));

  const convertToCompletedInscription = useCallback(
    async ({
      inscription_id,
    }: {
      inscription_id: string;
    }): Promise<CompletedInscription | undefined> => {
      const [data, location] = await Promise.all([
        apiController.searchContentInscriptionByInscriptionId(inscription_id),
        apiController.getLocationByInscriptionId(inscription_id),
      ]);
      if (!data || !location) return;
      const parsedLocation = parseLocation(location.location);
      const value = await apiController.getUtxoValues([
        `${parsedLocation.txid}:${parsedLocation.vout}`,
      ]);
      return {
        content_length: data.file_size,
        content_type: data.file_type,
        inscription_id: inscription_id,
        inscription_number: data.number,
        content: inscription_id,
        preview: inscription_id,
        value: value ? value[0] : 0,
        owner: location.owner,
        txid: parsedLocation.txid,
        vout: parsedLocation.vout,
        offset: parsedLocation.offset,
        outpoint: `${parsedLocation.txid}i${parsedLocation.vout}`,
        genesis: inscription_id,
        status: {
          block_hash: "",
          block_height: data.creation_block,
          block_time: data.created,
          confirmed: true,
        },
      };
    },
    [apiController]
  );

  useEffect(() => {
    if (!location.state) return navigate(-1);
    if (location.state?.txid) {
      setInscription(location.state);
      return;
    }
    convertToCompletedInscription(location.state)
      .then((completeInscription) => {
        if (completeInscription) {
          setInscription(completeInscription);
          navigate(location.pathname, {
            state: completeInscription,
            replace: true,
          });
        } else {
          navigate(-1);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [location, navigate, convertToCompletedInscription]);

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
    for (const i of key.split(".")) {
      current = (current as any)[i];
    }
    if (key === "status.block_time")
      return new Date((current as unknown as number) * 1000).toLocaleString();
    return current as T;
  };

  if (inscription === undefined) return <TailSpin />;

  return (
    <div className="flex flex-col justify-center items-center break-all pb-3 rounded-xl">
      <div className="px-4">
        <div className="flex justify-center w-[318px] h-[318px] rounded-xl overflow-hidden">
          <Iframe
            preview={`${
              isTestnet(network) ? TESTNET_HTML_PREVIEW_URL : HTML_PREVIEW_URL
            }/${inscription.inscription_id}`}
            size="big"
          />
        </div>

        <h3 className="font-medium text-xl pt-6 pb-1">Details</h3>
      </div>
      <div className={s.fields}>
        {fields.map((f, i) => (
          <div className={s.item} key={i}>
            <label className="uppercase text-slate-400">
              {t(`inscription_details.${f.key}`)}
            </label>
            {f.link ? (
              <div
                onClick={async () => {
                  await openContent(
                    `${
                      f.key === "content"
                        ? CONTENT_URL
                        : isTestnet(network)
                        ? TESTNET_HTML_PREVIEW_URL
                        : PREVIEW_URL
                    }/content/${inscription.inscription_id}`
                  );
                }}
                className="text-orange-400 cursor-pointer text-sm font-medium"
              >
                link
              </div>
            ) : (
              <div className="text-sm font-medium">
                {getValue<string>(f.key) ?? f.defaultValue}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={send}
        className="btn bg-white text-black fixed right-3 bottom-3 w-max"
      >
        {t("components.layout.send")}
      </button>
    </div>
  );
};

export default InscriptionDetails;
