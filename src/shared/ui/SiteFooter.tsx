import { ArrowUpRight, Github, Mail, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SectionJumpButton } from "@/shared/ui/SectionJumpButton";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-border bg-background sm:mt-32" role="contentinfo">
      <div className="w-full">
        {/* Massive Typographic Header */}
        <div className="border-b border-border px-6 py-20 sm:px-12 lg:px-16 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl space-y-6">
              <p className="inline-flex items-center gap-3 border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                OPEN SOURCE INITIATIVE
              </p>
              <h2 className="text-balance text-6xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-[7rem]">
                {t("site.brand")}
              </h2>
            </div>

            <div className="flex flex-col gap-4 border border-border bg-muted/10 p-6 lg:min-w-[300px]">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {t("site.badge")}
              </p>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {t("site.repoPill")}
              </p>
              <a
                className="mt-4 inline-flex items-center justify-between border-t border-border pt-4 text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                href="https://github.com/Fanom2813/comorian-mbert-finetuning"
                rel="noreferrer"
                target="_blank"
              >
                View Repository <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Mega Footer Bottom */}
        <div className="bg-muted/10 px-6 py-12 sm:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center border border-border bg-background text-xs font-bold uppercase tracking-widest text-primary">
                  OS
                </div>
                <div className="space-y-1">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-primary">
                    {t("site.badge")}
                  </p>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {t("site.brand")}
                  </p>
                </div>
              </div>
              <p className="max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">
                {t("contact.description")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Project
                </p>
                <SectionJumpButton
                  className="h-auto justify-start p-0 text-sm text-muted-foreground hover:text-primary"
                  targetId="contribution-preview"
                  variant="link"
                >
                  Milestone
                </SectionJumpButton>
                <SectionJumpButton
                  className="h-auto justify-start p-0 text-sm text-muted-foreground hover:text-primary"
                  targetId="roadmap"
                  variant="link"
                >
                  Roadmap
                </SectionJumpButton>
                <SectionJumpButton
                  className="h-auto justify-start p-0 text-sm text-muted-foreground hover:text-primary"
                  targetId="privacy-consent"
                  variant="link"
                >
                  Privacy
                </SectionJumpButton>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Social
                </p>
                <a
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  href="https://github.com/Fanom2813"
                >
                  <Github className="size-4" /> GitHub
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  href="#"
                >
                  <Twitter className="size-4" /> Twitter
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  href="mailto:fanom2813@gmail.com"
                >
                  <Mail className="size-4" /> Contact
                </a>
              </div>

              <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Status
                </p>
                <div className="inline-flex w-fit items-center gap-2 border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  All systems operational
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/60 pt-8 sm:flex-row">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              © {new Date().getFullYear()} {t("site.brand")}. Open Source.
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Designed for Comoros
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
