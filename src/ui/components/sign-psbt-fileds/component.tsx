import { FC } from "react";

import { IField } from "@/shared/interfaces/provider";
import { PREVIEW_URL, TESTNET_HTML_PREVIEW_URL } from "@/shared/constant";
import { t } from "i18next";
import cn from "classnames";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAppState } from "@/ui/states/appState";
import { isTestnet, ss } from "@/ui/utils";

interface SignPsbtFiledsProps {
  fields: IField[];
  setModalInputIndexHandler: (value: number) => void;
}

const SignPsbtFileds: FC<SignPsbtFiledsProps> = ({
  fields,
  setModalInputIndexHandler,
}) => {
  const { network } = useAppState(ss(["network"]));

  return (
    <div className="flex flex-col gap-4 w-full">
      {fields.map((f, i) => (
        <div key={i}>
          <label className="mb-2 flex text-gray-300 pl-2 justify-between">
            <span>
              {f.label}{" "}
              {f.important && f.input ? (
                <span className="text-light-orange border-2 rounded-lg border-light-orange p-1 ml-2">
                  To sign
                </span>
              ) : undefined}
            </span>
            {f.value.anyonecanpay && f.important && (
              <span>
                <ExclamationTriangleIcon
                  className="w-6 h-6 text-light-orange cursor-pointer"
                  onClick={() => {
                    setModalInputIndexHandler(i);
                  }}
                />
              </span>
            )}
          </label>
          <div
            className={cn(
              "rounded-xl px-5 py-2 break-all w-full flex justify-center border-2 bg-input-bg",
              {
                // "border-lime-800": !f.input && f.important,
                // "border-light-orange": f.input && f.important,
                "border-input-bg": true,
              }
            )}
          >
            {f.value.inscriptions !== undefined ? (
              <div className="flex justify-center rounded-xl w-33 h-33 overflow-hidden">
                {f.value.inscriptions.map((k, j) => (
                  <div
                    key={j}
                    className="flex flex-col items-center justify-center p-2"
                  >
                    <img
                      src={`${
                        isTestnet(network)
                          ? TESTNET_HTML_PREVIEW_URL
                          : PREVIEW_URL
                      }/${k.inscription_id}`}
                      className="object-cover w-full rounded-xl"
                    />
                    <p className="text-xs">
                      {t("inscription_details.value") + ": "}
                      {f.value.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p>
                  {f.input ? "Utxo txid: " : t("provider.to_address") + ": "}
                  {f.value.text}
                </p>
                <p>
                  {t("inscription_details.value") + ": "}
                  {f.value.value}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SignPsbtFileds;
