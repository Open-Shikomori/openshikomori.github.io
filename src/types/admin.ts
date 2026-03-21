import type { Json } from "@/types/supabase";

export interface AdminDashboardStats {
  totalUsers: number;
  activeContributors: number;
  publicContributors: number;
  totalClips: number;
  pendingClips: number;
  approvedClips: number;
  rejectedClips: number;
  pendingCorrections: number;
  approvedHours: number;
  admins: number;
}

export interface AdminLanguageBreakdownItem {
  category: string;
  clipCount: number;
  totalSeconds: number;
}

export interface AdminActivityItem {
  id: string;
  createdAt: string;
  kind: "admin" | "system";
  summary: string;
  actorName: string;
  actorEmail?: string | null;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  languageBreakdown: AdminLanguageBreakdownItem[];
  recentActivity: AdminActivityItem[];
}

export interface AdminUserRecord {
  id: string;
  email: string | null;
  displayName: string;
  avatar: string;
  homeIsland: string | null;
  isPublic: boolean;
  contributionCount: number;
  recordingsCount: number;
  correctionsCount: number;
  reviewsCount: number;
  xpTotal: number;
  createdAt: string | null;
  updatedAt: string | null;
  lastContributionDate: string | null;
  lastContributedAt: string | null;
  adminRole: "admin" | "superadmin" | null;
}

export interface AdminClipRecord {
  id: string;
  audioUrl: string;
  duration: number;
  language: string;
  dialect: string | null;
  transcription: string;
  status: "pending" | "approved" | "rejected";
  correctionCount: number;
  isDuplicate: boolean;
  contributedBy: string;
  contributorName: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  transcriptionHistory: Json[];
}

export interface AdminCorrectionRecord {
  id: string;
  clipId: string;
  originalText: string;
  suggestedText: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  suggestedBy: string;
  suggesterName: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  audioUrl: string | null;
  clipLanguage: string | null;
  clipDialect: string | null;
}

export interface AdminSettingsGoals {
  id?: string;
  target_hours: number;
  target_dialects: number;
  target_languages_hours: Record<string, number>;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface ContributionLimitsSettings {
  dailyContributionLimit: number;
  dailyCorrectionLimit: number;
  requireManualReview: boolean;
}

export interface SpeechSettings {
  transcriptionProvider: string;
  transcriptionModel: string;
  voiceStorage: string;
  autoApproveClips: boolean;
}

export interface SitePreferencesSettings {
  showCommunitySection: boolean;
  showRoadmap: boolean;
  maintenanceMode: boolean;
}

export interface AdminRoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  order_index: number;
}

export interface AdminRoadmapPhase {
  id: string;
  stage: string;
  period: string;
  order_index: number;
  items: AdminRoadmapItem[];
}

export interface AdminSettingsData {
  goals: AdminSettingsGoals;
  platform: {
    contribution_limits: ContributionLimitsSettings;
    speech_settings: SpeechSettings;
    site_preferences: SitePreferencesSettings;
  };
  roadmap: AdminRoadmapPhase[];
}

export const defaultAdminSettings: AdminSettingsData = {
  goals: {
    target_hours: 10,
    target_dialects: 4,
    target_languages_hours: {
      shingazidja: 10,
      shindzuani: 10,
      shimwali: 10,
      shimaore: 10,
      french: 10,
      english: 10,
      arabic: 10,
    },
  },
  platform: {
    contribution_limits: {
      dailyContributionLimit: 50,
      dailyCorrectionLimit: 100,
      requireManualReview: true,
    },
    speech_settings: {
      transcriptionProvider: "browser",
      transcriptionModel: "web_speech",
      voiceStorage: "r2",
      autoApproveClips: false,
    },
    site_preferences: {
      showCommunitySection: true,
      showRoadmap: true,
      maintenanceMode: false,
    },
  },
  roadmap: [],
};
