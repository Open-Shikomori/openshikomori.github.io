import { StrictMode, type PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";

import { DocumentLanguageSync } from "@/app/providers/DocumentLanguageSync";
import { i18n } from "@/features/i18n/i18n";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DocumentLanguageSync />
          {children}
        </ThemeProvider>
      </I18nextProvider>
    </StrictMode>
  );
}
