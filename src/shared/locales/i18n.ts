import en from "./languages/en.json";
import ru from "./languages/ru.json";
import ch from "./languages/ch.json";
import kr from "./languages/kr.json";
import i18n from "i18next";

export const defaultNS = "  ";

export const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
  ch: {
    translation: ch,
  },
  kr: {
    translation: kr,
  },
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n
  // .use(reactI18nextModule)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
  });

export const isRTL = false;

export function getLanguages() {
  return {
    de: "German",
    el: "Greek",
    en: "English",
    es: "Spanish",
    fr: "French",
    hi: "Hindi",
    id: "Bahasa Indonesian",
    ja: "Japanese",
    ko: "Korean",
    pt: "Portuguese - Brazil",
    ru: "Russian",
    tl: "Filipino",
    tr: "Turkish",
    vi: "Vietnamese",
    zh: "Chinese - China",
  };
}

// Allow RTL alignment in RTL languages
export default i18n;
