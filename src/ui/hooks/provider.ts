import { useNavigate } from "react-router-dom";
import { useControllersState } from "../states/controllerState";
import { useCallback, useEffect } from "react";
import { isNotification, ss } from "../utils";
import {
  IField,
  IFieldValue,
  LocationValue,
  SignPsbtOptions,
} from "@/shared/interfaces/provider";
import { Psbt } from "belcoinjs-lib";
import { toFixed } from "@/shared/utils/transactions";
import { useGetCurrentAccount } from "../states/walletState";

export const useApproval = () => {
  const navigate = useNavigate();
  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

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
  const { apiController, notificationController } = useControllersState(
    ss(["apiController", "notificationController"])
  );
  const currentAccount = useGetCurrentAccount();

  return useCallback(async (): Promise<
    { fields: IField[][]; fee: string } | undefined
  > => {
    if (!currentAccount?.address)
      await notificationController.rejectApproval("This will never happen");
    const approval = await notificationController.getApproval();
    if (
      !approval ||
      !approval.params ||
      !currentAccount ||
      !currentAccount.address
    )
      return;
    const psbtsToApprove: [Psbt, SignPsbtOptions?][] = [];
    if (approval.approvalComponent !== "multiPsbtSign") {
      psbtsToApprove.push([
        Psbt.fromBase64(approval.params.data[0]),
        approval.params.data[1],
      ]);
    } else {
      for (const psbt of approval.params.data[0]) {
        psbtsToApprove.push([Psbt.fromBase64(psbt.psbtBase64), psbt.options]);
      }
    }

    let totalInputValue = 0;
    let totalOutputValue = 0;

    const result = psbtsToApprove.map(async ([psbt, options]) => {
      const inputFields: IField[] = [];
      const outputFields: IField[] = [];
      const inputLocations = psbt.txInputs.map(
        (f) => f.hash.reverse().toString("hex") + ":" + f.index
      );
      const inputValues = await apiController.getUtxoValues(inputLocations);
      if (!inputValues) {
        await notificationController.rejectApproval(
          "Failed to find txids from psbt"
        );
        return [];
      }
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
        const isImportant = options?.toSignInputs
          ?.map((f) => f.index)
          .includes(i);

        let value: IFieldValue;
        const inputValue = locationValue[outpoint] / 10 ** 8;
        totalInputValue += inputValue;

        if (psbt.data.inputs[i].sighashType === 131) {
          const foundInscriptions = await apiController.getInscription({
            address: currentAccount!.address!,
            inscriptionId: outpoint.slice(0, -2) + "i" + txInput.index,
          });

          if (foundInscriptions && foundInscriptions.length) {
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
          important: isImportant ?? false,
          input: true,
          label: `Input #${i}`,
          value,
        });
      }
      return inputFields.concat(outputFields);
    });

    const fee = totalInputValue - totalOutputValue;
    return {
      fields: await Promise.all(result),
      fee: fee < 0 ? "0" : toFixed(fee),
    };
  }, [apiController, currentAccount, notificationController]);
};
