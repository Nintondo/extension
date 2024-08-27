import {
  useCreateBellsTxCallback,
  useCreateOrdTx,
} from "@/ui/hooks/transactions";
import {
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
import { Inscription } from "@/shared/interfaces/inscriptions";
import { useGetCurrentAccount } from "@/ui/states/walletState";

interface FormType {
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
  const createOrdTx = useCreateOrdTx();
  const navigate = useNavigate();
  const location = useLocation();
  const [inscription, setInscription] = useState<Inscription | undefined>(
    undefined
  );
  const [inscriptionTransaction, setInscriptionTransaction] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const send = async ({
    address,
    amount,
    feeAmount: feeRate,
    includeFeeInAmount,
  }: FormType) => {
    try {
      setLoading(true);
      if (Number(amount) < 0.00001 && !inscriptionTransaction) {
        return toast.error(t("send.create_send.minimum_amount_error"));
      }
      if (address.trim().length <= 0) {
        return toast.error(t("send.create_send.address_error"));
      }
      if (Number(amount) > (currentAccount?.balance ?? 0) / 10 ** 8) {
        return toast.error(t("send.create_send.not_enough_money_error"));
      }
      if (typeof feeRate !== "number" || !feeRate || feeRate < 1) {
        return toast.error(t("send.create_send.not_enough_fee_error"));
      }
      if (feeRate % 1 !== 0) {
        return toast.error(t("send.create_send.fee_is_text_error"));
      }

      const data = !inscriptionTransaction
        ? await createTx(
            address,
            Number((Number(amount) * 10 ** 8).toFixed(0)),
            feeRate,
            includeFeeInAmount
          )
        : await createOrdTx(address, feeRate, inscription!);
      if (!data) return;
      const { fee, rawtx } = data;

      navigate("/pages/confirm-send", {
        state: {
          toAddress: address,
          amount: !inscriptionTransaction
            ? Number(amount)
            : inscription!.inscription_id,
          includeFeeInAmount,
          fromAddress: currentAccount?.address ?? "",
          feeAmount: fee,
          inputedFee: feeRate,
          hex: rawtx,
          save: isSaveAddress,
          inscriptionTransaction,
        },
      });
    } catch (e) {
      if ((e as Error).message) {
        toast.error((e as Error).message);
      } else {
        toast.error(t("send.create_send.default_error"));
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      !currentAccount ||
      !currentAccount.address ||
      typeof currentAccount.balance === "undefined"
    )
      return;

    if (location.state && location.state.toAddress) {
      setFormData((prev) => {
        if (prev.address === "") {
          if (location.state.save) {
            setIsSaveAddress(true);
          }
          if (currentAccount.balance! / 10 ** 8 <= location.state.amount)
            setIncludeFeeLocked(true);

          if (location.state && location.state.inscription_id) {
            setInscription(location.state);
            setInscriptionTransaction(true);
          }

          return {
            address: location.state.toAddress,
            amount: location.state.amount,
            feeAmount: location.state.inputedFee,
            includeFeeInAmount: location.state.includeFeeInAmount,
          };
        }
        return prev;
      });
    }
  }, [location.state, setFormData, currentAccount]);

  const onAmountChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!currentAccount || !currentAccount.address || !currentAccount.balance)
      return;
    setFormData((prev) => ({
      ...prev,
      amount: normalizeAmount(e.target.value),
    }));
    if (currentAccount.balance / 10 ** 8 > Number(e.target.value)) {
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
    if (currentAccount?.balance) {
      setFormData((prev) => ({
        ...prev,
        amount: (currentAccount.balance! / 10 ** 8).toString(),
        includeFeeInAmount: true,
      }));
      setIncludeFeeLocked(true);
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
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
          {inscriptionTransaction ? undefined : (
            <div className="flex flex-col gap-1 w-full">
              <div className="form-field">
                <span className="input-span">
                  {t("send.create_send.amount")}
                </span>
                <div className="flex gap-2 w-full">
                  <input
                    type="number"
                    placeholder={t("send.create_send.amount_to_send")}
                    className="w-full input"
                    value={formData.amount}
                    onChange={onAmountChange}
                  />
                  <button className={s.maxAmount} onClick={onMaxClick}>
                    {t("send.create_send.max_amount")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={s.feeDiv}>
          <div className="form-field">
            <span className="input-span">
              {t("send.create_send.fee_label")}
            </span>
            <FeeInput
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, feeAmount: v ?? 0 }))
              }
              value={formData.feeAmount}
            />
          </div>

          {inscriptionTransaction ? undefined : (
            <Switch
              label={t("send.create_send.include_fee_in_the_amount_label")}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, includeFeeInAmount: v }))
              }
              value={formData.includeFeeInAmount}
              locked={includeFeeLocked}
            />
          )}

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

      <div>
        {!inscriptionTransaction && (
          <div className="flex justify-between py-2 px-4 mb-11">
            <div className="text-xs uppercase text-gray-400">{`${t(
              "wallet_page.amount_in_transactions"
            )}`}</div>
            <span className="text-sm font-medium">
              {`${((currentAccount?.balance ?? 0) / 10 ** 8).toFixed(8)} BEL`}
            </span>
          </div>
        )}
        <button
          disabled={loading}
          type="submit"
          className={"bottom-btn"}
          form={formId}
        >
          {t("send.create_send.continue")}
        </button>
      </div>

      <AddressBookModal
        isOpen={isOpenModal}
        onClose={() => setOpenModal(false)}
        setAddress={(address) => {
          setFormData((p) => ({ ...p, address: address }));
        }}
      />
    </div>
  );
};

export default CreateSend;
