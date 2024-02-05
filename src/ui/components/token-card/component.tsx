import { IToken } from "@/shared/interfaces/token";
import { FC } from "react";

interface Props {
  token: IToken;
}

const TokenCard: FC<Props> = ({ token }) => {
  return <div>{token.content_type}</div>;
};

export default TokenCard;
