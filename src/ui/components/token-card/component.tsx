import { IToken } from "@/shared/interfaces/token";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { FC } from "react";
import cn from "classnames";

interface Props {
  token: IToken;
  openMintModal: (token: IToken) => void;
  openSendModal: (token: IToken) => void;
}

const TokenCard: FC<Props> = ({ token, openMintModal, openSendModal }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={cn(
              "flex w-full justify-between items-center bg-input-bg px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75",
              open ? "rounded-tl-xl rounded-tr-xl" : "rounded-xl"
            )}
          >
            <span className="font-medium text-base flex items-center">
              {token.tick.toUpperCase()}
            </span>
            <ChevronUpIcon
              className={`${open ? "" : "rotate-180 transform"} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="flex flex-col px-4 text-sm bg-input-bg rounded-bl-xl rounded-br-xl">
            <div className="py-1">
              <p>
                {t("components.token_card.balance")}: {token.balance}
              </p>
              <p>
                {t("components.token_card.transferable_balance")}:{" "}
                {token.transferable_balance}
              </p>
            </div>
            <div className="flex py-2 items-center gap-3">
              <button
                disabled={!token.transfers.length}
                className={"btn primary w-full flex-1"}
                onClick={() => {
                  openSendModal(token);
                }}
              >
                {t("components.token_card.send")}
              </button>
              <button
                disabled={token.balance <= 0}
                className={"btn primary w-full flex-3"}
                onClick={() => {
                  openMintModal(token);
                }}
              >
                {t("components.token_card.create_transfer")}
              </button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default TokenCard;
