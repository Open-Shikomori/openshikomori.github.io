import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { SectionJumpButton } from "@/shared/ui/SectionJumpButton";
import { SiteFooter } from "@/shared/ui/SiteFooter";

const navigationTargets = [
  { key: "milestone", targetId: "contribution-preview" },
  { key: "privacy", targetId: "privacy-consent" },
  { key: "roadmap", targetId: "roadmap" },
  { key: "support", targetId: "support-path" },
] as const;

export function PublicLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-6 py-4 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground">
              OS
            </div>
            <div className="space-y-0.5">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-primary">
                {t("site.badge")}
              </p>
              <p className="text-sm font-semibold tracking-tight text-foreground">{t("site.brand")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {navigationTargets.map((item) => (
                <SectionJumpButton
                  key={item.key}
                  className="h-auto px-0 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
                  size="sm"
                  targetId={item.targetId}
                  variant="ghost"
                >
                  {t(`site.nav.${item.key}`)}
                </SectionJumpButton>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <span className="border border-border bg-muted/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                {t("site.repoPill")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      
      <SiteFooter />
    </div>
  );
}
