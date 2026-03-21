import { useEffect, useState } from "react";

import { supabase } from "@/features/contribution/services/supabase";
import type { User } from "@/types/contribution";

interface SiteDataPayload {
  goals?: {
    target_hours?: number;
    target_dialects?: number;
    target_languages_hours?: Record<string, number>;
  };
  roadmap?: Array<{
    stage: string;
    period: string;
    order_index?: number;
    items: Array<{
      title: string;
      description: string;
      status: "completed" | "in-progress" | "upcoming";
      order_index?: number;
    }>;
  }>;
  site_preferences?: {
    showCommunitySection?: boolean;
    showRoadmap?: boolean;
    maintenanceMode?: boolean;
  };
}

export function usePublicSiteData<T>(fallbackValue: T, load: () => Promise<T>) {
  const [data, setData] = useState<T>(fallbackValue);

  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const next = await load();
        if (!cancelled) {
          setData(next);
        }
      } catch (error) {
        console.warn("Falling back to static site data:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);

  return data;
}

export async function fetchSiteData(): Promise<SiteDataPayload> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.rpc("get_site_data");
  if (error) throw error;
  return (data || {}) as SiteDataPayload;
}

export async function fetchDatasetStats<T>(): Promise<T> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.rpc("get_global_dataset_stats");
  if (error) throw error;
  return (data || {}) as T;
}

export async function fetchCommunity(limit = 30): Promise<User[]> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.rpc("get_leaderboard", {
    limit_count: limit,
  });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    uid: row.user_id,
    profile: {
      displayName: row.display_name,
      avatar: row.avatar,
      isPublic: true,
    },
    contributionCount: {
      recordings: row.recordings_count || 0,
      corrections: row.corrections_count || 0,
      reviews: 0,
    },
    createdAt: null,
    lastActiveAt: null,
  }));
}
