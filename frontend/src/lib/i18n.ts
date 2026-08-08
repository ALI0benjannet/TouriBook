import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "@/locales/fr/common.json";
import en from "@/locales/en/common.json";
import ar from "@/locales/ar/common.json";

export const SUPPORTED = ["fr", "en", "ar"] as const;
export type Lang = (typeof SUPPORTED)[number];
export const RTL_LANGS: Lang[] = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: fr },
      en: { common: en },
      ar: { common: ar },
    },
    fallbackLng: "fr",
    supportedLngs: [...SUPPORTED],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

/** Applique lang + dir sur <html> à chaque changement */
const applyDir = (lng: string) => {
  const dir = RTL_LANGS.includes(lng as Lang) ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
};

applyDir(i18n.resolvedLanguage ?? "fr");
i18n.on("languageChanged", applyDir);

export default i18n;