import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import frCommon from "./locales/fr/common.json";
import enCommon from "./locales/en/common.json";
import arCommon from "./locales/ar/common.json";

export const SUPPORTED_LANGUAGES = ["fr", "en", "ar"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const RTL_LANGUAGES: Language[] = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon },
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    fallbackLng: "fr",
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

/** Synchronise <html lang> et <html dir> avec la langue active. */
function applyDirection(lng: string) {
  const lang = (SUPPORTED_LANGUAGES.includes(lng as Language) ? lng : "fr") as Language;
  const dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

applyDirection(i18n.resolvedLanguage ?? "fr");
i18n.on("languageChanged", applyDirection);

export default i18n;