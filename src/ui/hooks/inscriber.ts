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

export const useInscribeTransferToken = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));

  return useCallback(
    async (data: ITransferToken, feeRate: number, count: number) => {
      const signleTransferCost =
        1000 * 2 +
        1000000 +
        gptFeeCalculate(2, 3, feeRate) +
        gptFeeCalculate(1, 2, feeRate);
      const cost = Math.floor(signleTransferCost * count);

      const utxos = await apiController.getUtxos(currentAccount.address, {
        amount: cost,
        hex: true,
      });
      if (!utxos || !utxos.length) {
        toast.error(t("inscriptions.not_enough_balance"));
        return;
      }

      if (count > 1) {
        const hex = await prepareToInscribeMultipleInscriptions({
          address: currentAccount.address,
          amount: count,
          feeRate,
          signleInscriptionCost: signleTransferCost,
          signPsbtHex: keyringController.signAllInputs,
          utxos: utxos as any,
        });

        const { txid } = await apiController.pushTx(hex);
        if (txid.length !== 64 || txid.includes("RPC error")) {
          return toast.error(txid);
        }
        console.log(utxos);
        utxos.splice(0, utxos.length - 1);
        console.log(utxos);
        for (let i = 0; i < count; i++) {
          utxos.push({
            txid,
            vout: i,
            value: signleTransferCost,
            hex,
            status: undefined,
          });
        }
      }

      const txs: string[] = [];
      if (count > 1) {
        for (let i = 0; i < count; i++) {
          txs.push(
            ...(await inscribe({
              toAddress: currentAccount.address,
              fromAddress: currentAccount.address,
              data: Buffer.from(JSON.stringify(data)),
              feeRate,
              utxos: [].push(utxos.shift()) as any,
              contentType: "application/json; charset=utf-8",
              publicKey: Buffer.from(
                await keyringController.exportPublicKey(currentAccount.address),
                "hex"
              ),
              signPsbtHex: keyringController.signAllInputs,
            }))
          );
        }
      } else {
        txs.push(
          ...(await inscribe({
            toAddress: currentAccount.address,
            fromAddress: currentAccount.address,
            data: Buffer.from(JSON.stringify(data)),
            feeRate,
            utxos: utxos as any,
            contentType: "application/json; charset=utf-8",
            publicKey: Buffer.from(
              await keyringController.exportPublicKey(currentAccount.address),
              "hex"
            ),
            signPsbtHex: keyringController.signAllInputs,
          }))
        );
      }

      const txIds: string[] = [];
      for (const i of txs) {
        txIds.push((await apiController.pushTx(i)).txid ?? "");
      }
      if (!txIds.filter((f) => f.length !== 64).length)
        toast.success(t("inscriptions.transfer_inscribed"));
      else toast.error(t("inscriptions.failed_inscribe_transfer"));
    },
    [apiController, currentAccount, keyringController]
  );
};
