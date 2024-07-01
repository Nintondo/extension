import { ITransferToken } from "@/shared/interfaces/token";
import { inscribe } from "bells-inscriber";
import { useCallback } from "react";
import { useGetCurrentAccount } from "../states/walletState";
import { useControllersState } from "../states/controllerState";
import toast from "react-hot-toast";
import { t } from "i18next";
import { gptFeeCalculate } from "../utils";
import { useAppState } from "../states/appState";
import { DEFAULT_SERVICE_FEE } from "@/shared/constant";

export const useInscribeTransferToken = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, keyringController } = useControllersState((v) => ({
    apiController: v.apiController,
    keyringController: v.keyringController,
  }));
  const { network } = useAppState((v) => ({ network: v.network }));

  return useCallback(
    async (data: ITransferToken, feeRate: number) => {
      const ORD_VALUE = 1000;
      const TX_COUNT = 2;
      if (!currentAccount || !currentAccount.address) return;
      const cost =
        ORD_VALUE * TX_COUNT +
        DEFAULT_SERVICE_FEE +
        gptFeeCalculate(2, 3, feeRate) +
        gptFeeCalculate(1, 2, feeRate);

      const utxos = await apiController.getUtxos(currentAccount.address, {
        amount: cost,
        hex: true,
      });
      if (!utxos || !utxos.length || typeof utxos === "string") {
        toast.error(t("inscriptions.not_enough_balance"));
        return;
      }

      const txs = await inscribe({
        toAddress: currentAccount.address,
        fromAddress: currentAccount.address,
        data: Buffer.from(JSON.stringify(data)),
        feeRate,
        utxos: utxos.map((f) => ({
          ...f,
          hex: f.hex!,
        })),
        contentType: "application/json; charset=utf-8",
        publicKey: Buffer.from(
          await keyringController.exportPublicKey(currentAccount.address),
          "hex"
        ),
        signPsbtHex: keyringController.signAllInputs,
        network,
      });

      const txIds: string[] = [];
      for (const i of txs) {
        txIds.push((await apiController.pushTx(i))?.txid ?? "");
      }
      if (
        !txIds.filter((f) => f.length !== 64 || f.includes("RPC error")).length
      )
        toast.success(t("inscriptions.transfer_inscribed"));
      else toast.error(t("inscriptions.failed_inscribe_transfer"));
    },
    [apiController, currentAccount, keyringController, network]
  );
};
