import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { fallbackLanguage, getDirection, normalizeLanguageTag } from "@/features/i18n/i18n";

export function DocumentLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const activeLanguage =
      normalizeLanguageTag(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLanguage;

    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = getDirection(activeLanguage);
  }, [i18n, i18n.language, i18n.resolvedLanguage]);

  return null;
}
