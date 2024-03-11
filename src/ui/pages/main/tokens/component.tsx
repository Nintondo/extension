import s from "../inscriptions/styles.module.scss";
import { useEffect, useState } from "react";
import type { IToken } from "@/shared/interfaces/token";
import { useTransactionManagerContext } from "@/ui/utils/tx-ctx";
import TokenCard from "@/ui/components/token-card";
import { t } from "i18next";
import MintTransferModal from "./mint-transfer-modal";
import SendTransferModal from "./send-transfer-modal";

const TokensComponent = () => {
  const { tokens, setTokenHandler } = useTransactionManagerContext();
  const [foundTokens, setFoundTokens] = useState<IToken[]>();

  const [selectedMintToken, setSelectedMintToken] = useState<
    IToken | undefined
  >(undefined);
  const [selectedSendToken, setSelectedSendToken] = useState<
    IToken | undefined
  >(undefined);

  useEffect(() => {
    setTokenHandler(setFoundTokens);

    return () => {
      setTokenHandler(undefined);
    };
  }, [setTokenHandler]);

  return (
    <div className={s.inscriptionDiv}>
      <div className="lex flex-col h-full w-full pb-8 overflow-hidden standard:pb-16">
        <div className="py-2 pt-4 overflow-y-auto gap-3 flex flex-col">
          {(foundTokens === undefined ? tokens : foundTokens).map(
            (f: IToken, i: number) => {
              return (
                <div key={i}>
                  <TokenCard
                    openMintModal={(token) => {
                      setSelectedMintToken(token);
                    }}
                    openSendModal={(token) => {
                      setSelectedSendToken(token);
                    }}
                    token={f}
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
      {(foundTokens === undefined && !tokens.length) ||
      (foundTokens !== undefined && !foundTokens.length) ? (
        <div className="flex w-full h-4/5 bottom-0 items-center justify-center absolute">
          <p>{t("inscriptions.tokens_not_found")}</p>
        </div>
      ) : undefined}
      <MintTransferModal
        selectedMintToken={selectedMintToken}
        setSelectedMintToken={setSelectedMintToken}
      />
      <SendTransferModal
        selectedSendToken={selectedSendToken}
        setSelectedSendToken={setSelectedSendToken}
      />
    </div>
  );
};

export default TokensComponent;
