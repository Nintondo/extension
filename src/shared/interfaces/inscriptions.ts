export interface Inscription {
  id?: string;
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
  id: "a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29i0",
  address: "B7aGzxoUHgia1y8vRVP4EbaHkBNaasQieg",
  outputValue: 100000,
  preview:
    "https://bellinals.nintondo.io/preview/a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29i0",
  content:
    "https://bellinals.nintondo.io/content/a33eddbfb700301038f2e25d34cbe2b55c1602d4138967f37759c9227d6d0b29i0",
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
};
