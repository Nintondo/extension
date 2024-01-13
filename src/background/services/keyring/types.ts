import type { ApiUTXO } from "@/shared/interfaces/api";

export type Json = any;
export type Hex = string;

export type Eip1024EncryptedData = {
  version: string;
  nonce: string;
  ephemPublicKey: string;
  ciphertext: string;
};

interface SendBase {
  to: string;
  amount: number;
  receiverToPayFee: boolean;
  feeRate: number;
}

export interface SendBEL extends SendBase {
  utxos: ApiUTXO[];
}

export interface SendOrd extends SendBase {
  utxos: (ApiUTXO & { isOrd?: boolean })[];
}

interface BaseUserToSignInput {
  index: number;
  sighashTypes: number[] | undefined;
  disableTweakSigner?: boolean;
}

export interface AddressUserToSignInput extends BaseUserToSignInput {
  address: string;
}

export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
  publicKey: string;
}

export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;

export interface SignPsbtOptions {
  autoFinalized: boolean;
  toSignInputs?: UserToSignInput[];
}

export interface ToSignInput {
  index: number;
  publicKey: string;
  sighashTypes?: number[];
}
