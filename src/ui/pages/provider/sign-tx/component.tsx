import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import { SignTransactionProps } from "@/shared/interfaces/notification";
import { Psbt } from "belcoinjs-lib";

const SignTransaction = () => {
  const [psbt, setPsbt] = useState<Psbt>();

  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      const psbt = Psbt.fromHex(
        approval.params.data.hex as SignTransactionProps
      );
      setPsbt(psbt);
    })();
  }, [notificationController]);

  if (!psbt) return <></>;

  const fields = [
    {
      label: "Address",
      value: psbt.txOutputs[0].address,
    },
    {
      label: "Amount",
      value: `${psbt.txOutputs[0].value / 10 ** 8} BEL`,
    },
    {
      label: "Fee",
      value: `${100000 / 10 ** 8} BEL`,
    },
  ];

  return (
    <Layout
      documentTitle="Sign transaction"
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText="Sign"
    >
      <>
        <KeyIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium mb-6">Sign transaction</h4>
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

export default SignTransaction;
