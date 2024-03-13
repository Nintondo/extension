import { FingerPrintIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import { t } from "i18next";

const Connect = () => {
  return (
    <Layout
      documentTitle={t("provider.connecting")}
      resolveBtnText={t("provider.connect")}
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-text"
    >
      <FingerPrintIcon className="w-40 h-40 text-green-400 bg-input-bg rounded-full p-4" />
      <h3 className="text-xl font-medium">{t("provider.access_required")}</h3>
    </Layout>
  );
};

export default Connect;
