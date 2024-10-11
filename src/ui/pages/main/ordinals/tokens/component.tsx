import s from "../inscriptions/styles.module.scss";
import { useEffect, useState } from "react";
import type { Token } from "@/shared/types/token";
import TokenCard from "@/ui/components/token-card";
import { t } from "i18next";
import MintTransferModal from "./mint-transfer-modal";
import SendTransferModal from "./send-transfer-modal";
import { useOrdinalsManagerContext } from "@/ui/utils/ordinals-ctx";
import { TailSpin } from "react-loading-icons";

const TokensComponent = () => {
  const { tokens, searchTokens, updateTokens, loading } =
    useOrdinalsManagerContext();

  const [selectedMintToken, setSelectedMintToken] = useState<Token | undefined>(
    undefined
  );
  const [selectedSendToken, setSelectedSendToken] = useState<Token | undefined>(
    undefined
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateTokens();
    const intervalId = setInterval(async () => {
      await updateTokens();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [updateTokens]);

  if (loading && !tokens.length)
    return (
      <div>
        <TailSpin />
      </div>
    );

  return (
    <div className={s.inscriptionDiv}>
      <div className="overflow-hidden flex-col pb-8 w-full h-full lex standard:pb-16">
        <div className="flex overflow-y-auto flex-col gap-3 py-2 pt-4">
          {(searchTokens === undefined ? tokens : searchTokens).map(
            (f: Token, i: number) => {
              return (
                <div key={i}>
                  <TokenCard
                    openMintModal={setSelectedMintToken}
                    openSendModal={setSelectedSendToken}
                    token={f}
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
      {(searchTokens === undefined && !tokens.length) ||
      (searchTokens !== undefined && !searchTokens.length) ? (
        <div className="flex absolute bottom-0 justify-center items-center w-full h-4/5">
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
