import i18n from "@/shared/locales/i18n";
import { useAppState } from "@/ui/states/appState";
import { useControllersState } from "@/ui/states/controllerState";
import s from "./styles.module.scss";
import cn from "classnames";

const Language = () => {
  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState,
  }));

  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController,
  }));

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await updateAppState({ language: lng });
    await walletController.saveWallets();
    window.location.reload();
  };

  return (
    <div className={s.languages}>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            changeLanguage("en");
          }}
        >
          English
        </button>
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            changeLanguage("ru");
          }}
        >
          Русский
        </button>
      </div>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            changeLanguage("ch");
          }}
        >
          中國人
        </button>
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            changeLanguage("kr");
          }}
        >
          중국인
        </button>
      </div>
    </div>
  );
};

export default Language;
