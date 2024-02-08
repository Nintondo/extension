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

interface Props {
  selectedSendToken: IToken | undefined;
  setSelectedSendToken: (token: IToken | undefined) => void;
}

const SendTransferModal: FC<Props> = ({
  selectedSendToken,
  setSelectedSendToken,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Modal
      open={selectedSendToken !== undefined}
      onClose={() => setSelectedSendToken(undefined)}
      title={t("inscriptions.send_token_modal_title")}
    >
      <div></div>
    </Modal>
  );
};

export default SendTransferModal;
