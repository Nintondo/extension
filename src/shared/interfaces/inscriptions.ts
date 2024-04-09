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
