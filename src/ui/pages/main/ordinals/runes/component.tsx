import s from "../inscriptions/styles.module.scss";
import { useEffect, useState } from "react";
import { t } from "i18next";
import { useOrdinalsManagerContext } from "@/ui/utils/ordinals-ctx";
import { TailSpin } from "react-loading-icons";
import { Rune } from "@/shared/types/runes";

const RunesComponent = () => {
  const { runes, updateRunes, loading, searchRunes } =
    useOrdinalsManagerContext();

  const [selectedRune, setSelectedRune] = useState<Rune | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateRunes();
    const intervalId = setInterval(async () => {
      await updateRunes();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [updateRunes]);

  if (loading && !runes.length)
    return (
      <div>
        <TailSpin />
      </div>
    );

  return (
    <div className={s.inscriptionDiv}>
      <div className="overflow-hidden flex-col pb-8 w-full h-full lex standard:pb-16">
        <div className="flex overflow-y-auto flex-col gap-3 py-2 pt-4">
          {(searchRunes === undefined ? runes : searchRunes).map(
            (f: Rune, i: number) => {
              return (
                <div key={i}>
                  {/* <TokenCard
                    openMintModal={setSelectedMintToken}
                    openSendModal={setSelectedSendToken}
                    token={f}
                  /> */}
                </div>
              );
            }
          )}
        </div>
      </div>
      {(searchRunes === undefined && !runes.length) ||
      (searchRunes !== undefined && !searchRunes.length) ? (
        <div className="flex absolute bottom-0 justify-center items-center w-full h-4/5">
          <p>{t("inscriptions.tokens_not_found")}</p>
        </div>
      ) : undefined}
    </div>
  );
};

export default RunesComponent;
