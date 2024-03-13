import { useNavigate } from "react-router-dom";
import { useControllersState } from "../states/controllerState";
import { useCallback, useEffect } from "react";
import { isNotification } from "../utils";
import { IField, LocationValue } from "@/shared/interfaces/provider";
import { Psbt } from "belcoinjs-lib";
import { useGetCurrentAccount } from "../states/walletState";
import { t } from "i18next";

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

  return useCallback(async (): Promise<IField[] | undefined> => {
    const approval = await notificationController.getApproval();
    const psbt = Psbt.fromBase64(approval.params.data.psbtBase64);
    const inputFields: IField[] = [];
    const outputFields: IField[] = [];
    const inputLocations = (approval.params.data.inputsToSign as number[]).map(
      (f) =>
        psbt.txInputs[f].hash.reverse().toString("hex") +
        ":" +
        psbt.txInputs[f].index
    );
    const inputValues = await apiController.getUtxoValues(inputLocations);
    const locationValue: LocationValue = Object.fromEntries(
      inputLocations.map((f, i) => [f, inputValues[i]])
    );

    psbt.txOutputs.forEach((f, i) => {
      outputFields.push({
        input: currentAccount?.address !== f.address,
        label: `Output #${i}`,
        value: {
          text: `To ${f.address}`,
          value: `${f.value / 10 ** 8} BEL`,
        },
      });
    });

    for (const index of approval.params.data.inputsToSign) {
      const txInput = psbt.txInputs[index];
      const outpoint =
        txInput.hash.reverse().toString("hex") + ":" + txInput.index;

      if (psbt.data.inputs[index].sighashType === 131) {
        // inputFields = [];
        // outputFields = [];
        const foundInscriptions = await apiController.getInscription({
          address: currentAccount.address,
          inscriptionId: outpoint.slice(0, -2) + "i" + txInput.index,
        });

        if (foundInscriptions.length) {
          inputFields.push({
            input: true,
            label: t("provider.signSpecificInputs.inscriptions_you_send"),
            value: {
              inscriptions: foundInscriptions,
            },
          });
        } else {
          inputFields.push({
            input: true,
            label: `Input #${index}`,
            value: {
              text: `${outpoint.slice(0, -2)}`,
              value: `${locationValue[outpoint] / 10 ** 8} BEL`,
            },
          });
        }
        // outputFields.push({
        //   input: false,
        //   label: `Output #${index}`,
        //   value: {
        //     value: `${psbt.txOutputs[index].value / 10 ** 8} BEL`,
        //     text: `To ${psbt.txOutputs[index].address}`,
        //   },
        // });
        break;
      } else {
        inputFields.push({
          input: true,
          label: `Input #${index}`,
          value: {
            text: `${outpoint.slice(0, -2)}`,
            value: `${locationValue[outpoint] / 10 ** 8} BEL`,
          },
        });
      }
    }

    return inputFields.concat(outputFields);
  }, [notificationController, apiController, currentAccount]);
};
