import { Inscription } from "./inscriptions";

export interface IField {
  input: boolean;
  label: string;
  value: {
    text?: string;
    inscriptions?: Inscription[];
    value?: string;
  };
}

export interface LocationValue {
  [key: string]: number;
}
