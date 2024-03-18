import { IToken } from "@/shared/interfaces/token";
import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { FC, useState } from "react";
import cn from "classnames";
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
        className="flex w-full justify-between items-center bg-input-bg px-4 py-3 rounded-xl cursor-pointer"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div>
          <span className="font-medium text-base">
            {token.tick.toUpperCase()}
          </span>
          <div>
            {t("components.token_card.balance")}:{" "}
            <span className="font-medium">{token.balance}</span>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5" />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={token.tick.toUpperCase()}
      >
        <div className="pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <div className="px-4 py-2 flex flex-col gap-1 w-full">
              <label htmlFor="token_balance">
                {t("components.token_card.balance")}:
              </label>
              <span id="token_balance" className="text-lg font-medium">
                {token.balance}
              </span>
            </div>
            <div className="bg-white bg-opacity-20 w-[1px] h-9"></div>
            <div className="px-4 py-2 flex flex-col gap-1 w-full">
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
                <h3 className="font-light mb-3 uppercase text-sm text-center">
                  Transfers
                </h3>
                <div className="flex flex-col gap-2">
                  {token.transfers.map((transfer, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center w-full justify-between px-4 py-2 bg-input-light rounded-xl"
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

          <div className="flex items-center gap-3 w-full">
            <button
              disabled={!token.transfers.length}
              className={"btn primary w-full"}
              onClick={() => {
                openSendModal(token);
              }}
            >
              {t("components.token_card.send")}
            </button>
            <button
              disabled={token.balance <= 0}
              className={"btn primary w-full"}
              onClick={() => {
                openMintModal(token);
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
