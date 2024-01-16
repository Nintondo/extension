import { useCallback } from "react";
import { useGetCurrentAccount, useWalletState } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import { tidoshisToAmount } from "@/shared/utils/transactions";
import { Psbt } from "belcoinjs-lib";
import type { Hex } from "@/background/services/keyring/types";
import { t } from "i18next";
import { Inscription } from "@/shared/interfaces/inscriptions";

export function useCreateBellsTxCallback() {
  const currentAccount = useGetCurrentAccount();
  const { selectedAccount, selectedWallet } = useWalletState((v) => ({
    selectedAccount: v.selectedAccount,
    selectedWallet: v.selectedWallet,
  }));
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));

  return useCallback(
    async (
      toAddress: Hex,
      toAmount: number,
      feeRate: number,
      receiverToPayFee = false
    ) => {
      if (selectedWallet === undefined || selectedAccount === undefined)
        throw new Error("Failed to get current wallet or account");
      const fromAddress = currentAccount?.address;
      const utxos = await apiController.getUtxos(fromAddress);
      const safeBalance = (utxos ?? []).reduce(
        (pre, cur) => pre + cur.value,
        0
      );
      if (safeBalance < toAmount) {
        throw new Error(
          `${t("hooks.transaction.insufficient_balance_0")} (${tidoshisToAmount(
            safeBalance
          )} ${t(
            "hooks.transaction.insufficient_balance_1"
          )} ${tidoshisToAmount(toAmount)} ${t(
            "hooks.transaction.insufficient_balance_2"
          )}`
        );
      }

      const psbtHex = await keyringController.sendBEL({
        to: toAddress,
        amount: toAmount,
        utxos,
        receiverToPayFee,
        feeRate,
      });
      const psbt = Psbt.fromHex(psbtHex);
      const tx = psbt.extractTransaction();
      const rawtx = tx.toHex();
      return {
        rawtx,
        fee: psbt.getFee(),
      };
    },
    [
      apiController,
      currentAccount,
      selectedAccount,
      selectedWallet,
      keyringController,
    ]
  );
}

export function useCreateOrdTx() {
  const currentAccount = useGetCurrentAccount();
  const { selectedAccount, selectedWallet } = useWalletState((v) => ({
    selectedAccount: v.selectedAccount,
    selectedWallet: v.selectedWallet,
  }));
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));

  return useCallback(
    async (toAddress: Hex, feeRate: number, inscription: Inscription) => {
      if (selectedWallet === undefined || selectedAccount === undefined)
        throw new Error("Failed to get current wallet or account");
      const fromAddress = currentAccount?.address;
      const utxos = await apiController.getUtxos(fromAddress);

      const psbtHex = await keyringController.sendOrd({
        to: toAddress,
        utxos: [...utxos, { ...inscription, isOrd: true }],
        receiverToPayFee: false,
        feeRate,
      });
      const psbt = Psbt.fromHex(psbtHex);
      const tx = psbt.extractTransaction();
      const rawtx = tx.toHex();
      return {
        rawtx,
        fee: psbt.getFee(),
      };
    },
    [
      apiController,
      currentAccount,
      selectedAccount,
      selectedWallet,
      keyringController,
    ]
  );
}

export function usePushBellsTxCallback() {
  const { apiController } = useControllersState((v) => ({
    apiController: v.apiController,
  }));

  return useCallback(
    async (rawtx: string) => {
      try {
        const txid = await apiController.pushTx(rawtx);
        return txid;
      } catch (e) {
        console.error(e);
      }
    },
    [apiController]
  );
}
