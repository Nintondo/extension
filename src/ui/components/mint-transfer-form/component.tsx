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
  FC,
} from "react";
import toast from "react-hot-toast";
import { TailSpin } from "react-loading-icons";
import s from "./styles.module.scss";
import { nFormatter } from "../../utils/formatter";

interface FormType {
  amount: string;
  feeRate: number;
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
      amount: (selectedMintToken?.balance ?? "").toString(),
    }));
  };

  const inscribe = async ({ amount, feeRate }: FormType) => {
    try {
      setLoading(true);
      if (Number.isNaN(Number(amount))) {
        return toast.error(t("inscriptions.amount_is_text_error"));
      }
      if (
        selectedMintToken?.balance &&
        Number(amount) > selectedMintToken?.balance
      ) {
        return toast.error(t("inscriptions.amount_exceeds_balance"));
      }
      if (typeof feeRate !== "number" || !feeRate || feeRate % 1 !== 0) {
        return toast.error(t("send.create_send.fee_is_text_error"));
      }
      if (Number(amount) <= 0) {
        return toast.error(t("inscriptions.minimum_amount_error"));
      }
      if (!selectedMintToken?.tick) {
        return toast.error("inscriptions.tick_is_not_set");
      }
      await inscribeTransferToken(
        {
          p: "bel-20",
          op: "transfer",
          tick: selectedMintToken?.tick,
          amt: amount,
        },
        formData.feeRate as number
      );
      setSelectedMintToken(undefined);
      if (mintedHandler) mintedHandler(Number(amount));
      setFormData({
        amount: "",
        feeRate: 10,
      });
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
      else throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        id={formId}
        className={"w-full flex flex-col gap-6 px-1 py-6 items-start h-full"}
        onSubmit={async (e) => {
          e.preventDefault();
          await inscribe(formData);
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
            <div className="p-2 mt-2 text-center rounded-xl bg-input-light standard:bg-bg">
              <div className="flex justify-between p-0.5 items-center">
                <div>{`${t("components.token_card.balance")}: `}</div>
                <span className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {`${
                      typeof selectedMintToken?.balance !== "undefined"
                        ? nFormatter(selectedMintToken.balance)
                        : "-"
                    }`}
                  </span>

                  <span className="text-xs">{selectedMintToken?.tick}</span>
                </span>
              </div>
            </div>
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

      <div className="min-h-12" />

      <div className="w-full flex justify-center items-center absolute bottom-0 left-0 right-0">
        {loading ? (
          <div className="w-full flex justify-center items-center">
            <TailSpin />
          </div>
        ) : (
          <button
            type="submit"
            className={
              "text-center text-base py-3 border-t border-neutral-700 w-full"
            }
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
