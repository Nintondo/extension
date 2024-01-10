import { useCreateBellsTxCallback } from "@/ui/hooks/transactions";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import {
  useCallback,
  useEffect,
  useState,
  ChangeEventHandler,
  MouseEventHandler,
  useId,
} from "react";
import s from "./styles.module.scss";
import cn from "classnames";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import FeeInput from "./fee-input";
import Switch from "@/ui/components/switch";
import AddressBookModal from "./address-book-modal";
import AddressInput from "./address-input";
import { normalizeAmount } from "@/ui/utils";
import { t } from "i18next";

export interface FormType {
  address: string;
  amount: string;
  feeAmount: number;
  includeFeeInAmount: boolean;
}

const CreateSend = () => {
  const formId = useId();

  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [isSaveAddress, setIsSaveAddress] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormType>({
    address: "",
    amount: "",
    includeFeeInAmount: false,
    feeAmount: 10,
  });
  const [includeFeeLocked, setIncludeFeeLocked] = useState<boolean>(false);
  const currentAccount = useGetCurrentAccount();
  const createTx = useCreateBellsTxCallback();
  const navigate = useNavigate();
  const location = useLocation();

  const send = async ({
    address,
    amount,
    feeAmount,
    includeFeeInAmount,
  }: FormType) => {
    if (Number(amount) < 0.01) {
      return toast.error(t("send.create_send.minimum_amount_error"));
    }
    if (address.trim().length <= 0) {
      return toast.error(t("send.create_send.address_error"));
    }
    if (Number(amount) > (currentAccount?.balance ?? 0)) {
      return toast.error(t("send.create_send.not_enough_money_error"));
    }
    if (feeAmount < 1) {
      return toast.error(t("send.create_send.not_enough_fee_error"));
    }
    if (feeAmount % 1 !== 0) {
      return toast.error(t("send.create_send.fee_is_text_error"));
    }

    try {
      const { fee, rawtx } = await createTx(
        address,
        Number(amount) * 10 ** 8,
        feeAmount,
        includeFeeInAmount
      );

      navigate("/pages/confirm-send", {
        state: {
          toAddress: address,
          amount: Number(amount),
          includeFeeInAmount,
          fromAddress: currentAccount?.address ?? "",
          feeAmount: fee,
          inputedFee: feeAmount,
          hex: rawtx,
          save: isSaveAddress,
        },
      });
    } catch (e) {
      console.error(e);
      toast.error(t("send.create_send.default_error"));
    }
  };

  useEffect(() => {
    if (location.state && location.state.toAddress) {
      setFormData({
        address: location.state.toAddress,
        amount: location.state.amount,
        feeAmount: location.state.inputedFee,
        includeFeeInAmount: location.state.includeFeeInAmount,
      });
      if (location.state.save) {
        setIsSaveAddress(true);
      }
      if (currentAccount?.balance <= location.state.amount)
        setIncludeFeeLocked(true);
    }
  }, [location.state, setFormData, currentAccount?.balance]);

  const onAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev) => ({
      ...prev,
      amount: normalizeAmount(e.target.value),
    }));
    if (currentAccount?.balance > Number(e.target.value)) {
      setIncludeFeeLocked(false);
    } else {
      setIncludeFeeLocked(true);
      setFormData((prev) => ({
        ...prev,
        includeFeeInAmount: true,
      }));
    }
  };

  const onMaxClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      amount: currentAccount?.balance.toString(),
      includeFeeInAmount: true,
    }));
    setIncludeFeeLocked(true);
  };

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <form
        id={formId}
        className={cn("form", s.send)}
        onSubmit={async (e) => {
          e.preventDefault();
          await send(formData);
        }}
      >
        <div className={s.inputs}>
          <div className="form-field">
            <span className="input-span">{t("send.create_send.address")}</span>
            <AddressInput
              address={formData.address}
              onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
              onOpenModal={() => setOpenModal(true)}
            />
          </div>
          <div className="form-field">
            <span className="input-span">{t("send.create_send.amount")}</span>
            <div className="flex gap-2 w-full">
              <input
                type="number"
                placeholder={t("send.create_send.amount_to_send")}
                className="input w-full"
                value={formData.amount}
                onChange={onAmountChange}
              />
              <button className={s.maxAmount} onClick={onMaxClick}>
                {t("send.create_send.max_amount")}
              </button>
            </div>
          </div>
        </div>

        <div className={s.feeDiv}>
          <div className="form-field">
            <span className="input-span">
              {t("send.create_send.fee_label")}
            </span>
            <FeeInput
              onChange={useCallback(
                (v) => setFormData((prev) => ({ ...prev, feeAmount: v })),
                [setFormData]
              )}
              value={formData.feeAmount}
            />
          </div>

          <Switch
            label={t("send.create_send.include_fee_in_the_amount_label")}
            onChange={(v) =>
              setFormData((prev) => ({ ...prev, includeFeeInAmount: v }))
            }
            value={formData.includeFeeInAmount}
            locked={includeFeeLocked}
          />

          <Switch
            label={t(
              "send.create_send.save_address_for_the_next_payments_label"
            )}
            value={isSaveAddress}
            onChange={setIsSaveAddress}
            locked={false}
          />
        </div>
      </form>

      <button
        type="submit"
        className={"btn primary mx-4 mb-4 md:m-6 md:mb-3"}
        form={formId}
      >
        {t("send.create_send.continue")}
      </button>

      <AddressBookModal
        isOpen={isOpenModal}
        onClose={() => setOpenModal(false)}
        setFormData={setFormData}
      />
    </div>
  );
};

export default CreateSend;
