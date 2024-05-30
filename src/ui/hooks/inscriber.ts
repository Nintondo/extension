import { ITransferToken } from "@/shared/interfaces/token";
import {
  inscribe,
  prepareToInscribeMultipleInscriptions,
} from "bells-inscriber";
import { useCallback } from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import toast from "react-hot-toast";
import { t } from "i18next";
import { gptFeeCalculate } from "../utils";
import { ApiUTXO } from "@/shared/interfaces/api";

export const useInscribeTransferToken = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));

  const calculateSingleTransferCost = (feeRate: number) =>
    1000 * 2 +
    1000000 +
    gptFeeCalculate(2, 3, feeRate) +
    gptFeeCalculate(1, 2, feeRate);

  const processMultipleInscriptions = useCallback(
    async (
      count: number,
      singleTransferCost: number,
      utxos: any[],
      feeRate: number
    ) => {
      const hex = await prepareToInscribeMultipleInscriptions({
        address: currentAccount.address,
        amount: count,
        feeRate,
        signleInscriptionCost: singleTransferCost,
        signPsbtHex: keyringController.signAllInputs,
        utxos,
      });

      const { txid } = await apiController.pushTx(hex);
      if (txid.length !== 64 || txid.includes("RPC error")) {
        return toast.error(txid);
      }
      const createdUtxos = [];
      for (let i = 0; i < count; i++) {
        createdUtxos.push({
          txid,
          vout: i,
          value: singleTransferCost,
          hex,
          status: undefined,
        });
      }
      return createdUtxos;
    },
    [currentAccount.address, keyringController, apiController]
  );

  const inscribeSingleOrMultiple = useCallback(
    async (
      count: number,
      utxos: ApiUTXO[],
      feeRate: number,
      data: ITransferToken
    ) => {
      const txs: string[][] = [];
      for (let i = 0; i < count; i++) {
        const utxosToUse = count > 1 ? [utxos.shift()] : utxos;
        txs.push(
          await inscribe({
            toAddress: currentAccount.address,
            fromAddress: currentAccount.address,
            data: Buffer.from(JSON.stringify(data)),
            feeRate,
            utxos: utxosToUse as any,
            contentType: "application/json; charset=utf-8",
            publicKey: Buffer.from(
              await keyringController.exportPublicKey(currentAccount.address),
              "hex"
            ),
            signPsbtHex: keyringController.signAllInputs,
          })
        );
      }
      return txs;
    },
    [currentAccount.address, keyringController]
  );

  return useCallback(
    async (data: ITransferToken, feeRate: number, count: number) => {
      const singleTransferCost = calculateSingleTransferCost(feeRate);
      const cost = Math.floor(singleTransferCost * count);

      const utxos = await apiController.getUtxos(currentAccount.address, {
        amount: cost,
        hex: true,
      });
      if (!utxos || !utxos.length) {
        toast.error(t("inscriptions.not_enough_balance"));
        return;
      }

      if (
        count > 1 &&
        (utxos.filter((f) => f.value < singleTransferCost).length ||
          utxos.length < count)
      ) {
        const createdUtxos = await processMultipleInscriptions(
          count,
          singleTransferCost,
          utxos,
          feeRate
        );
        utxos.splice(0, utxos.length);
        utxos.push(...createdUtxos);
      }

      const txs = await inscribeSingleOrMultiple(count, utxos, feeRate, data);

      const unpushedHexes: string[] =
        JSON.parse(localStorage.getItem("topush")) ?? [];
      const txIds = (
        await Promise.all(
          txs.flatMap(async (i) => {
            const txids: string[] = [];
            for (const txhex of i) {
              const txid = (await apiController.pushTx(txhex)).txid ?? "";
              if (txid.length !== 64 || txid.includes("RPC error"))
                unpushedHexes.push(txhex);
              txids.push(txid);
            }
            return txids;
          })
        )
      ).flat();
      localStorage.setItem("topush", JSON.stringify(unpushedHexes));

      if (!txIds.some((id) => id.length !== 64 || id.includes("RPC error")))
        toast.success(t("inscriptions.transfer_inscribed"));
      else {
        toast.error(t("inscriptions.failed_inscribe_transfer2"));
        toast.error(t("inscriptions.failed_inscribe_transfer"));
      }
    },
    [
      apiController,
      currentAccount,
      inscribeSingleOrMultiple,
      processMultipleInscriptions,
    ]
  );
};
