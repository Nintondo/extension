import { FingerPrintIcon } from "@heroicons/react/24/solid";
import Layout from "../layout";
import { t } from "i18next";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { shortAddress } from "@/shared/utils/transactions";

const Connect = () => {
  const currentAccount = useGetCurrentAccount();

  return (
    <Layout
      documentTitle={t("provider.connecting")}
      resolveBtnText={t("provider.connect")}
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-text"
    >
      <FingerPrintIcon className="w-40 h-40 text-green-400 bg-input-bg rounded-full p-4" />
      <h3 className="text-xl font-medium">{t("provider.access_required")}</h3>

      <p className="text-lg text-center">
        {t("provider.connecting_account") + ": "}
        <span className="text-light-orange">
          {shortAddress(currentAccount.address)}
        </span>
      </p>
    </Layout>
  );
};

export default Connect;
