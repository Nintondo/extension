import i18n from "../../../../shared/locales/i18n";
import { useAppState } from "../../../states/appState";
import { useControllersState } from "../../../states/controllerState";
import s from "./styles.module.scss";
import cn from "classnames";

const Language = () => {

  const { updateAppState } = useAppState((v) => ({
    updateAppState: v.updateAppState
  }))

  const { walletController } = useControllersState((v) => ({
    walletController: v.walletController
  }))

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    await updateAppState({ language: lng });
    await walletController.saveWallets();
    window.location.reload();
  }

  return (
    <div className={s.languages}>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button className={cn(s.langBtn, "btn primary")} onClick={() => { changeLanguage("en") }}>English</button>
        <button className={cn(s.langBtn, "btn primary")} onClick={() => { changeLanguage("ru") }}>Русский</button>
      </div>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button className={cn(s.langBtn, "btn primary")} onClick={() => { changeLanguage("ch") }}>中國人</button>
        <button className={cn(s.langBtn, "btn primary")} onClick={() => { changeLanguage("kr") }}>중국인</button>
      </div>
    </div>
  );
};

export default Language;
