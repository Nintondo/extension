import { IToken } from "@/shared/interfaces/token";
import { useInscribeTransferToken } from "@/ui/hooks/inscriber";
import FeeInput from "@/ui/pages/main/send/create-send/fee-input";
import { normalizeAmount } from "@/ui/utils";
import { t } from "i18next";
import {
  useState,
  useId,
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  FC,
} from "react";
import toast from "react-hot-toast";
import Loading from "react-loading";
import s from "./styles.module.scss";

interface FormType {
  amount: string;
  feeRate: number | string;
  transferCount: number | string;
}

interface MintTransferModalProps {
  setSelectedMintToken: (token: IToken | undefined) => void;
  selectedMintToken: IToken | undefined;
  mintedHandler?: (mintedAmount: number) => void;
}

const MintTransferModal: FC<MintTransferModalProps> = ({
  setSelectedMintToken,
  selectedMintToken,
  mintedHandler,
}) => {
  const [formData, setFormData] = useState<FormType>({
    amount: "",
    transferCount: "",
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

  const onTransferCountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev) => ({
      ...prev,
      transferCount: normalizeAmount(e.target.value),
    }));
  };

  const onMaxClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      amount: selectedMintToken?.balance.toString(),
    }));
  };

  const onMaxTransferClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (Number(formData.amount) < 1)
      return toast.error("inscriptions.input_amount_first");
    const maximum = selectedMintToken?.balance / Number(formData.amount);
    setFormData((prev) => ({
      ...prev,
      transferCount: Math.floor(maximum).toString(),
    }));
  };

  const inscribe = useCallback(
    async ({ amount, feeRate, transferCount }: FormType) => {
      try {
        setLoading(true);
        if (Number.isNaN(Number(amount))) {
          return toast.error(t("inscriptions.amount_is_text_error"));
        }
        if (Number.isNaN(Number(transferCount))) {
          return toast.error(t("inscriptions.transfer_count_is_text_error"));
        }
        if (Number(amount) % 1 !== 0) {
          return toast.error(t("inscriptions.amount_cannot_be_fractional"));
        }
        if (Number(transferCount) % 1 !== 0) {
          return toast.error(
            t("inscriptions.transfer_countcannot_be_fractional")
          );
        }
        if (Number(amount) > selectedMintToken?.balance) {
          return toast.error(t("inscriptions.amount_exceeds_balance"));
        }
        if (typeof feeRate !== "number" || !feeRate || feeRate % 1 !== 0) {
          return toast.error(t("send.create_send.fee_is_text_error"));
        }
        if (Number(amount) < 1) {
          return toast.error(t("inscriptions.minimum_amount_error"));
        }
        if (Number(transferCount) < 1) {
          return toast.error(t("inscriptions.minimum_transfer_count"));
        }
        if (
          Number(transferCount) * Number(amount) >
          selectedMintToken?.balance
        ) {
          return toast.error(t("inscriptions.not_enough_token_balance"));
        }
        await inscribeTransferToken(
          {
            p: "bel-20",
            op: "transfer",
            tick: selectedMintToken?.tick,
            amt: amount,
          },
          formData.feeRate as number,
          formData.transferCount as number
        );
        setSelectedMintToken(undefined);
        if (mintedHandler) mintedHandler(Number(amount));
        setFormData({
          amount: "",
          transferCount: "",
          feeRate: 10,
        });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      formData,
      inscribeTransferToken,
      selectedMintToken,
      setSelectedMintToken,
      mintedHandler,
    ]
  );

  return (
    <>
      <form
        id={formId}
        className={"w-full flex flex-col gap-6 px-1 py-6 items-start h-full"}
        onSubmit={async (e) => {
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          inscribe(formData);
        }}
      >
        <div className="form-field">
          <span className="input-span">{t("send.create_send.amount")}</span>
          <div className="flex flex-col gap-1 w-full">
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
            <div className="flex gap-2 w-full mt-2">
              <input
                type="number"
                placeholder={t("inscriptions.transfers_count")}
                className="input w-full"
                value={formData.transferCount}
                onChange={onTransferCountChange}
              />
              <button className={s.maxAmount} onClick={onMaxTransferClick}>
                {t("send.create_send.max_amount")}
              </button>
            </div>
            <div className="p-2 mt-2 text-center rounded-xl bg-input-light standard:bg-bg">
              <div className="flex justify-between p-0.5 items-center">
                <div>{`${t("components.token_card.balance")}: `}</div>
                <span className="text-sm font-medium">
                  {`${selectedMintToken?.balance ?? "-"}`}
                </span>
              </div>
            </div>
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
            {t("inscriptions.inscribe")}
          </button>
        )}
      </div>
    </>
  );
};

export default MintTransferModal;
