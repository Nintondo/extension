import { useEffect } from "react";
import s from "./styles.module.scss";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/ui/states/appState";
import { useWalletState } from "@/ui/states/walletState";
import { useControllersState } from "@/ui/states/controllerState";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSyncStorages } from "@/ui/utils/setup";
import { isNotification } from "@/ui/utils";
import cn from "classnames";
import PasswordInput from "@/ui/components/password-input";
import { t } from "i18next";

interface FormType {
  password: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      password: "",
    },
  });
  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState,
  }));

  const { updateWalletState, vaultIsEmpty } = useWalletState((v) => ({
    updateWalletState: v.updateWalletState,
    vaultIsEmpty: v.vaultIsEmpty,
  }));
  const navigate = useNavigate();
  const { walletController, notificationController } = useControllersState(
    (v) => ({
      walletController: v.walletController,
      notificationController: v.notificationController,
    })
  );
  const syncStorages = useSyncStorages();

  useEffect(() => {
    if (vaultIsEmpty) navigate("/account/create-password");
  }, [vaultIsEmpty, navigate]);

  const login = async ({ password }: FormType) => {
    try {
      const exportedWallets = await walletController.importWallets(password);
      const { walletState } = await syncStorages();
      const selectedWallet = walletState.selectedWallet;
      exportedWallets[selectedWallet].accounts =
        await walletController.loadAccountsData(
          selectedWallet,
          exportedWallets[selectedWallet].accounts
        );
      await updateWalletState({
        wallets: exportedWallets,
      });
      await updateAppState({
        isUnlocked: true,
        password: password,
      });

      if (!isNotification()) navigate("/");
      else await notificationController.resolveApproval();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <form
      className={cn("mt-5 flex flex-col w-full gap-11")}
      onSubmit={handleSubmit(login)}
    >
      <div className="flex flex-col gap-7 items-center w-full">
        <div className="flex justify-center p-2 rounded-xl bg-input-bg">
          <img alt="Nintondo" src="icon.ico" className="w-10 h-10" />
        </div>
        <div className="text-lg text-center font-[Roboto] uppercase tracking-widest">
          {t("login.welcome_back")}
        </div>
      </div>
      <div className={cn(s.form, "mb-20 w-full items-center justify-center")}>
        <PasswordInput
          showSeparateLabel={false}
          register={register}
          label={t("login.password")}
          name="password"
        />
        <div className="w-full flex justify-center">
          <button
            className="bg-text text-bg rounded-xl font-medium py-1 px-9 text-base standard:mx-auto"
            type="submit"
          >
            {t("login.login")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Login;
