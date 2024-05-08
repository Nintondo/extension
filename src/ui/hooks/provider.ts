import { useNavigate } from "react-router-dom";
import { useControllersState } from "../states/controllerState";
import { useCallback, useEffect } from "react";
import { isNotification } from "../utils";
import {
  IField,
  IFieldValue,
  LocationValue,
  SignPsbtOptions,
} from "@/shared/interfaces/provider";
import { Psbt } from "belcoinjs-lib";
import { useGetCurrentAccount } from "../states/walletState";
import { toFixed } from "@/shared/utils/transactions";

export const useApproval = () => {
  const navigate = useNavigate();
  const { notificationController } = useControllersState((v) => ({
    notificationController: v.notificationController,
  }));

  const resolveApproval = async (
    data?: any,
    stay = false,
    forceReject = false
  ) => {
    const approval = await notificationController.getApproval();

    if (approval) {
      await notificationController.resolveApproval(data, forceReject);
    }
    if (stay) {
      return;
    }
    setTimeout(() => {
      navigate("/");
    });
  };

  const rejectApproval = useCallback(
    async (
      err?: string,
      stay: boolean = false,
      isInternal: boolean = false
    ) => {
      const approval = await notificationController.getApproval();
      if (approval) {
        await notificationController.rejectApproval(err, stay, isInternal);
      }
      if (!stay) {
        navigate("/");
      }
    },
    [notificationController, navigate]
  );

  useEffect(() => {
    if (!isNotification()) {
      return;
    }
    window.addEventListener("beforeunload", rejectApproval as any);

    return () =>
      window.removeEventListener("beforeunload", rejectApproval as any);
  }, [rejectApproval]);

  return [notificationController, resolveApproval, rejectApproval] as const;
};

export const useDecodePsbtInputs = () => {
  const currentAccount = useGetCurrentAccount();
  const { apiController, notificationController } = useControllersState(
    (v) => ({
      apiController: v.apiController,
      notificationController: v.notificationController,
    })
  );

  return useCallback(async (): Promise<
    { fields: IField[][]; fee: number } | undefined
  > => {
    const approval = await notificationController.getApproval();
    const psbtsToApprove: Psbt[] = [];
    const result: IField[][] = [];
    if (approval.approvalComponent !== "multiPsbtSign") {
      psbtsToApprove.push(Psbt.fromBase64(approval.params.data.psbtBase64));
    } else {
      for (const psbtBase64 of approval.params.data.data) {
        psbtsToApprove.push(Psbt.fromBase64(psbtBase64.psbtBase64));
      }
    }

    let totalInputValue = 0;
    let totalOutputValue = 0;

    for (const psbt of psbtsToApprove) {
      const inputFields: IField[] = [];
      const outputFields: IField[] = [];
      const inputLocations = psbt.txInputs.map(
        (f) => f.hash.reverse().toString("hex") + ":" + f.index
      );
      const inputValues = await apiController.getUtxoValues(inputLocations);
      const locationValue: LocationValue = Object.fromEntries(
        inputLocations.map((f, i) => [f, inputValues[i]])
      );

      psbt.txOutputs.forEach((f, i) => {
        totalOutputValue += f.value / 10 ** 8;
        outputFields.push({
          important: currentAccount?.address === f.address,
          input: false,
          label: `Output #${i}`,
          value: {
            text: `${f.address}`,
            value: `${toFixed(f.value / 10 ** 8)} BEL`,
          },
        });
      });

      for (const [i, txInput] of psbt.txInputs.entries()) {
        const outpoint =
          txInput.hash.reverse().toString("hex") + ":" + txInput.index;
        const isImportant = (
          approval.params.data as { options?: SignPsbtOptions }
        ).options?.toSignInputs
          ?.map((f) => f.index)
          .includes(i);

        let value: IFieldValue;
        const inputValue = locationValue[outpoint] / 10 ** 8;
        if (isImportant) totalInputValue += inputValue;

        if (psbt.data.inputs[i].sighashType === 131) {
          const foundInscriptions = await apiController.getInscription({
            address: currentAccount.address,
            inscriptionId: outpoint.slice(0, -2) + "i" + txInput.index,
          });

          if (foundInscriptions.length) {
            value = {
              anyonecanpay: true,
              inscriptions: foundInscriptions,
              value: `${toFixed(inputValue)} BEL`,
            };
          } else {
            value = {
              anyonecanpay: true,
              text: `${outpoint.slice(0, -2)}`,
              value: `${toFixed(inputValue)} BEL`,
            };
          }
        } else {
          value = {
            text: `${outpoint.slice(0, -2)}`,
            value: `${toFixed(inputValue)} BEL`,
          };
        }

        inputFields.push({
          important: isImportant,
          input: true,
          label: `Input #${i}`,
          value,
        });
      }
      result.push(inputFields.concat(outputFields));
    }

    const fee = totalInputValue - totalOutputValue;
    return { fields: result, fee: fee < 0 ? 0 : fee };
  }, [notificationController, apiController, currentAccount]);
};
