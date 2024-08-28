import type { ITransaction } from "@/shared/interfaces/api";
import { payments } from "belcoinjs-lib";
import { AddressType } from "bellhdw/src/hd/types";

export const getTransactionValue = (
  transaction: ITransaction,
  targetAddress: string,
  fixed: number = 2
) => {
  const outputsSum = transaction.vout
    .filter((i) => i.scriptpubkey_address === targetAddress)
    .reduce((acc, cur) => acc + cur.value, 0);
  const inputsSum = transaction.vin
    .filter((i) => i.prevout?.scriptpubkey_address === targetAddress)
    .reduce((acc, cur) => acc + cur.prevout!.value, 0);

  const value = Math.abs(outputsSum - inputsSum) / 10 ** 8;

  if (value < 1) return parseFloat(value.toFixed(5)).toString();
  if (value < 100) {
    return value.toFixed(fixed + 1);
  }
  return value.toFixed(fixed);
};

export const isIncomeTx = (
  transaction: ITransaction,
  targetAddress: string
) => {
  const outputsSum = transaction.vout
    .filter((i) => i.scriptpubkey_address === targetAddress)
    .reduce((acc, cur) => acc + cur.value, 0);
  const inputsSum = transaction.vin
    .filter((i) => i.prevout?.scriptpubkey_address === targetAddress)
    .reduce((acc, cur) => acc + cur.prevout!.value, 0);
  return outputsSum - inputsSum > 0;
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

export function satoshisToAmount(val: number) {
  return parseFloat((val / 10 ** 8).toFixed(8));
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
