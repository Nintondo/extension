import { useCallback } from "react";
import { useGetCurrentAccount, useWalletState } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import { tidoshisToAmount } from "@/shared/utils/transactions";
import { Psbt } from "belcoinjs-lib";
import type { Hex } from "@/background/services/keyring/types";
import { t } from "i18next";
import { Inscription } from "@/shared/interfaces/inscriptions";
import { ITransfer } from "@/shared/interfaces/token";
import toast from "react-hot-toast";
import { gptFeeCalculate } from "../utils";
import { useAppState } from "../states/appState";

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
  const { network } = useAppState((v) => ({ network: v.network }));

  return useCallback(
    async (
      toAddress: Hex,
      toAmount: number,
      feeRate: number,
      receiverToPayFee = false
    ) => {
      if (
        selectedWallet === undefined ||
        selectedAccount === undefined ||
        currentAccount === undefined ||
        currentAccount.address === undefined
      )
        throw new Error("Failed to get current wallet or account");
      const fromAddress = currentAccount.address;
      const utxos = await apiController.getUtxos(fromAddress, {
        amount: toAmount,
      });
      if (!utxos) return;
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
        network,
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
      network,
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
  const { network } = useAppState((v) => ({ network: v.network }));

  return useCallback(
    async (toAddress: Hex, feeRate: number, inscription: Inscription) => {
      if (
        selectedWallet === undefined ||
        selectedAccount === undefined ||
        currentAccount === undefined ||
        currentAccount.address === undefined
      )
        throw new Error("Failed to get current wallet or account");
      const fromAddress = currentAccount?.address;
      const utxos = await apiController.getUtxos(fromAddress, {
        amount: gptFeeCalculate(3, 2, feeRate),
      });
      if (!utxos) return;

      const psbtHex = await keyringController.sendOrd({
        to: toAddress,
        utxos: [...utxos, { ...inscription, isOrd: true }],
        receiverToPayFee: false,
        feeRate,
        network,
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
      network,
    ]
  );
}

export const useSendTransferTokens = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));
  const { network } = useAppState((v) => ({
    network: v.network,
  }));

  return useCallback(
    async (toAddress: string, txIds: ITransfer[], feeRate: number) => {
      if (!currentAccount || !currentAccount.address) return;
      const fee = gptFeeCalculate(1, txIds.length + 1, feeRate);
      const utxos = await apiController.getUtxos(currentAccount.address, {
        amount: fee,
        hex: true,
      });
      if (!utxos) return;
      const inscriptions: Inscription[] = [];
      for (const transferToken of txIds) {
        const foundInscriptons = await apiController.getInscription({
          inscriptionId: transferToken.inscription_id,
          address: currentAccount.address,
        });
        if (!foundInscriptons) return;
        const txid = foundInscriptons[0].txid;
        inscriptions.push({
          ...foundInscriptons[0],
          hex: await apiController.getTransactionHex(txid),
        });
      }
      const tx = await keyringController.createSendMultiOrd(
        toAddress,
        feeRate,
        inscriptions,
        utxos as any,
        network
      );
      const result = await apiController.pushTx(tx);
      if (result?.txid !== undefined)
        toast.success(t("inscriptions.success_send_transfer"));
      else toast.error(t("inscriptions.failed_send_transfer"));
    },
    [apiController, currentAccount, keyringController, network]
  );
};

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
