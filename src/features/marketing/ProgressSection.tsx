import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Metric = {
  label: string;
  value: string;
  detail: string;
};

type PreviewSteps = string[];

export function ProgressSection() {
  const { t } = useTranslation();
  const metrics = t("progress.metrics", { returnObjects: true }) as Metric[];
  const previewSteps = t("progress.previewSteps", { returnObjects: true }) as PreviewSteps;

  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 pt-20 sm:px-12 sm:pt-32" id="contribution-preview">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="space-y-6">
          <p className="inline-block border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            {t("progress.eyebrow")}
          </p>
          <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("progress.title")}
          </h2>
          <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("progress.description")}
          </p>
          <p className="max-w-3xl border-l-2 border-primary pl-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t("progress.note")}
          </p>
        </div>

        <Card className="border-border bg-card shadow-none">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle className="text-lg tracking-tight uppercase tracking-widest text-foreground">{t("progress.previewTitle")}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">{t("progress.previewBody")}</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {previewSteps.map((step, idx) => (
              <div
                key={step}
                className="flex items-start gap-4 border border-border/60 bg-muted/20 px-4 py-3"
              >
                <span className="flex size-5 shrink-0 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground mt-0.5">
                  0{idx + 1}
                </span>
                <span className="text-sm font-medium leading-relaxed text-foreground">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.05 * index, duration: 0.35, ease: "easeOut" }}
          >
            <Card className="h-full border-border bg-card shadow-none">
              <CardHeader className="pb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {metric.label}
                </p>
                <CardTitle className="text-4xl tracking-tight text-foreground sm:text-5xl">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
