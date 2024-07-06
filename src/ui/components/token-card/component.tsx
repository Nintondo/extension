import { IToken } from "@/shared/interfaces/token";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { FC, useState } from "react";
import Modal from "../modal";
import { shortAddress } from "@/shared/utils/transactions";

interface Props {
  token: IToken;
  openMintModal: (token: IToken) => void;
  openSendModal: (token: IToken) => void;
}

const TokenCard: FC<Props> = ({ token, openMintModal, openSendModal }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex justify-between items-center py-3 px-4 w-full rounded-xl cursor-pointer bg-input-bg"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div>
          <span className="text-base font-medium">
            {token.tick.toUpperCase()}
          </span>
          <div>
            {t("components.token_card.balance")}:{" "}
            <span className="font-medium">{token.balance}</span>
          </div>
        </div>
        <ChevronRightIcon className="w-5 h-5" />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={token.tick.toUpperCase()}
      >
        <div className="flex flex-col gap-3 pt-3">
          <div className="flex gap-1 items-center">
            <div className="flex flex-col gap-1 py-2 px-4 w-full">
              <label htmlFor="token_balance">
                {t("components.token_card.balance")}:
              </label>
              <span id="token_balance" className="text-lg font-medium">
                {token.balance}
              </span>
            </div>
            <div className="h-9 bg-white bg-opacity-20 w-[1px]"></div>
            <div className="flex flex-col gap-1 py-2 px-4 w-full">
              <label htmlFor="transfer_balance">
                {t("components.token_card.transferable_balance")}:
              </label>
              <span id="transfer_balance" className="text-lg font-medium">
                {token.transferable_balance}
              </span>
            </div>
          </div>

          <div className="pb-3">
            {token.transfers.length ? (
              <>
                <h3 className="mb-3 text-sm font-light text-center uppercase">
                  Transfers
                </h3>
                <div className="flex flex-col gap-2">
                  {token.transfers.map((transfer, i) => (
                    <div
                      key={i}
                      className="flex gap-3 justify-between items-center py-2 px-4 w-full rounded-xl bg-input-light"
                    >
                      <span className="text-sm font-medium">
                        {transfer.amount}
                      </span>
                      <span className="text-xs text-gray-400">
                        {shortAddress(transfer.inscription_id, 9)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : undefined}
          </div>

          <div className="flex gap-3 items-center w-full">
            <button
              disabled={!token.transfers.length}
              className={"btn primary w-full"}
              onClick={() => {
                openSendModal(token);
                setOpen(false);
              }}
            >
              {t("components.token_card.send")}
            </button>
            <button
              disabled={token.balance <= 0}
              className={"btn primary w-full"}
              onClick={() => {
                openMintModal(token);
                setOpen(false);
              }}
            >
              {t("components.token_card.create_transfer")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TokenCard;
