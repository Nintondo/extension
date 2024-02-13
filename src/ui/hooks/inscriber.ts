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
      for (const utxo of utxos) {
        utxo.rawHex = await apiController.getTransactionHex(utxo.txid);
      }

      const txs = await inscribe({
        toAddress: currentAccount.address,
        fromAddress: currentAccount.address,
        data: Buffer.from(JSON.stringify(data)),
        feeRate,
        utxos: utxos as unknown as any,
        contentType: "application/json; charset=utf-8",
        publicKey: Buffer.from(
          await keyringController.exportPublicKey(currentAccount.address),
          "hex"
        ),
        signPsbtHex: keyringController.signAllInputs,
      });
      for (const i of txs) {
        const result = await apiController.pushTx(i);
        if (result?.txid !== undefined)
          toast.success(t("inscriptions.transfer_inscribed"));
        else toast.error(t("inscriptions.failed_inscribe_transfer"));
      }
    },
    [apiController, currentAccount, keyringController]
  );
};
