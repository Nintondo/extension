import { IToken, ITransfer } from "@/shared/interfaces/token";
import Modal from "@/ui/components/modal";
import { t } from "i18next";
import { FC, useId, useState } from "react";
import s from "./styles.module.scss";
import FeeInput from "../../send/create-send/fee-input";
import Loading from "react-loading";
import AddressInput from "../../send/create-send/address-input";
import AddressBookModal from "../../send/create-send/address-book-modal";
import cn from "classnames";
import toast from "react-hot-toast";
import { useSendTransferTokens } from "@/ui/hooks/transactions";

interface Props {
  selectedSendToken: IToken | undefined;
  setSelectedSendToken: (token: IToken | undefined) => void;
}

interface FormType {
  address: string;
  txIds: ITransfer[];
  feeRate: number;
}

function formatAmount(amount: number) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(1) + "T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(1) + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(1) + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(1) + "K";
  return amount.toString();
}

const SendTransferModal: FC<Props> = ({
  selectedSendToken,
  setSelectedSendToken,
}) => {
  const [formData, setFormData] = useState<FormType>({
    address: "",
    txIds: [],
    feeRate: 10,
  });
  const formId = useId();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);

  const sendTransferTokens = useSendTransferTokens();

  const send = async ({ address, txIds, feeRate }: FormType) => {
    try {
      setLoading(true);
      if (typeof feeRate !== "number" || !feeRate || feeRate % 1 !== 0) {
        return toast.error(t("send.create_send.fee_is_text_error"));
      }
      if (address.trim().length <= 0) {
        return toast.error(t("send.create_send.address_error"));
      }
      if (txIds.length <= 0) {
        return toast.error(t("inscriptions.0_selected_inscriptions_error"));
      }
      await sendTransferTokens(address, txIds, feeRate);
      setSelectedSendToken(undefined);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const selectedTransfer = (tx: ITransfer) => {
    if (formData.txIds.includes(tx)) {
      setFormData((prev) => ({
        ...prev,
        txIds: prev.txIds.filter((t) => t !== tx),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        txIds: [...prev.txIds, tx],
      }));
    }
  };

  return (
    <Modal
      open={selectedSendToken !== undefined}
      onClose={() => {
        setSelectedSendToken(undefined);
        setFormData({ address: "", txIds: [], feeRate: 10 });
      }}
      title={t("inscriptions.send_token_modal_title")}
    >
      <form
        id={formId}
        className={"w-full flex flex-col gap-6 px-1 py-6 items-start h-full"}
        onSubmit={async (e) => {
          e.preventDefault();
          await send(formData);
        }}
      >
        <div className="form-field">
          <span className="input-span">{t("send.create_send.address")}</span>
          <AddressInput
            address={formData.address}
            onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
            onOpenModal={() => setOpenModal(true)}
          />
        </div>

        <div className="form-field">
          <div className="flex justify-center">
            <span className="font-medium text-base">
              {t("inscriptions.total_amount")}:{" "}
              {formData.txIds.reduce((acc, tx) => acc + tx.amount, 0)}
            </span>
          </div>
          <div className={s.gridContainer}>
            {selectedSendToken?.transfers.map((tx, i) => (
              <div
                onClick={() => {
                  selectedTransfer(tx);
                }}
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center bg-input-bg rounded-xl w-24 h-24 cursor-pointer border-2",
                  { [s.selectedTransfer]: formData.txIds.includes(tx) },
                  { [s.transfer]: !formData.txIds.includes(tx) }
                )}
              >
                <span>${selectedSendToken.tick.toUpperCase()}</span>
                <span>{formatAmount(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field">
          <span className="input-span">{t("send.create_send.fee_label")}</span>
          <FeeInput
            onChange={(v) =>
              setFormData((prev) => ({ ...prev, feeRate: v ?? 0 }))
            }
            value={formData.feeRate}
          />
        </div>
      </form>

      <div className="w-full flex justify-center items-center">
        {loading ? (
          <div className="w-full flex justify-center items-center">
            <Loading />
          </div>
        ) : (
          <button
            type="submit"
            className={"btn primary mx-4 standard:m-6"}
            form={formId}
          >
            {t("components.layout.send")}
          </button>
        )}
      </div>

      <AddressBookModal
        isOpen={isOpenModal}
        onClose={() => setOpenModal(false)}
        setAddress={(address) => {
          setFormData((p) => ({ ...p, address: address }));
        }}
      />
    </Modal>
  );
};

export default SendTransferModal;
