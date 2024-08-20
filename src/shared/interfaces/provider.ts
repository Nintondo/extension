export interface IField {
  input: boolean;
  label: string;
  important: boolean;
  value: IFieldValue;
}

export interface IFieldValue {
  text?: string;
  inscriptions?: string[];
  value?: string;
  anyonecanpay?: boolean;
}

export interface LocationValue {
  [key: string]: number;
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
