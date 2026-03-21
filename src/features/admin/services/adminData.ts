import { supabase, isSupabaseConfigured } from "../../contribution/services/supabase";
import type { Json } from "@/types/supabase";
import {
  defaultAdminSettings,
  type AdminActivityItem,
  type AdminClipRecord,
  type AdminCorrectionRecord,
  type AdminDashboardData,
  type AdminRoadmapPhase,
  type AdminSettingsData,
  type AdminSettingsGoals,
  type AdminUserRecord,
} from "@/types/admin";

function requireSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase not configured");
  }

  return supabase;
}

function normalizeUser(row: any): AdminUserRecord {
  return {
    id: row.id,
    email: row.email ?? null,
    displayName: row.display_name || row.email?.split("@")[0] || "Unnamed user",
    avatar: row.avatar || "",
    homeIsland: row.home_island ?? null,
    isPublic: Boolean(row.is_public),
    contributionCount: row.contribution_count || 0,
    recordingsCount: row.recordings_count || 0,
    correctionsCount: row.corrections_count || 0,
    reviewsCount: row.reviews_count || 0,
    xpTotal: row.xp_total || 0,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    lastContributionDate: row.last_contribution_date ?? null,
    lastContributedAt: row.last_contributed_at ?? null,
    adminRole: row.admin_role ?? null,
  };
}

function normalizeClip(row: any): AdminClipRecord {
  return {
    id: row.id,
    audioUrl: row.audio_url,
    duration: row.duration || 0,
    language: row.language || "unknown",
    dialect: row.dialect ?? null,
    transcription: row.transcription || "",
    status: (row.status || "pending") as AdminClipRecord["status"],
    correctionCount: row.correction_count || 0,
    isDuplicate: Boolean(row.is_duplicate),
    contributedBy: row.contributed_by,
    contributorName: row.contributor_name || "Contributor",
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    transcriptionHistory: Array.isArray(row.transcription_history) ? row.transcription_history : [],
  };
}

function normalizeCorrection(row: any): AdminCorrectionRecord {
  return {
    id: row.id,
    clipId: row.clip_id,
    originalText: row.original_text,
    suggestedText: row.suggested_text,
    status: (row.status || "pending") as AdminCorrectionRecord["status"],
    reviewNote: row.review_note ?? null,
    suggestedBy: row.suggested_by,
    suggesterName: row.suggester_name || "Contributor",
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at ?? null,
    audioUrl: row.audio_url ?? null,
    clipLanguage: row.clip_language ?? null,
    clipDialect: row.clip_dialect ?? null,
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_get_dashboard");

  if (error) throw error;

  const parsed = (data || {}) as {
    stats?: AdminDashboardData["stats"];
    languageBreakdown?: AdminDashboardData["languageBreakdown"];
    recentActivity?: Array<{
      id: string;
      createdAt?: string;
      created_at?: string;
      kind: "admin" | "system";
      summary: string;
      actorName?: string;
      actor_name?: string;
      actorEmail?: string | null;
      actor_email?: string | null;
    }>;
  };

  return {
    stats: {
      totalUsers: parsed.stats?.totalUsers || 0,
      activeContributors: parsed.stats?.activeContributors || 0,
      publicContributors: parsed.stats?.publicContributors || 0,
      totalClips: parsed.stats?.totalClips || 0,
      pendingClips: parsed.stats?.pendingClips || 0,
      approvedClips: parsed.stats?.approvedClips || 0,
      rejectedClips: parsed.stats?.rejectedClips || 0,
      pendingCorrections: parsed.stats?.pendingCorrections || 0,
      approvedHours: parsed.stats?.approvedHours || 0,
      admins: parsed.stats?.admins || 0,
    },
    languageBreakdown: parsed.languageBreakdown || [],
    recentActivity: (parsed.recentActivity || []).map((item) => ({
      id: item.id,
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      kind: item.kind,
      summary: item.summary,
      actorName: item.actorName || item.actor_name || "Admin",
      actorEmail: item.actorEmail || item.actor_email || null,
    })),
  };
}

export async function listAdminUsers(search?: string): Promise<AdminUserRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_users", {
    p_search: search || undefined,
    p_limit: 200,
    p_offset: 0,
  });

  if (error) throw error;
  return (data || []).map(normalizeUser);
}

export async function listAdminContributors(search?: string): Promise<AdminUserRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_contributors", {
    p_search: search || undefined,
    p_limit: 200,
    p_offset: 0,
  });

  if (error) throw error;
  return (data || []).map(normalizeUser);
}

export async function listAdmins(): Promise<
  Array<{ userId: string; email: string | null; displayName: string; role: "admin" | "superadmin"; createdAt: string | null }>
> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_admins");

  if (error) throw error;

  return (data || []).map((row) => ({
    userId: row.user_id,
    email: row.email ?? null,
    displayName: row.display_name || row.email?.split("@")[0] || "Admin",
    role: (row.role || "admin") as "admin" | "superadmin",
    createdAt: row.created_at ?? null,
  }));
}

export async function upsertAdmin(userId: string, role: "admin" | "superadmin") {
  const client = requireSupabase();
  const { error } = await client.rpc("admin_upsert_admin", {
    p_user_id: userId,
    p_role: role,
  });

  if (error) throw error;
}

export async function removeAdmin(userId: string) {
  const client = requireSupabase();
  const { error } = await client.rpc("admin_remove_admin", {
    p_user_id: userId,
  });

  if (error) throw error;
}

export async function updateAdminUserProfile(payload: {
  userId: string;
  displayName?: string;
  avatar?: string;
  homeIsland?: string | null;
  isPublic?: boolean;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_update_user_profile", {
    p_user_id: payload.userId,
    p_display_name: payload.displayName ?? undefined,
    p_avatar: payload.avatar ?? undefined,
    p_home_island: payload.homeIsland ?? undefined,
    p_is_public: payload.isPublic ?? undefined,
  });

  if (error) throw error;
  return normalizeUser(data);
}

export async function listAdminClips(filters?: {
  status?: "all" | "pending" | "approved" | "rejected";
  language?: string;
  search?: string;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_clips", {
    p_status: filters?.status && filters.status !== "all" ? filters.status : undefined,
    p_language: filters?.language && filters.language !== "all" ? filters.language : undefined,
    p_search: filters?.search || undefined,
    p_limit: 200,
    p_offset: 0,
  });

  if (error) throw error;
  return (data || []).map(normalizeClip);
}

export async function updateAdminClip(payload: {
  clipId: string;
  status?: "pending" | "approved" | "rejected";
  transcription?: string;
  isDuplicate?: boolean;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_update_clip", {
    p_clip_id: payload.clipId,
    p_status: payload.status,
    p_transcription: payload.transcription,
    p_is_duplicate: payload.isDuplicate,
  });

  if (error) throw error;
  return normalizeClip(data);
}

export async function listAdminCorrections(filters?: {
  status?: "all" | "pending" | "approved" | "rejected";
  search?: string;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_corrections", {
    p_status: filters?.status && filters.status !== "all" ? filters.status : undefined,
    p_search: filters?.search || undefined,
    p_limit: 200,
    p_offset: 0,
  });

  if (error) throw error;
  return (data || []).map(normalizeCorrection);
}

export async function reviewAdminCorrection(payload: {
  correctionId: string;
  decision: "approved" | "rejected";
  reviewNote?: string;
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_review_correction", {
    p_correction_id: payload.correctionId,
    p_decision: payload.decision,
    p_review_note: payload.reviewNote || undefined,
  });

  if (error) throw error;
  return normalizeCorrection(data);
}

function normalizeSettings(data: any): AdminSettingsData {
  const goals = (data?.goals || {}) as Partial<AdminSettingsGoals>;
  const platform = data?.platform || {};

  return {
    goals: {
      ...defaultAdminSettings.goals,
      ...goals,
      target_languages_hours: {
        ...defaultAdminSettings.goals.target_languages_hours,
        ...(goals.target_languages_hours || {}),
      },
    },
    platform: {
      contribution_limits: {
        ...defaultAdminSettings.platform.contribution_limits,
        ...(platform.contribution_limits || {}),
      },
      speech_settings: {
        ...defaultAdminSettings.platform.speech_settings,
        ...(platform.speech_settings || {}),
      },
      site_preferences: {
        ...defaultAdminSettings.platform.site_preferences,
        ...(platform.site_preferences || {}),
      },
    },
    roadmap: (data?.roadmap || []) as AdminRoadmapPhase[],
  };
}

export async function getAdminSettings(): Promise<AdminSettingsData> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_get_settings");

  if (error) throw error;
  return normalizeSettings(data);
}

export async function updateAdminSettings(settings: AdminSettingsData): Promise<AdminSettingsData> {
  const client = requireSupabase();
  const payload = {
    goals: settings.goals,
    platform: settings.platform,
  } as unknown as Json;

  const { data, error } = await client.rpc("admin_update_settings", {
    p_payload: payload,
  });

  if (error) throw error;
  return normalizeSettings(data);
}

export async function listAdminActivity(limit = 25): Promise<AdminActivityItem[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("admin_list_activity", {
    p_limit: limit,
  });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    kind: "admin",
    summary: `${row.action} ${row.entity_type}`,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
  }));
}
