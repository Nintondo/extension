// export interface ITokenData {
//   p: string;
//   op: string;
//   tick: string;
//   max?: number;
//   lim?: number;
//   amt?: number;
// }

export interface ITransferToken {
  p: "bel-20";
  op: "transfer";
  tick: string;
  amt: string;
}

export interface ITransfer {
  inscription_id: string;
  amount: string;
}

export interface IToken {
  tick: string;
  balance: string;
  transferable_balance: string;
  transfers: ITransfer[];
  transfers_count: number;
}
