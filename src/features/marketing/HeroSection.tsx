import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionJumpButton } from "@/shared/ui/SectionJumpButton";
import { Button } from "@/components/ui/button";
import { useContribution } from "../contribution/context/ContributionContext";

interface Dialect {
  name: string;
  region: string;
  description: string;
}

interface Dialects {
  shingazidja: Dialect;
  shindzuani: Dialect;
  shimwali: Dialect;
  shimaore: Dialect;
}

export function HeroSection() {
  const { t } = useTranslation();
  const { openContributionModal } = useContribution();
  const dialects = t("hero.dialects", { returnObjects: true }) as Dialects;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="relative z-10 w-full px-6 py-24 sm:px-12 lg:py-32">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="max-w-4xl">
            <div className="space-y-6">
              <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[5rem]">
                {t("hero.title")}
              </h1>
              <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {t("hero.description")}
              </p>
              <p className="max-w-3xl border-l-2 border-primary pl-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {t("hero.note")}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                className="px-8 h-14 text-base rounded-none font-bold"
                size="lg"
                onClick={openContributionModal}
              >
                {t("hero.primaryCta")}
              </Button>
              <SectionJumpButton
                className="px-8 border-border bg-background/50 backdrop-blur-sm h-14"
                size="lg"
                targetId="contribution-preview"
                variant="outline"
              >
                {t("hero.secondaryCta")}
              </SectionJumpButton>
            </div>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
            className="mt-8 lg:mt-0"
          >
            <Card className="h-full border-border bg-background/60 backdrop-blur-sm shadow-none">
              <CardHeader className="border-b border-border/60 pb-5">
                <CardTitle className="text-lg tracking-tight uppercase tracking-widest text-foreground">{t("hero.panelTitle")}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">{t("hero.panelLead")}</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 pt-6">
                {Object.entries(dialects).map(([key, dialect], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="group border border-border/60 bg-background/40 p-4 hover:bg-background/60 hover:border-primary/30 transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-primary font-medium">
                      {dialect.region}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-foreground">
                      {dialect.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {dialect.description}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
