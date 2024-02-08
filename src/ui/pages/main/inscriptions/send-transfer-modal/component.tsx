/* eslint-disable @typescript-eslint/no-floating-promises */
import { IToken, ITransfer } from "@/shared/interfaces/token";
import Modal from "@/ui/components/modal";
import { t } from "i18next";
import { FC, useCallback, useId, useState } from "react";
import s from "./styles.module.scss";
import FeeInput from "../../send/create-send/fee-input";
import Loading from "react-loading";
import AddressInput from "../../send/create-send/address-input";
import AddressBookModal from "../../send/create-send/address-book-modal";

interface Props {
  selectedSendToken: IToken | undefined;
  setSelectedSendToken: (token: IToken | undefined) => void;
}

interface FormType {
  address: string;
  txIds: ITransfer[];
  feeRate: number;
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

  const send = useCallback(async ({ address, txIds, feeRate }: FormType) => {},
  []);

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
      onClose={() => setSelectedSendToken(undefined)}
      title={t("inscriptions.send_token_modal_title")}
    >
      <form
        id={formId}
        className={"w-full flex flex-col gap-6 px-1 py-6 items-start h-full"}
        onSubmit={async (e) => {
          e.preventDefault();
          send(formData);
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
          <div className="flex">
            <span className="input-span">
              {t("inscriptions.choose_transfer")}
            </span>
            <span>
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
                className="flex flex-col items-center justify-center bg-input-bg rounded-xl w-24 h-24 cursor-pointer"
              >
                <span>${selectedSendToken.tick.toUpperCase()}</span>
                <span>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field">
          <span className="input-span">{t("send.create_send.fee_label")}</span>
          <FeeInput
            // eslint-disable-next-line react-hooks/rules-of-hooks
            onChange={useCallback(
              (v) => setFormData((prev) => ({ ...prev, feeRate: v })),
              [setFormData]
            )}
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
            className={"btn primary mx-4 md:m-6"}
            form={formId}
          >
            {t("send.create_send.continue")}
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
