import { Inscription } from "./inscriptions";

export interface IField {
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
