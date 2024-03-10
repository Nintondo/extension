/* eslint-disable @typescript-eslint/no-floating-promises */
import { IToken } from "@/shared/interfaces/token";
import Modal from "@/ui/components/modal";
import { t } from "i18next";
import {
  ChangeEventHandler,
  FC,
  MouseEventHandler,
  useCallback,
  useId,
  useState,
} from "react";
import { normalizeAmount } from "@/ui/utils";
import s from "./styles.module.scss";
import FeeInput from "../../send/create-send/fee-input";
import Loading from "react-loading";
import { useInscribeTransferToken } from "@/ui/hooks/inscriber";
import toast from "react-hot-toast";

interface FormType {
  amount: string;
  feeRate: number;
}

interface Props {
  selectedMintToken: IToken | undefined;
  setSelectedMintToken: (token: IToken | undefined) => void;
}

const MintTransferModal: FC<Props> = ({
  selectedMintToken,
  setSelectedMintToken,
}) => {
  const [formData, setFormData] = useState<FormType>({
    amount: "",
    feeRate: 10,
  });
  const formId = useId();
  const [loading, setLoading] = useState<boolean>(false);
  const inscribeTransferToken = useInscribeTransferToken();

  const onAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev) => ({
      ...prev,
      amount: normalizeAmount(e.target.value),
    }));
  };

  const onMaxClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      amount: selectedMintToken.balance.toString(),
    }));
  };

  const inscribe = useCallback(
    async ({ amount, feeRate }: FormType) => {
      try {
        setLoading(true);
        if (Number.isNaN(Number(amount))) {
          return toast.error(t("inscriptions.amount_is_text_error"));
        }
        if (Number(amount) % 1 !== 0) {
          return toast.error(t("inscriptions.amount_cannot_be_fractional"));
        }
        if (Number(amount) > selectedMintToken.balance) {
          return toast.error(t("inscriptions.amount_exceeds_balance"));
        }
        if (feeRate % 1 !== 0) {
          return toast.error(t("send.create_send.fee_is_text_error"));
        }
        await inscribeTransferToken(
          {
            p: "bel-20",
            op: "transfer",
            tick: selectedMintToken.tick,
            amt: amount,
          },
          formData.feeRate
        );
        setSelectedMintToken(undefined);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setFormData({
          amount: "",
          feeRate: 10,
        });
        setLoading(false);
      }
    },
    [
      setLoading,
      formData.feeRate,
      inscribeTransferToken,
      selectedMintToken,
      setSelectedMintToken,
    ]
  );

  return (
    <Modal
      open={selectedMintToken !== undefined}
      onClose={() => setSelectedMintToken(undefined)}
      title={t("inscriptions.mint_token_modal_title")}
    >
      <form
        id={formId}
        className={"w-full flex flex-col gap-6 px-1 py-6 items-start h-full"}
        onSubmit={async (e) => {
          e.preventDefault();
          inscribe(formData);
        }}
      >
        <div className="form-field">
          <span className="input-span">{t("send.create_send.amount")}</span>
          <div className="flex gap-2 w-full">
            <input
              type="number"
              placeholder={t("inscriptions.amount_to_mint")}
              className="input w-full"
              value={formData.amount}
              onChange={onAmountChange}
            />
            <button className={s.maxAmount} onClick={onMaxClick}>
              {t("send.create_send.max_amount")}
            </button>
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
            className={"btn primary mx-4 standard:m-6"}
            form={formId}
          >
            {t("components.layout.send")}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default MintTransferModal;
