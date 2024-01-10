/* eslint-disable @typescript-eslint/no-misused-promises */
import { Inscription } from "@/shared/interfaces/inscriptions";
import { FC, useState } from "react";
import { t } from "i18next";
import { browserTabsCreate } from "@/shared/utils/browser";

interface Props {
  inscription: Inscription;
}

interface InscriptionItem {
  name: string;
  value: any;
  link: boolean;
}

const InscriptionDetails: FC<Props> = ({ inscription }) => {
  const [inscriptionData] = useState<InscriptionItem[]>(
    (() => {
      const toReturn: InscriptionItem[] = [];
      for (const key in inscription) {
        toReturn.push({
          name: t(`components.inscription_card.${key}`),
          value: inscription[key],
          link: key === "content" || key === "preview",
        });
      }
      return toReturn;
    })()
  );

  const openContent = async (link: string) => {
    await browserTabsCreate({
      url: link,
      active: true,
    });
  };

  return (
    <div className="flex flex-col justify-center align-center break-all gap-3">
      <div className="flex w-3/4 justify-center">
        <img src={inscription.content} />
      </div>
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
