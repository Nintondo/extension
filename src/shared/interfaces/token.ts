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
  amt: number;
}

export interface IToken {
  tick: string;
  balance: number;
  transferable_balance: number;
}
