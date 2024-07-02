import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import { GlobeAltIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import { t } from "i18next";
import { ss } from "@/ui/utils";

const SwitchNetwork = () => {
  const [networkName, setNetworkName] = useState<string>();

  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      if (!approval || !approval.params || !approval.params.data)
        await notificationController.rejectApproval("Invalid network");
      if (approval!.params!.data[0] === "testnet") setNetworkName("TESTNET");
      else setNetworkName("MAINNET");
    })();
  }, [notificationController]);

  return (
    <Layout
      documentTitle={t("provider.switch_network_title")}
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText={t("provider.switch")}
    >
      <>
        <GlobeAltIcon className="w-10 h-10 text-orange-500" />
        <h4 className="text-xl font-medium">
          {t("provider.switch_network_request")}
        </h4>
        <div className="text-sm text-gray-400">
          {t("provider.switch_network")}
        </div>
        <div className="p-2 bg-input-bg rounded-xl max-h-full w-full">
          <div className="break-words whitespace-pre-wrap max-h-60 overflow-y-auto px-1 text-base flex justify-center">
            {networkName}
          </div>
        </div>
      </>
    </Layout>
  );
};

export default SwitchNetwork;
