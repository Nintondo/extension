import { useCallback, useEffect, useState } from "react";

import { KeyIcon } from "@heroicons/react/24/outline";
import Layout from "../layout";
import { TailSpin } from "react-loading-icons";
import { IField } from "@/shared/interfaces/provider";
import { useDecodePsbtInputs as useGetPsbtFields } from "@/ui/hooks/provider";
import { t } from "i18next";
import Modal from "@/ui/components/modal";
import SignPsbtFileds from "@/ui/components/sign-psbt-fileds";
import notificationController from "@/background/controllers/notificationController";
import toast from "react-hot-toast";

const SignPsbt = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fields, setFields] = useState<IField[]>([]);
  const [modalInputIndex, setModalInputIndex] = useState<number | undefined>(
    undefined
  );
  const [fee, setFee] = useState<string>("");
  const getPsbtFields = useGetPsbtFields();

  const updateFields = useCallback(async () => {
    if (fields.length <= 0) setLoading(true);
    const resultFields = await getPsbtFields();
    if (resultFields === undefined) {
      await notificationController.rejectApproval("Invalid psbt");
      return;
    }
    setFields(resultFields.fields[0]);
    setFee(resultFields.fee + " BEL");
    setLoading(false);
  }, [getPsbtFields, fields]);

  useEffect(() => {
    if (fields.length) return;
    updateFields().catch((e) => {
      if ((e as Error).message) {
        toast.error(e.message);
      }
    });
  }, [updateFields, fields]);

  if (loading) return <TailSpin className="animate-spin" />;

  return (
    <Layout
      documentTitle={t("provider.sign_tx")}
      resolveBtnClassName="bg-text text-bg hover:bg-orange-500 hover:text-bg"
      resolveBtnText={t("provider.sign")}
    >
      <div className="flex flex-col overflow-y-scroll max-h-[420px] standard:max-h-full standard:overflow-hidden items-center gap-3 p-3 text-sm">
        <div className="flex items-center justify-center gap-4 mb-3">
          <KeyIcon className="w-8 h-8 text-orange-500" />
          <h4 className="text-xl font-medium">{t("provider.sign_tx")}</h4>
        </div>
        <SignPsbtFileds
          fields={fields}
          setModalInputIndexHandler={setModalInputIndex}
        />
        <div className="w-full">
          <label className="mb-2 flex text-gray-300 pl-2 justify-between">
            {t("provider.fee") + ":"}
          </label>
          <div className="rounded-xl px-5 py-2 break-all w-full flex gap-1 bg-input-bg">
            <p className="text-light-orange">{fee}</p>
          </div>
        </div>
      </div>
      <Modal
        open={modalInputIndex !== undefined}
        onClose={() => {
          setModalInputIndex(undefined);
        }}
        title={t("provider.warning")}
      >
        <div className="text-lg font-medium p-6">
          {t("provider.anyone_can_pay_warning")}
        </div>
      </Modal>
    </Layout>
  );
};

export default SignPsbt;
