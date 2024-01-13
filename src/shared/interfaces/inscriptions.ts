import { ApiUTXO } from "./api";

export interface Inscription extends ApiUTXO {
  inscription_id?: string;
  address?: string;
  outputValue?: number;
  preview?: string;
  content?: string;
  contentLength?: number;
  contentType?: "image/png";
  timeStamp?: string;
  genesisHeight?: number;
  genesisFee?: number;
  genesisTransaction?: string;
  location?: string;
  output?: string;
  offset?: number;
}

export const TestInscription: Inscription = {
  inscription_id:
    "a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  address: "BPAiWMThT2ZwhkyoG27poU1HVNmKsRk7K4",
  outputValue: 100000,
  preview:
    "https://bellinals.nintondo.io/preview/a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  content:
    "https://bellinals.nintondo.io/content/a77d282813922a140cee709d5afe644d8836d430fc1ac2c824fbbe282d661944i0",
  contentLength: 694,
  contentType: "image/png",
  timeStamp: "2023-12-25 22:20:50 UTC",
  genesisHeight: 22490,
  genesisFee: 34200,
  genesisTransaction:
    "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29",
  location:
    "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29:0:0",
  output: "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29:0",
  offset: 0,
  txid: "",
  vout: 0,
  status: undefined,
  value: 0,
};

export interface ApiOrdUtxo extends ApiUTXO {
  inscription_id: string;
  content_type: string;
  content_length: number;
  outpoint: string;
  genesis: string;
}
