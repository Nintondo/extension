import { ApiUTXO } from "./api";

export interface ApiOrdUTXO extends ApiUTXO {
  content_type: string;
  content_length: number;
  inscription_id: string;
  inscription_number: number;
  offset: number;
  owner: string;
  rawTx?: string;
}

export interface Inscription extends ApiOrdUTXO {
  preview: string;
  content: string;
  offset: 0;
}

export interface CompletedInscription extends Inscription {
  genesis: string;
  outpoint: string;
}

export const TestInscription: Inscription = {
  inscription_id:
    "a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  owner: "BPAiWMThT2ZwhkyoG27poU1HVNmKsRk7K4",
  inscription_number: 1,
  value: 100000,
  preview:
    "https://bellinals.nintondo.io/preview/a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  content:
    "https://bellinals.nintondo.io/content/a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  content_length: 694,
  content_type: "image/png",
  // genesis: "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29",
  // outpoint:
  //   "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29:0:0",
  offset: 0,
  txid: "",
  vout: 0,
  status: {
    block_height: 22490,
    block_hash: "",
    block_time: 1724142142,
    confirmed: true,
  },
};
