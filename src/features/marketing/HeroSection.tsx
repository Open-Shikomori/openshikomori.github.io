import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionJumpButton } from "@/shared/ui/SectionJumpButton";
import { DottedSurface } from "@/components/ui/dotted-surface";

type Checklist = string[];

export function HeroSection() {
  const { t } = useTranslation();
  const checklist = t("hero.checklist", { returnObjects: true }) as Checklist;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <DottedSurface className="opacity-40 dark:opacity-20" />
      
      <div className="mx-auto w-full max-w-[90rem] px-6 py-24 sm:px-12 lg:py-32 relative z-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="max-w-4xl">
            <p className="inline-block border border-border bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              {t("hero.eyebrow")}
            </p>
            <div className="mt-8 space-y-6">
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
              <SectionJumpButton
                className="px-8"
                size="lg"
                targetId="contribution-preview"
                variant="default"
              >
                {t("hero.primaryCta")}
              </SectionJumpButton>
              <SectionJumpButton
                className="px-8 border-border bg-background/50 backdrop-blur-sm"
                size="lg"
                targetId="roadmap"
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
              <CardContent className="grid gap-4 pt-6">
                {checklist.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 border border-border/60 bg-background/40 backdrop-blur-sm p-4"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground mt-0.5">
                      0{index + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
