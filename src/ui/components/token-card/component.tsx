import { IToken } from "@/shared/interfaces/token";
import { t } from "i18next";
import { FC } from "react";

interface Props {
  token: IToken;
}

const TokenCard: FC<Props> = ({ token }) => {
  return (
    <div className="bg-input-bg rounded-xl p-2 w-full">
      <p className="font-medium text-base">{token.tick.toUpperCase()}</p>
      <p>
        {t("components.token_card.balance")}: {token.balance}
      </p>
      <p>
        {t("components.token_card.transferable_balance")}:{" "}
        {token.transferable_balance}
      </p>
    </div>
  );
};

export default TokenCard;
