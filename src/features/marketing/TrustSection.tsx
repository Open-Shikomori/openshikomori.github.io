import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionJumpButton } from "@/shared/ui/SectionJumpButton";

type Pillar = {
  title: string;
  body: string;
};

export function TrustSection() {
  const { t } = useTranslation();
  const pillars = t("trust.pillars", { returnObjects: true }) as Pillar[];

  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 pt-20 sm:px-12 sm:pt-32" id="privacy-consent">
      <div className="border border-border bg-card p-8 sm:p-12 lg:p-16">
        <p className="inline-block border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          {t("trust.eyebrow")}
        </p>
        <div className="mt-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="space-y-6">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("trust.title")}
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("trust.description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="border-border/60 bg-muted/10 shadow-none"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base tracking-tight">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{pillar.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("site.repoPill")}</p>
          <SectionJumpButton
            className="h-auto px-0 text-xs font-bold uppercase tracking-widest text-primary shadow-none transition-colors hover:bg-transparent hover:text-primary/80"
            size="sm"
            targetId="support-path"
            variant="ghost"
          >
            {t("site.nav.support")}
          </SectionJumpButton>
        </div>
      </div>
    </section>
  );
}
