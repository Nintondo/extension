import i18n from "@/shared/locales/i18n";
import { useAppState } from "@/ui/states/appState";
import s from "./styles.module.scss";
import cn from "classnames";
import { ss } from "@/ui/utils";

const Language = () => {
  const { updateAppState } = useAppState(ss(["updateAppState"]));

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await updateAppState({ language: lng }, true);
    window.location.reload();
  };

  const newLanguage = (lng: string) => {
    return async () => {
      await changeLanguage(lng);
    };
  };

  return (
    <div className={s.languages}>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={newLanguage("en")}
        >
          English
        </button>
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={newLanguage("ru")}
        >
          Русский
        </button>
      </div>
      <div className="flex w-10/12 justify-evenly gap-4">
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={newLanguage("ch")}
        >
          中國人
        </button>
        <button
          className={cn(s.langBtn, "btn primary")}
          onClick={newLanguage("kr")}
        >
          중국인
        </button>
      </div>
    </div>
  );
};

export default Language;
