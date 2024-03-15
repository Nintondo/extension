import { Inscription } from "./inscriptions";

export interface IField {
  input: boolean;
  label: string;
  important: boolean;
  value: {
    text?: string;
    inscriptions?: Inscription[];
    value?: string;
  };
}

export interface LocationValue {
  [key: string]: number;
}
