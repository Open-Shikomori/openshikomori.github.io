import { useEffect, useState } from "react";
import { Save, Settings2, Shield, SlidersHorizontal } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import { getAdminSettings, updateAdminSettings } from "../services/adminData";
import { defaultAdminSettings, type AdminSettingsData } from "@/types/admin";

function toNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsData>(defaultAdminSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      setSettings(await getAdminSettings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      setSettings(await updateAdminSettings(settings));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const languageGoalEntries = Object.entries(settings.goals.target_languages_hours || {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Dataset goals, contribution rules, transcription stack, and site behavior
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void loadSettings()}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-[10px] font-black uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Dataset Goals</h2>
                <p className="text-sm text-muted-foreground">Admin-managed goals now live in Supabase instead of static defaults only.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target hours</span>
                <input
                  type="number"
                  value={settings.goals.target_hours}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, target_hours: toNumber(event.target.value, prev.goals.target_hours) },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target dialects</span>
                <input
                  type="number"
                  value={settings.goals.target_dialects}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      goals: { ...prev.goals, target_dialects: toNumber(event.target.value, prev.goals.target_dialects) },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {languageGoalEntries.map(([key, value]) => (
                <label key={key} className="space-y-2 text-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key}</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        goals: {
                          ...prev.goals,
                          target_languages_hours: {
                            ...prev.goals.target_languages_hours,
                            [key]: toNumber(event.target.value, value),
                          },
                        },
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-input bg-background px-4"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Contribution and Speech Pipeline</h2>
                <p className="text-sm text-muted-foreground">Controls for moderation load, transcription provider, and storage choices.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily contribution limit</span>
                <input
                  type="number"
                  value={settings.platform.contribution_limits.dailyContributionLimit}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        contribution_limits: {
                          ...prev.platform.contribution_limits,
                          dailyContributionLimit: toNumber(event.target.value, prev.platform.contribution_limits.dailyContributionLimit),
                        },
                      },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily correction limit</span>
                <input
                  type="number"
                  value={settings.platform.contribution_limits.dailyCorrectionLimit}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        contribution_limits: {
                          ...prev.platform.contribution_limits,
                          dailyCorrectionLimit: toNumber(event.target.value, prev.platform.contribution_limits.dailyCorrectionLimit),
                        },
                      },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transcription provider</span>
                <input
                  value={settings.platform.speech_settings.transcriptionProvider}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        speech_settings: {
                          ...prev.platform.speech_settings,
                          transcriptionProvider: event.target.value,
                        },
                      },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transcription model</span>
                <input
                  value={settings.platform.speech_settings.transcriptionModel}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        speech_settings: {
                          ...prev.platform.speech_settings,
                          transcriptionModel: event.target.value,
                        },
                      },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>

              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Voice storage backend</span>
                <input
                  value={settings.platform.speech_settings.voiceStorage}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        speech_settings: {
                          ...prev.platform.speech_settings,
                          voiceStorage: event.target.value,
                        },
                      },
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Require manual review</p>
                  <p className="text-xs text-muted-foreground">Keep human moderation in the loop before clips are trusted.</p>
                </div>
                <Switch
                  checked={settings.platform.contribution_limits.requireManualReview}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        contribution_limits: {
                          ...prev.platform.contribution_limits,
                          requireManualReview: checked,
                        },
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Auto-approve clips</p>
                  <p className="text-xs text-muted-foreground">Only enable if the speech pipeline is trusted enough for reduced moderation.</p>
                </div>
                <Switch
                  checked={settings.platform.speech_settings.autoApproveClips}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: {
                        ...prev.platform,
                        speech_settings: {
                          ...prev.platform.speech_settings,
                          autoApproveClips: checked,
                        },
                      },
                    }))
                  }
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Site Preferences</h2>
                <p className="text-sm text-muted-foreground">Public-facing modules that admins can toggle without touching code.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "showCommunitySection",
                  label: "Show community section",
                  description: "Keep contributor highlights visible on the marketing site.",
                },
                {
                  key: "showRoadmap",
                  label: "Show roadmap",
                  description: "Expose the roadmap publicly instead of hiding it.",
                },
                {
                  key: "maintenanceMode",
                  label: "Maintenance mode",
                  description: "Use this to stage temporary public downtime messaging.",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={settings.platform.site_preferences[item.key as keyof typeof settings.platform.site_preferences]}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        platform: {
                          ...prev.platform,
                          site_preferences: {
                            ...prev.platform.site_preferences,
                            [item.key]: checked,
                          },
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Roadmap Sync Status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Roadmap data is already available through Supabase and ready for the next editor pass.
            </p>

            <div className="mt-6 space-y-3">
              {settings.roadmap.length > 0 ? (
                settings.roadmap.map((phase) => (
                  <div key={phase.id} className="rounded-xl border border-border bg-background p-4">
                    <p className="font-semibold text-foreground">{phase.stage}</p>
                    <p className="text-xs text-muted-foreground">{phase.period}</p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-primary">{phase.items.length} items</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                  No roadmap phases stored yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
