import { IToken } from "@/shared/interfaces/token";
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
    >
      <MintTransferModal
        selectedMintToken={selectedMintToken}
        setSelectedMintToken={setSelectedMintToken}
      />
    </Modal>
  );
};

export default MintTransferModal;
