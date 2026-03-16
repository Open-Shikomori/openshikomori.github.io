import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "@/content/locales/ar";
import en from "@/content/locales/en";
import fr from "@/content/locales/fr";

export const supportedLanguages = ["fr", "en", "ar"] as const;

export type AppLanguage = (typeof supportedLanguages)[number];
export type AppDirection = "ltr" | "rtl";
export type LocaleResource = Record<string, unknown>;

export const fallbackLanguage: AppLanguage = "fr";

const rtlLanguages = new Set<AppLanguage>(["ar"]);
const supportedLanguageSet = new Set<AppLanguage>(supportedLanguages);

export function normalizeLanguageTag(language?: string | null): AppLanguage | null {
  if (!language) {
    return null;
  }

  const normalizedLanguage = language.toLowerCase();
  const baseLanguage = normalizedLanguage.split("-")[0];

  if (supportedLanguageSet.has(normalizedLanguage as AppLanguage)) {
    return normalizedLanguage as AppLanguage;
  }

  if (supportedLanguageSet.has(baseLanguage as AppLanguage)) {
    return baseLanguage as AppLanguage;
  }

  return null;
}

export function getDirection(language?: string | null): AppDirection {
  return rtlLanguages.has(normalizeLanguageTag(language) ?? fallbackLanguage) ? "rtl" : "ltr";
}

export const localeResources = {
  fr: { translation: fr },
  en: { translation: en },
  ar: { translation: ar },
} satisfies Record<AppLanguage, { translation: LocaleResource }>;

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: localeResources,
      fallbackLng: fallbackLanguage,
      supportedLngs: [...supportedLanguages],
      nonExplicitSupportedLngs: true,
      load: "languageOnly",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
      returnNull: false,
    });
}

export { i18n };
