import { Network, networks } from "belcoinjs-lib";
import { Dispatch, SetStateAction, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const isNotification = (): boolean => {
  return window.location.pathname.includes("notification.html");
};

export const normalizeAmount = (value: string) => {
  if (!value.length) return "";
  if (value.includes(".")) {
    if (value.split(".")[1].length > 8) {
      return value.split(".")[0] + `.${value.split(".")[1].slice(0, 8)}`;
    }
  }
  return value;
};

export function gptFeeCalculate(
  inputCount: number,
  outputCount: number,
  feeRate: number
) {
  // Constants defining the weight of each component of a transaction
  const BASE_TX_WEIGHT = 10 * 4; // 10 vbytes * 4 weight units per vbyte
  const INPUT_WEIGHT = 148 * 4; // 148 vbytes * 4 weight units per vbyte for each input
  const OUTPUT_WEIGHT = 34 * 4; // 34 vbytes * 4 weight units per vbyte for each output

  // Calculate the weight of the transaction
  const transactionWeight =
    BASE_TX_WEIGHT + inputCount * INPUT_WEIGHT + outputCount * OUTPUT_WEIGHT;

  // Calculate the fee by multiplying transaction weight by fee rate (satoshis per weight unit)
  const fee = Math.ceil((transactionWeight / 4) * feeRate);

  return fee;
}

export function calcBalanceLength(balance: number) {
  return balance.toFixed(
    balance.toFixed(0).toString().length >= 4
      ? 8 - balance.toFixed(0)?.toString().length < 0
        ? 0
        : 8 - balance.toFixed(0)?.toString().length
      : 8
  );
}

export function isTestnet(network: Network) {
  return (
    network.pubKeyHash === networks.testnet.pubKeyHash &&
    network.scriptHash === networks.testnet.scriptHash
  );
}

export function ss<T extends Record<string, any>, K extends keyof T = keyof T>(
  keys: K[]
) {
  return useShallow((state: T) => {
    return Object.fromEntries(keys.map((i) => [i, state[i]])) as Pick<T, K>;
  });
}

export const useUpdateFunction = <T>(
  onUpdate: Dispatch<SetStateAction<T[] | undefined>>,
  retrieveFn: (address: string) => Promise<T[] | undefined>,
  compareKey: keyof T
) => {
  return useCallback(
    async (address: string, force = false) => {
      const receivedItems = await retrieveFn(address);
      if (receivedItems === undefined) return;

      onUpdate((prev) => {
        if ((prev?.length ?? 0) < 50 || force) return receivedItems;

        const currentItemsKeys = new Set(prev!.map((f) => f[compareKey]));
        const receivedItemsKeys = new Set(
          receivedItems.map((f) => f[compareKey])
        );
        const intersection = currentItemsKeys.intersection(receivedItemsKeys);
        const difference = currentItemsKeys.difference(receivedItemsKeys);

        return [
          ...receivedItems.filter((f) => difference.has(f[compareKey])),
          ...prev!,
        ].map((i) => {
          if (intersection.has(i[compareKey])) {
            return receivedItems.find((f) => f[compareKey] === i[compareKey])!;
          } else {
            return i;
          }
        });
      });
    },
    [onUpdate, retrieveFn, compareKey]
  );
};

export function isValidTXID(txid: string | undefined): boolean {
  if (typeof txid === "undefined") return false;
  const regex = /^[a-fA-F0-9]{64}$/;
  return regex.test(txid);
}
