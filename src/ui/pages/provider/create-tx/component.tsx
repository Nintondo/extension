import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import type { CreateTxProps } from "@/shared/interfaces/notification";
import { t } from "i18next";

const CreateTx = () => {
  const [psbt, setPsbt] = useState<CreateTxProps>();

  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      setPsbt(approval.params.data);
    })();
  }, [notificationController]);

  if (!psbt) return <></>;

  const fields = [
    {
      label: "Address",
      value: psbt.to,
    },
    {
      label: "Amount",
      value: `${psbt.amount} BEL`,
    },
    {
      label: "Fee Rate",
      value: `${psbt.feeRate} sat/Vb`,
    },
  ];

  return (
    <Layout
      documentTitle={t("provider.create_transaction")}
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-bg"
      resolveBtnText={t("components.layout.send")}
    >
      <>
        <KeyIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium mb-6">{t("provider.send_bells")}</h4>
        <div className="flex flex-col gap-4 w-full">
          {fields.map((i) => (
            <div key={i.label}>
              <label className="mb-2 block text-gray-300 pl-2">{i.label}</label>
              <div className="bg-input-bg rounded-xl px-5 py-2">{i.value}</div>
            </div>
          ))}
        </div>
      </>
    </Layout>
  );
};

export default CreateTx;
