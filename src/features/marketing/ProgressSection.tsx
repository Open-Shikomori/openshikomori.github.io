import { useCallback } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import siteGoals from "@/data/goals.json";
import { fetchSiteData, usePublicSiteData } from "@/lib/site-data";

export function ProgressSection() {
  const { t } = useTranslation();
  const liveSiteData = usePublicSiteData(
    { goals: siteGoals },
    useCallback(() => fetchSiteData(), [])
  );
  const activeGoals = liveSiteData.goals || siteGoals;

  const stats = [
    { value: `${activeGoals.target_hours}+`, label: t("progress.hoursGoal") },
    { value: `${activeGoals.target_dialects}`, label: t("progress.dialects") },
    { value: "1", label: t("progress.openDataset") },
  ];

  return (
    <section className="w-full border-y border-border bg-background" id="contribution-preview">
      <div className="grid md:grid-cols-2">
        {/* Left: Big statement */}
        <div className="flex flex-col justify-center border-b border-border px-6 py-16 md:border-b-0 md:border-r md:px-12 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("progress.eyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("progress.title")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("progress.description")}
            </p>
          </motion.div>
        </div>

        {/* Right: Stats */}
        <div className="grid grid-cols-3 divide-x divide-border">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center px-4 py-12 lg:py-24"
            >
              <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {stat.value}
              </span>
              <span className="mt-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
