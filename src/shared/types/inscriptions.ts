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

export interface OrdUTXO {
  txid: string;
  value: number;
  hex: string;
  vout: number;
  inscription_id: string;
  offset: number;
}

export interface Inscription extends ApiOrdUTXO {
  preview: string;
  content: string;
  offset: number;
}

export interface CompletedInscription extends Inscription {
  genesis: string;
  outpoint: string;
}

export interface ContentInscriptionResopnse {
  pages: number;
  count: number;
  inscriptions: ContentInscription[];
}

export interface ContentInscription {
  number: number;
  id: string;
  file_type: string;
  created: number;
}

export interface ContentDetailedInscription {
  number: number;
  id: string;
  file_type: string;
  mime: string;
  file_size: number;
  created: number;
  creation_block: number;
  invalid_token_reason: any;
}

export interface FindInscriptionsByOutpointResponseItem {
  number: number;
  owner: string;
  height: number;
  genesis: string;
}
