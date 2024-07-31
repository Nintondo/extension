import { useEffect } from "react";
import s from "./styles.module.scss";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/ui/states/appState";
import { useWalletState } from "@/ui/states/walletState";
import { useControllersState } from "@/ui/states/controllerState";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { isNotification, ss } from "@/ui/utils";
import cn from "classnames";
import PasswordInput from "@/ui/components/password-input";
import { t } from "i18next";
import LogoIcon from "@/ui/icons/Logo";

interface FormType {
  password: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      password: "",
    },
  });
  const { updateAppState } = useAppState(ss(["updateAppState"]));

  const { vaultIsEmpty, updateWalletState } = useWalletState(
    ss(["vaultIsEmpty", "updateWalletState"])
  );
  const navigate = useNavigate();
  const { walletController, notificationController } = useControllersState(
    ss(["walletController", "notificationController"])
  );

  useEffect(() => {
    if (vaultIsEmpty) navigate("/account/create-password");
  }, [vaultIsEmpty, navigate]);

  const login = async ({ password }: FormType) => {
    try {
      const exportedWallets = await walletController.importWallets(password);

      await updateWalletState({
        wallets: exportedWallets,
      });
      await updateAppState({
        isUnlocked: true,
        password: password,
      });
      if (isNotification()) await notificationController.resolveApproval();
    } catch (e) {
      if ((e as Error).message) toast.error((e as Error).message);
      else throw e;
    }
  };

  return (
    <form
      className={cn("mt-5 flex flex-col w-full gap-11")}
      onSubmit={handleSubmit(login)}
    >
      <div className="flex flex-col gap-7 items-center w-full">
        <div className="flex justify-center p-2 rounded-xl">
          <LogoIcon
            className={
              "text-white w-14 h-14 hover:scale-110 duration-100 transition-transform"
            }
          />
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
            className="bg-primary text-bg rounded-xl font-medium py-1.5 px-9 text-sm font-[Roboto] uppercase standard:mx-auto"
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
