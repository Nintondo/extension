import { IToken } from "@/shared/interfaces/token";
import MintTransferForm from "@/ui/components/mint-transfer-form";
import Modal from "@/ui/components/modal";
import { t } from "i18next";
import { FC } from "react";

interface Props {
  selectedMintToken: IToken | undefined;
  setSelectedMintToken: (token: IToken | undefined) => void;
}

const MintTransferModal: FC<Props> = ({
  selectedMintToken,
  setSelectedMintToken,
}) => {
  return (
    <Modal
      open={selectedMintToken !== undefined}
      onClose={() => setSelectedMintToken(undefined)}
      title={t("inscriptions.mint_token_modal_title")}
      panelClassName="relative w-full max-w-md transform overflow-hidden rounded-t-2xl bg-bg px-2 pt-5 text-left align-middle shadow-xl transition-all standard:rounded-2xl standard:p-5"
    >
      <MintTransferForm
        selectedMintToken={selectedMintToken}
        setSelectedMintToken={setSelectedMintToken}
      />
    </Modal>
  );
};

export default MintTransferModal;
