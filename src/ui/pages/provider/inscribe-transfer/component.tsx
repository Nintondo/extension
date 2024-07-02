import { IToken } from "@/shared/interfaces/token";
import MintTransferForm from "@/ui/components/mint-transfer-form";
import { useControllersState } from "@/ui/states/controllerState";
import { useGetCurrentAccount } from "@/ui/states/walletState";
import { t } from "i18next";
import { useEffect, useState } from "react";
import Loading from "react-loading";

const InscribeTransfer = () => {
  const { notificationController, apiController } = useControllersState(
    (v) => ({
      notificationController: v.notificationController,
      apiController: v.apiController,
    })
  );
  const currentAccount = useGetCurrentAccount();

  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<IToken>({
    balance: 0,
    tick: "",
    transferable_balance: 0,
    transfers: [],
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      setLoading(true);
      if (!currentAccount?.address) return;
      const approval = await notificationController.getApproval();
      if (!approval) {
        await notificationController.rejectApproval("Invalid params");
        return;
      }
      const tick = approval.params?.data.tick as string;
      const userTokens = await apiController.getTokens(currentAccount.address);
      if (userTokens !== undefined && userTokens.length) {
        const token = userTokens.find(
          (f) => f.tick === tick.toLocaleLowerCase().trim()
        );
        if (token && token.balance > 0) {
          setToken(token);
        } else await notificationController.rejectApproval();
      } else await notificationController.rejectApproval();
      setLoading(false);
    })();
  }, [notificationController, apiController, currentAccount?.address]);

  if (loading)
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Loading type="bubbles" />
      </div>
    );

  return (
    <div>
      <p className="w-full text-lg font-normal text-center pt-6">
        {t("inscriptions.inscribe") +
          " " +
          token.tick.toUpperCase() +
          " " +
          t("inscriptions.transfer")}
      </p>
      <MintTransferForm
        selectedMintToken={token}
        setSelectedMintToken={() => {}}
        mintedHandler={(mintedAmount) =>
          notificationController.resolveApproval({ mintedAmount })
        }
      />
    </div>
  );
};

export default InscribeTransfer;
