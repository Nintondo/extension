import { useGetCurrentAccount, useWalletState } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import { satoshisToAmount } from "@/shared/utils/transactions";
import { Psbt, Transaction } from "belcoinjs-lib";
import type { Hex } from "@/background/services/keyring/types";
import { t } from "i18next";
import { Inscription, OrdUTXO } from "@/shared/interfaces/inscriptions";
import { ITransfer } from "@/shared/interfaces/token";
import toast from "react-hot-toast";
import { gptFeeCalculate, ss } from "../utils";
import { useAppState } from "../states/appState";

export function useCreateBellsTxCallback() {
  const { selectedAccount, selectedWallet } = useWalletState(
    ss(["selectedAccount", "selectedWallet"])
  );
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState(
    ss(["apiController", "keyringController"])
  );
  const { network } = useAppState(ss(["network"]));

  return async (
    toAddress: Hex,
    toAmount: number,
    feeRate: number,
    receiverToPayFee = false
  ): Promise<{ rawtx: string; fee: number } | undefined> => {
    if (
      selectedWallet === undefined ||
      selectedAccount === undefined ||
      currentAccount === undefined ||
      currentAccount.address === undefined
    )
      throw new Error("Failed to get current wallet or account");
    const fromAddress = currentAccount.address;

    let fee = gptFeeCalculate(2, 2, feeRate);

    let utxos = await apiController.getUtxos(fromAddress, {
      amount: toAmount + (receiverToPayFee ? 0 : fee),
    });

    if ((utxos?.length ?? 0) > 5 && !receiverToPayFee) {
      fee = gptFeeCalculate(utxos!.length, 2, feeRate);
      utxos = await apiController.getUtxos(fromAddress, {
        amount: toAmount + fee,
      });
    }

    if (!Array.isArray(utxos)) {
      toast.error(t("send.create_send.not_enough_money_error"));
      return;
    }

    if (utxos.length > 500) {
      throw new Error(t("hooks.transaction.too_many_utxos"));
    }

    const safeBalance = utxos.reduce((pre, cur) => pre + cur.value, 0);

    if (receiverToPayFee && fee < toAmount) {
      toast.error(t("send.create_send.fee_exceeds_amount_error"));
      return;
    }

    if (safeBalance < toAmount + fee) {
      throw new Error(
        `${t("hooks.transaction.insufficient_balance_0")} (${satoshisToAmount(
          safeBalance
        )} ${t("hooks.transaction.insufficient_balance_1")} ${satoshisToAmount(
          toAmount
        )} ${t("hooks.transaction.insufficient_balance_2")}`
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
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex();
    return {
      rawtx,
      fee: psbt.getFee(),
    };
  };
}

export function useCreateOrdTx() {
  const { selectedAccount, selectedWallet } = useWalletState(
    ss(["selectedAccount", "selectedWallet"])
  );
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState(
    ss(["apiController", "keyringController"])
  );
  const { network } = useAppState(ss(["network"]));

  return async (toAddress: Hex, feeRate: number, inscription: Inscription) => {
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
    const tx = psbt.extractTransaction(true);
    const rawtx = tx.toHex();
    return {
      rawtx,
      fee: psbt.getFee(),
    };
  };
}

export const useSendTransferTokens = () => {
  const { apiController, keyringController } = useControllersState(
    ss(["apiController", "keyringController"])
  );
  const currentAccount = useGetCurrentAccount();
  const { network } = useAppState(ss(["network"]));

  return async (toAddress: string, txIds: ITransfer[], feeRate: number) => {
    if (!currentAccount || !currentAccount.address) return;
    const fee = gptFeeCalculate(txIds.length + 1, txIds.length + 1, feeRate);
    const utxos = await apiController.getUtxos(currentAccount.address, {
      amount: fee,
      hex: true,
    });
    if (!utxos) return;
    const inscriptions: OrdUTXO[] = [];
    for (const transferToken of txIds) {
      const hex = await apiController.getTransactionHex(
        transferToken.inscription_id.split("i")[0]
      );
      if (!hex) return;
      const tx = Transaction.fromHex(hex);
      const vout = Number(transferToken.inscription_id.split("i")[1]);

      inscriptions.push({
        inscription_id: transferToken.inscription_id,
        offset: 0,
        txid: tx.getId(),
        value: tx.outs[vout].value,
        vout,
        hex,
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
    if (result.txid !== undefined)
      toast.success(t("inscriptions.success_send_transfer"));
    else
      toast.error(
        t("inscriptions.failed_send_transfer") + `\n ${result.error}`
      );
  };
};

export function usePushBellsTxCallback() {
  const { apiController } = useControllersState(ss(["apiController"]));

  return async (rawtx: string) => {
    try {
      return await apiController.pushTx(rawtx);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes("too-long-mempool-chain")) {
          toast.error(t("hooks.transaction.too_long_mempool_chain"));
        } else {
          toast.error(e.message);
        }
      }
    }
  };
}
