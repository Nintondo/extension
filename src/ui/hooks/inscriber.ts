import { ITransferToken } from "@/shared/interfaces/token";
import { inscribe } from "bells-inscriber";
import { useControllersState } from "../states/controllerState";
import toast from "react-hot-toast";
import { t } from "i18next";
import { ss } from "../utils";
import { useAppState } from "../states/appState";
import { useGetCurrentAccount } from "../states/walletState";
import { ApiUTXO } from "bells-inscriber/lib/types";

export const useInscribeTransferToken = () => {
  const { apiController, keyringController } = useControllersState(
    ss(["apiController", "keyringController"])
  );
  const currentAccount = useGetCurrentAccount();
  const { network } = useAppState(ss(["network"]));

  const getUtxos = async (amount: number): Promise<ApiUTXO[]> => {
    return (
      (await apiController.getUtxos(currentAccount!.address!, {
        amount,
        hex: true,
      })) ?? []
    ).map((f) => ({
      ...f,
      hex: f.hex!,
    }));
  };

  return async (data: ITransferToken, feeRate: number) => {
    if (!currentAccount || !currentAccount.address) return;

    let txs: string[] | undefined;

    try {
      txs = await inscribe({
        toAddress: currentAccount.address,
        fromAddress: currentAccount.address,
        data: Buffer.from(JSON.stringify(data)),
        feeRate,
        contentType: "application/json; charset=utf-8",
        publicKey: Buffer.from(
          await keyringController.exportPublicKey(currentAccount.address),
          "hex"
        ),
        signPsbt: keyringController.signPsbtBase64,
        getUtxos,
        network,
      });
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
      throw e;
    }

    const txIds: string[] = [];
    try {
      for (const i of txs) {
        txIds.push((await apiController.pushTx(i))?.txid ?? "");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    if (!txIds.filter((f) => f.length !== 64 || f.includes("RPC error")).length)
      toast.success(t("inscriptions.transfer_inscribed"));
    else toast.error(t("inscriptions.failed_inscribe_transfer"));
  };
};
