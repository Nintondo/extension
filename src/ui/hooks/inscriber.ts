import { ITransferToken } from "@/shared/interfaces/token";
import { inscribe } from "bells-inscriber";
import { useCallback } from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import toast from "react-hot-toast";
import { t } from "i18next";

export const useInscribeTransferToken = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));

  return useCallback(
    async (data: ITransferToken, feeRate: number) => {
      const utxos = await apiController.getUtxos(currentAccount.address);
      const hexes = [];
      for (const utxo of utxos) {
        hexes.push(await apiController.getTransactionHex(utxo.txid));
      }

      const txs = await inscribe({
        toAddress: currentAccount.address,
        fromAddress: currentAccount.address,
        data: Buffer.from(JSON.stringify(data)),
        feeRate,
        inputData: {
          utxos,
          hexes,
        },
        contentType: "application/json; charset=utf-8",
        publicKey: Buffer.from(
          await keyringController.exportPublicKey(currentAccount.address),
          "hex"
        ),
        signPsbtHex: keyringController.signAllInputs,
      });
      for (const i of txs) await apiController.pushTx(i);
      toast.success(t("inscriptions.transfer_inscribed"));
    },
    [apiController, currentAccount, keyringController]
  );
};
