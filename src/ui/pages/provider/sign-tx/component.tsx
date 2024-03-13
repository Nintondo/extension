import { useCallback, useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import Loading from "react-loading";
import { IField } from "@/shared/interfaces/provider";
import { useDecodePsbtInputs as useGetPsbtFields } from "@/ui/hooks/provider";
import { PREVIEW_URL } from "@/shared/constant";
import { t } from "i18next";
import cn from "classnames";

const SignTx = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fields, setFields] = useState<IField[]>([]);
  const getPsbtFields = useGetPsbtFields();

  const updateFields = useCallback(async () => {
    if (fields.length <= 0) setLoading(true);
    const resultFields = await getPsbtFields();
    if (resultFields === undefined) return;
    setFields(resultFields);
    setLoading(false);
  }, [getPsbtFields, fields]);

  useEffect(() => {
    if (fields.length) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateFields();
  }, [updateFields, fields]);

  if (loading) return <Loading type="balls" />;

  return (
    <Layout
      documentTitle={t("provider.sign_tx")}
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText={t("provider.sign")}
    >
      <>
        <KeyIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium mb-6">{t("provider.sign_tx")}</h4>
        <div className="flex flex-col gap-4 w-full">
          {fields.map((f, i) => (
            <div key={i}>
              <label className="mb-2 block text-gray-300 pl-2">{f.label}</label>
              <div
                className={cn(
                  "rounded-xl px-5 py-2 break-all w-full flex justify-center",
                  {
                    "bg-green-700": !f.input,
                    "bg-input-bg": f.input,
                  }
                )}
              >
                {f.value.inscriptions !== undefined ? (
                  <div className="flex justify-center rounded-xl w-33 h-33 overflow-hidden">
                    {f.value.inscriptions.map((k, j) => (
                      <div key={j} className="">
                        <img
                          src={`${PREVIEW_URL}/${k.inscription_id}`}
                          className="object-cover w-full"
                        />
                        <span>{f.value.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p>{f.value.text}</p>
                    <span>{f.value.value}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    </Layout>
  );
};

export default SignTx;
