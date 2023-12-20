import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";

const Sign = () => {
  const [message, setMessage] = useState<string>();

  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  useEffect(() => {
    (async () => {
      const approval = await notificationController.getApproval();
      setMessage(approval.params.data.text);
    })();
  }, [notificationController]);

  return (
    <Layout
      documentTitle="Sign message"
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText="Sign"
    >
      <>
        <KeyIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium">Sign request</h4>
        <div className="text-sm text-gray-400">You are signing</div>
        <div className="p-2 bg-input-bg rounded-xl max-h-full">
          <div className="break-all max-h-60 overflow-y-auto px-1">{message}</div>
        </div>
      </>
    </Layout>
  );
};

export default Sign;
