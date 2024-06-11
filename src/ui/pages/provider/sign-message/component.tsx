import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import { t } from "i18next";

const SignMessage = () => {
  const [message, setMessage] = useState<string>();

  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      setMessage(approval.params.data.text);
    })();
  }, [notificationController]);

  return (
    <Layout
      documentTitle={t("provider.sign_request")}
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText={t("provider.sign")}
    >
      <>
        <KeyIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium">{t("provider.sign_request")}</h4>
        <div className="text-sm text-gray-400">
          {t("provider.you_are_signing")}
        </div>
        <div className="p-2 bg-input-bg rounded-xl max-h-full w-full">
          <div className="break-words whitespace-pre-wrap max-h-60 overflow-y-auto px-1 text-base">
            {message}
          </div>
        </div>
      </>
    </Layout>
  );
};

export default SignMessage;
