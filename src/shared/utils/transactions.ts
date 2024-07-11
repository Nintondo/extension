import type { ITransaction } from "@/shared/interfaces/api";
import { payments } from "belcoinjs-lib";
import Big from "big.js";
import { AddressType } from "bellhdw/src/hd/types";

export enum TxDirection {
  out = 0,
  in = 1,
}

export const getTxDirection = (
  transaction: ITransaction,
  targetAddress: string
): TxDirection => {
  const includesIn = transaction.vin
    .map((i) => i.prevout?.scriptpubkey_address)
    .includes(targetAddress);

  if (includesIn) {
    return TxDirection.out;
  }
  return TxDirection.in;
};

export const getTransactionValue = (
  transaction: ITransaction,
  targetAddress: string,
  fixed: number = 2
) => {
  const direction = getTxDirection(transaction, targetAddress);
  let value: number;
  switch (direction) {
    case TxDirection.in:
      value =
        transaction.vout.reduce(
          (acc, cur) =>
            cur.scriptpubkey_address === targetAddress ? acc + cur.value : acc,
          0
        ) /
        10 ** 8;
      break;
    case TxDirection.out:
      value =
        (transaction.vin.reduce(
          (acc, cur) =>
            cur.prevout?.scriptpubkey_address === targetAddress
              ? acc - cur.prevout?.value
              : acc,
          0
        ) +
          transaction.vout.reduce(
            (acc, cur) =>
              cur.scriptpubkey_address === targetAddress
                ? cur.value + acc
                : acc,
            0
          )) /
        10 ** 8;
      break;
  }

  // return value;

  if (typeof fixed !== "undefined") {
    if (value < 100) {
      return Math.abs(value).toFixed(fixed + 1);
    }
    return Math.abs(value).toFixed(fixed);
  }

  return Math.abs(value);
};

export const isIncomeTx = (
  transaction: ITransaction,
  targetAddress: string
) => {
  const direction = getTxDirection(transaction, targetAddress);
  return direction === TxDirection.in;
};

export const getScriptForAddress = (
  publicKey: Uint8Array,
  addressType: AddressType
) => {
  switch (addressType) {
    case AddressType.P2WPKH:
      return payments.p2wpkh({ pubkey: Buffer.from(publicKey) }).output;
    case AddressType.P2SH_P2WPKH:
      return payments.p2sh({
        redeem: payments.p2wpkh({ pubkey: Buffer.from(publicKey) }),
      }).output;
    case AddressType.P2PKH:
      return payments.p2pkh({ pubkey: Buffer.from(publicKey) }).output;
    case AddressType.P2TR:
      return payments.p2tr({
        internalPubkey: toXOnly(Buffer.from(publicKey)),
      }).output;
    default:
      throw new Error("Invalid AddressType");
  }
};

export const getRoundedPrice = (value: number) => {
  const strValue = String(value);
  if (strValue.length > 20) {
    if (strValue.split(".")[1].length > 2) {
      return Number(value.toFixed(2));
    }
    return Number(value.toFixed(0));
  }
  return value;
};

export function shortAddress(address?: string, len = 5) {
  if (!address) return "";
  if (address.length <= len * 2) return address;
  return address.slice(0, len) + "..." + address.slice(address.length - len);
}

export const satoshisToBTC = (amount: number) => {
  return amount / 100_000_000;
};

export function tidoshisToAmount(val: number) {
  const num = new Big(val);
  return num.div(100_000_000).toFixed(8);
}

export function toFixed(x: number): string {
  if (Math.abs(x) < 1.0) {
    const e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      return "0." + "0".repeat(e) + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += parseFloat("0." + "0".repeat(e));
    }
  }
  return x.toString();
}

export const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
