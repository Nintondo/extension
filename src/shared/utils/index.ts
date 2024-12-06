import { Network } from "belcoinjs-lib";
import browser from "./browser";
import { getApiUrl, getContentUrl, getHistoryUrl } from "../constant";

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
  network: Network;
  service: "electrs" | "content" | "history";
}

const getBaseUrl = (service: fetchProps["service"], testnet: Network) => {
  switch (service) {
    case "electrs":
      return getApiUrl(testnet);
    case "content":
      return getContentUrl(testnet);
    case "history":
      return getHistoryUrl(testnet);
  }
};

export const customFetch = async <T>({
  path,
  json = true,
  network,
  service,
  ...props
}: fetchProps): Promise<T | undefined> => {
  const url = `${getBaseUrl(service, network)}${path}`;
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
  const [txid, vout, offset] = location.split("i");

  return {
    txid,
    vout: Number(vout),
    offset: Number(offset),
  };
};
