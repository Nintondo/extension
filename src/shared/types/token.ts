// export interface ITokenData {
//   p: string;
//   op: string;
//   tick: string;
//   max?: number;
//   lim?: number;
//   amt?: number;
// }

export interface TransferToken {
  p: "bel-20";
  op: "transfer";
  tick: string;
  amt: string;
}

export interface Transfer {
  inscription_id: string;
  amount: number;
}

export interface Token {
  tick: string;
  balance: number;
  transferable_balance: number;
  transfers: Transfer[];
  transfers_count: number;
}
