import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RoadmapPhase = {
  stage: string;
  title: string;
  body: string;
};

export function RoadmapSection() {
  const { t } = useTranslation();
  const phases = t("roadmap.phases", { returnObjects: true }) as RoadmapPhase[];

  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 pt-20 sm:px-12 sm:pt-32" id="roadmap">
      <div className="flex flex-col gap-6">
        <div>
          <p className="inline-block border border-border bg-muted/30 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            {t("roadmap.eyebrow")}
          </p>
        </div>
        <h2 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("roadmap.title")}
        </h2>
        <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {t("roadmap.description")}
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {phases.map((phase) => (
          <Card key={phase.title} className="border-border bg-card shadow-none">
            <CardHeader className="pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {phase.stage}
              </p>
              <CardTitle className="text-2xl tracking-tight">{phase.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">{phase.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 border border-border bg-muted/20 px-6 py-5 text-sm font-medium leading-relaxed text-muted-foreground">
        {t("progress.previewBody")}
      </div>
    </section>
  );
}
