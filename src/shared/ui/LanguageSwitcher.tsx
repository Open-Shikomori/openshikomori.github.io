import { ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  fallbackLanguage,
  normalizeLanguageTag,
  supportedLanguages,
  type AppLanguage,
} from "@/features/i18n/i18n";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const activeLanguage = normalizeLanguageTag(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLanguage;

  function handleLanguageChange(nextLanguage: AppLanguage) {
    void i18n.changeLanguage(nextLanguage);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.switcherAriaLabel")}
        className={cn(
          buttonVariants({ size: "default", variant: "outline" }),
          "h-10 border-border bg-background px-3 text-foreground hover:bg-muted",
        )}
      >
        <Globe className="size-4 text-primary" />
        <span className="hidden text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground sm:inline">
          {t("language.label")}
        </span>
        <span className="min-w-16 text-xs font-bold uppercase tracking-widest">{t(`language.${activeLanguage}`)}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 border-border bg-background shadow-none">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest">{t("language.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activeLanguage} onValueChange={handleLanguageChange}>
          {supportedLanguages.map((language) => (
            <DropdownMenuRadioItem key={language} value={language} className="text-xs font-bold uppercase tracking-widest">
              {t(`language.${language}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
