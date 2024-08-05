import {
  CONTENT_URL,
  HISTORY_URL,
  NINTONDO_API_URL,
  TESTNET_CONTENT_URL,
  TESTNET_HISTORY_URL,
  TESTNET_NINTONDO_API_URL,
} from "@/shared/constant";
import browser from "./browser";

export const t = (name: string) => browser.i18n.getMessage(name);

export const format = (str: string, ...args: any[]) => {
  return args.reduce((m, n) => m.replace("_s_", n), str);
};

export interface fetchProps extends RequestInit {
  method?: "POST" | "GET" | "PUT" | "DELETE";
  headers?: HeadersInit;
  path: string;
  params?: Record<string, string>;
  error?: boolean;
  json?: boolean;
  testnet: boolean;
  service: "electrs" | "content" | "history";
}

const getBaseUrl = (service: fetchProps["service"], testnet: boolean) => {
  switch (service) {
    case "electrs":
      return testnet ? TESTNET_NINTONDO_API_URL : NINTONDO_API_URL;
    case "content":
      return testnet ? TESTNET_CONTENT_URL : CONTENT_URL;
    case "history":
      return testnet ? TESTNET_HISTORY_URL : HISTORY_URL;
  }
};

export const customFetch = async <T>({
  path,
  json = true,
  testnet,
  service,
  ...props
}: fetchProps): Promise<T | undefined> => {
  const url = `${getBaseUrl(service, testnet)}${path}`;
  const params = props.params
    ? Object.entries(props.params)
        .map((k) => `${k[0]}=${k[1]}`)
        .join("&")
    : "";
  const res = await fetch(
    `${url.toString()}${Number(params.length) > 0 ? "?" : ""}${params ?? ""}`,
    { ...props, cache: "no-store" }
  );

  if (!res.ok) return;
  if (!json) return (await res.text()) as T;

  return await res.json();
};

export const excludeKeysFromObj = <
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  keysToExtract: K[]
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keysToExtract.includes(k as K))
  ) as Omit<T, K>;
};

export const pickKeysFromObj = <
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  keysToPick: K[]
): Pick<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => keysToPick.includes(k as K))
  ) as Pick<T, K>;
};

export const parseLocation = (
  location: string
): {
  txid: string;
  vout: number;
  offset: number;
} => {
  const parts = location.split("i");
  const offset = parts[parts.length - 1];
  parts.pop();

  const vout = parts[parts.length - 1];
  parts.pop();
  return {
    txid: parts.join(""),
    vout: Number(vout),
    offset: Number(offset),
  };
};
