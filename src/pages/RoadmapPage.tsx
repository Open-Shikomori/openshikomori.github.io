import { useCallback } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";
import { JoinCommunityCTA } from "@/shared/ui/JoinCommunityCTA";
import { fetchSiteData, usePublicSiteData } from "@/lib/site-data";
import roadmapData from "@/data/roadmap.json";

type RoadmapItem = {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
};

type RoadmapPhase = {
  stage: string;
  period: string;
  items: RoadmapItem[];
};

export function RoadmapPage() {
  const { t, i18n } = useTranslation();
  const liveSiteData = usePublicSiteData(
    { roadmap: roadmapData as any[], site_preferences: { showRoadmap: true } },
    useCallback(() => fetchSiteData(), [])
  );
  const sourceRoadmap = liveSiteData.roadmap || roadmapData;
  const showRoadmap = liveSiteData.site_preferences?.showRoadmap !== false;

  const phases: RoadmapPhase[] = (sourceRoadmap as any[]).map((phase: any) => ({
    stage: t(phase.stage),
    period: t(phase.period),
    items: phase.items.map((item: any) => ({
      title: t(item.title),
      description: t(item.description),
      status: item.status as RoadmapItem["status"],
    })),
  }));

  const getStatusIcon = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "upcoming":
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "completed":
        return "border-l-4 border-l-green-500";
      case "in-progress":
        return "border-l-4 border-l-amber-500";
      case "upcoming":
        return "border-l-4 border-l-muted";
    }
  };

  return (
    <>
      <SEO
        title={t("roadmapPage.seoTitle", "Roadmap")}
        description={t("roadmapPage.seoDescription", "See our progress and future plans for building Shikomori language AI models.")}
        pathname="roadmap"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("roadmapPage.eyebrow")}
        title={t("roadmapPage.title")}
        subtitle={t("roadmapPage.subtitle")}
      />

      {!showRoadmap ? (
        <section className="w-full border-b border-border px-6 py-12 sm:px-12">
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="text-lg font-semibold text-foreground">Roadmap temporarily hidden</p>
            <p className="mt-2 text-sm text-muted-foreground">
              An administrator has disabled public roadmap visibility for now.
            </p>
          </div>
        </section>
      ) : (
        <>

      {/* Legend */}
      <section className="w-full border-b border-border px-6 py-8 sm:px-12">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">{t("roadmapPage.legend.completed")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">{t("roadmapPage.legend.inProgress")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("roadmapPage.legend.upcoming")}</span>
          </div>
        </div>
      </section>

      {/* Roadmap Phases */}
      <section className="w-full px-6 py-16 sm:px-12 lg:py-24">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Timeline
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Project Phases
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {phases.map((phase, phaseIndex) => (
            <motion.div
              key={phase.stage}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: phaseIndex * 0.1 }}
            >
              <div className="mb-6 flex items-baseline gap-4">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {phase.stage}
                </h3>
                <span className="text-sm text-muted-foreground">{phase.period}</span>
              </div>
              <div className="space-y-4">
                {phase.items.map((item) => (
                  <Card
                    key={item.title}
                    className={`border-border bg-card ${getStatusClass(item.status)}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(item.status)}
                        <CardTitle className="text-base tracking-tight">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="pl-8 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      </>
      )}

      <JoinCommunityCTA />
    </main>
    </>
  );
}
