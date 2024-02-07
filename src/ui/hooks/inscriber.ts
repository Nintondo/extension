import { ITransferToken } from "@/shared/interfaces/token";
import { inscribe } from "bells-inscriber";
import { useCallback } from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";

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
          await keyringController.exportPublicKey(currentAccount.address)
        ),
        signPsbtHex: keyringController.signTransaction,
      });

      return txs;
    },
    [apiController, currentAccount, keyringController]
  );
};
