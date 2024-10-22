import i18n from "@/shared/locales/i18n";
import { useAppState } from "@/ui/states/appState";
import s from "./styles.module.scss";
import { ss } from "@/ui/utils";
import Tile from "@/ui/components/tile";

const Language = () => {
  const { updateAppState } = useAppState(ss(["updateAppState"]));

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await updateAppState({ language: lng });
    window.location.reload();
  };

  const newLanguage = (lng: string) => {
    return async () => {
      await changeLanguage(lng);
    };
  };

  return (
    <div className={s.languages}>
      <Tile label="English" onClick={newLanguage("en")} />
      <Tile label="Русский" onClick={newLanguage("ru")} />
      <Tile label="中國人" onClick={newLanguage("ch")} />
      <Tile label="중국인" onClick={newLanguage("kn")} />
    </div>
  );
};

export default Language;
