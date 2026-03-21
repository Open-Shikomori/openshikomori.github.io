import { useCallback } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Database, Mic, FileAudio, Users, CheckCircle2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SEO } from "@/shared/ui/SEO";
import { JoinCommunityCTA } from "@/shared/ui/JoinCommunityCTA";
import { fetchDatasetStats, fetchSiteData, usePublicSiteData } from "@/lib/site-data";
import siteStats from "@/data/stats.json";
import siteGoals from "@/data/goals.json";

export function DatasetPage() {
  const { t, i18n } = useTranslation();
  const liveStats = usePublicSiteData(
    siteStats,
    useCallback(() => fetchDatasetStats<typeof siteStats>(), [])
  );
  const liveSiteData = usePublicSiteData(
    { goals: siteGoals },
    useCallback(() => fetchSiteData(), [])
  );
  const activeGoals = liveSiteData.goals || siteGoals;

  const totalHours = Math.round((liveStats.total_duration_seconds || 0) / 3600);

  const stats = [
    {
      icon: Mic,
      value: (liveStats.total_speakers || 0).toLocaleString(),
      label: t("dataset.stats.speakers"),
      description: t("dataset.stats.speakersDesc"),
    },
    {
      icon: FileAudio,
      value: (liveStats.total_clips || 0).toLocaleString(),
      label: t("dataset.stats.clips"),
      description: t("dataset.stats.clipsDesc"),
    },
    {
      icon: Database,
      value: `${totalHours}h`,
      label: t("dataset.stats.hours"),
      description: t("dataset.stats.hoursDesc"),
    },
    {
      icon: Users,
      value: Object.keys(liveStats.categories || {}).length.toString(),
      label: t("dataset.stats.languages"),
      description: t("dataset.stats.languagesDesc"),
    },
  ];

  const getLanguageProgress = (cat: string) => {
    const catStats = (liveStats as any)?.categories?.[cat];
    const durationSeconds = catStats?.duration_seconds || 0;
    const hours = durationSeconds / 3600;
    const goalHours = (activeGoals.target_languages_hours as any)?.[cat] || 10;
    return {
      hours: hours.toFixed(1),
      percent: Math.min(100, (hours / goalHours) * 100)
    };
  };

  const categories = Object.keys(activeGoals.target_languages_hours || {});

  return (
    <>
      <SEO
        title={t("dataset.seoTitle", "Dataset")}
        description={t("dataset.seoDescription", "Download the OpenShikomori speech dataset. Free, open-source audio data for Shikomori language AI research.")}
        pathname="dataset"
        lang={i18n.language}
      />
      <main className="w-full">
      <PageHeader
        eyebrow={t("dataset.eyebrow")}
        title={t("dataset.title")}
        subtitle={t("dataset.subtitle")}
      />

      {/* Stats Grid */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-background px-6 py-12 sm:px-12 lg:py-16"
            >
              <stat.icon className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xs text-muted-foreground/70">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress Section */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Progress
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {t("dataset.progress.title")}
              </h2>
            </motion.div>
          </div>
          <div className="bg-background px-6 py-16 sm:px-12 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              {categories.map((cat) => {
                const { hours, percent } = getLanguageProgress(cat);
                const goal = (activeGoals.target_languages_hours as any)?.[cat] || 10;
                return (
                  <div key={cat}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {t(`dataset.progress.${cat}`, { defaultValue: cat })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {hours}h / {goal}h goal
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-2"
                    />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download Datasets Section */}
      <section className="w-full border-b border-border bg-muted/5">
        <div className="px-6 py-16 sm:px-12 lg:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Building the Open Dataset
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We are currently in the active collection and validation phase. 
              Public downloads will be released as soon as we reach our first 50-hour milestone.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'commonvoice', icon: Database, label: 'Mozilla Common Voice Format' },
              { id: 'validated', icon: CheckCircle2, label: 'Quality-Checked Data' },
              { id: 'processed', icon: FileAudio, label: 'Pre-computed Features' }
            ].map((ds, index) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center border border-border bg-background p-10 transition-colors group"
              >
                <div className="mb-6 rounded-full bg-primary/5 p-4">
                  <ds.icon className="h-8 w-8 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground/70">{ds.label}</h3>
                <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
                  {t(`dataset.datasets.${ds.id}.description`)}
                </p>
                <div className="mt-auto inline-flex h-11 items-center border border-dashed border-border px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  Under Construction
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <JoinCommunityCTA />
    </main>
    </>
  );
}
