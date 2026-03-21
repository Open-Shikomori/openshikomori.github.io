import { useEffect, useState } from "react";
import {
  AlertCircle,
  AudioWaveform,
  CheckCircle2,
  Clock3,
  Languages,
  Shield,
  Users,
} from "lucide-react";

import { getAdminDashboard } from "../services/adminData";
import type { AdminDashboardData } from "@/types/admin";

const emptyDashboard: AdminDashboardData = {
  stats: {
    totalUsers: 0,
    activeContributors: 0,
    publicContributors: 0,
    totalClips: 0,
    pendingClips: 0,
    approvedClips: 0,
    rejectedClips: 0,
    pendingCorrections: 0,
    approvedHours: 0,
    admins: 0,
  },
  languageBreakdown: [],
  recentActivity: [],
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total users",
      value: data.stats.totalUsers,
      icon: Users,
      tone: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Active contributors",
      value: data.stats.activeContributors,
      icon: AudioWaveform,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Pending clips",
      value: data.stats.pendingClips,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Pending corrections",
      value: data.stats.pendingCorrections,
      icon: AlertCircle,
      tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      label: "Approved hours",
      value: data.stats.approvedHours,
      icon: CheckCircle2,
      tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      label: "Admins",
      value: data.stats.admins,
      icon: Shield,
      tone: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Moderation, contributors, settings, and admin visibility in one place
          </p>
        </div>
        <button
          onClick={() => void loadDashboard()}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className={`inline-flex rounded-xl border p-3 ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                {loading ? "-" : card.value.toLocaleString()}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Languages className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Approved Dataset Breakdown</h2>
              <p className="text-sm text-muted-foreground">Live approved-clip volume by language or dialect</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.languageBreakdown.length > 0 ? (
              data.languageBreakdown.map((item) => {
                const hours = (item.totalSeconds / 3600).toFixed(1);
                return (
                  <div key={item.category} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold capitalize text-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.clipCount} approved clips</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold tracking-tight text-foreground">{hours}h</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Approved audio</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
                No approved dataset activity yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Admin Activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Most recent audited admin actions from Supabase.
          </p>

          <div className="mt-6 space-y-4">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{activity.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.actorName}
                        {activity.actorEmail ? ` • ${activity.actorEmail}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background p-8 text-sm text-muted-foreground">
                No admin activity has been recorded yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
