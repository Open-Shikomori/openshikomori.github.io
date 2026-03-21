export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          after_state: Json
          before_state: Json
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          after_state?: Json
          before_state?: Json
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          after_state?: Json
          before_state?: Json
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_config: {
        Row: {
          created_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          tier: number
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          tier: number
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          tier?: number
          xp_reward?: number | null
        }
        Relationships: []
      }
      clips: {
        Row: {
          audio_url: string
          contributed_by: string
          correction_count: number | null
          created_at: string | null
          dialect: string | null
          duration: number
          id: string
          is_duplicate: boolean | null
          language: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          transcription: string
          transcription_history: Json | null
          updated_at: string | null
        }
        Insert: {
          audio_url: string
          contributed_by: string
          correction_count?: number | null
          created_at?: string | null
          dialect?: string | null
          duration: number
          id?: string
          is_duplicate?: boolean | null
          language: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          transcription: string
          transcription_history?: Json | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string
          contributed_by?: string
          correction_count?: number | null
          created_at?: string | null
          dialect?: string | null
          duration?: number
          id?: string
          is_duplicate?: boolean | null
          language?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          transcription?: string
          transcription_history?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contribution_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      corrections: {
        Row: {
          clip_id: string
          created_at: string | null
          id: string
          original_text: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_by: string
          suggested_text: string
          updated_at: string | null
        }
        Insert: {
          clip_id: string
          created_at?: string | null
          id?: string
          original_text: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by: string
          suggested_text: string
          updated_at?: string | null
        }
        Update: {
          clip_id?: string
          created_at?: string | null
          id?: string
          original_text?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string
          suggested_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corrections_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
        ]
      }
      global_goals: {
        Row: {
          id: string
          target_dialects: number
          target_hours: number
          target_languages_hours: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          target_dialects?: number
          target_hours?: number
          target_languages_hours?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          target_dialects?: number
          target_hours?: number
          target_languages_hours?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          description: string
          id: string
          order_index: number
          phase_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          description: string
          id?: string
          order_index: number
          phase_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          description?: string
          id?: string
          order_index?: number
          phase_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "roadmap_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_phases: {
        Row: {
          id: string
          order_index: number
          period: string
          stage: string
        }
        Insert: {
          id?: string
          order_index: number
          period: string
          stage: string
        }
        Update: {
          id?: string
          order_index?: number
          period?: string
          stage?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          best_streak: number | null
          corrections_count: number | null
          created_at: string | null
          current_streak: number | null
          daily_goal: number | null
          daily_goal_completed_at: string | null
          daily_progress: number | null
          id: string
          last_contribution_date: string | null
          recordings_count: number | null
          reviews_count: number | null
          streak_freeze_reset_at: string | null
          streak_freeze_used: boolean | null
          total_seconds_recorded: number | null
          updated_at: string | null
          words_preserved: number | null
          xp_daily: number | null
          xp_daily_reset_at: string | null
          xp_total: number | null
        }
        Insert: {
          best_streak?: number | null
          corrections_count?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal?: number | null
          daily_goal_completed_at?: string | null
          daily_progress?: number | null
          id: string
          last_contribution_date?: string | null
          recordings_count?: number | null
          reviews_count?: number | null
          streak_freeze_reset_at?: string | null
          streak_freeze_used?: boolean | null
          total_seconds_recorded?: number | null
          updated_at?: string | null
          words_preserved?: number | null
          xp_daily?: number | null
          xp_daily_reset_at?: string | null
          xp_total?: number | null
        }
        Update: {
          best_streak?: number | null
          corrections_count?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal?: number | null
          daily_goal_completed_at?: string | null
          daily_progress?: number | null
          id?: string
          last_contribution_date?: string | null
          recordings_count?: number | null
          reviews_count?: number | null
          streak_freeze_reset_at?: string | null
          streak_freeze_used?: boolean | null
          total_seconds_recorded?: number | null
          updated_at?: string | null
          words_preserved?: number | null
          xp_daily?: number | null
          xp_daily_reset_at?: string | null
          xp_total?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: string | null
          contribution_count: number | null
          created_at: string | null
          display_name: string | null
          home_island: string | null
          id: string
          is_public: boolean | null
          last_contributed_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          contribution_count?: number | null
          created_at?: string | null
          display_name?: string | null
          home_island?: string | null
          id: string
          is_public?: boolean | null
          last_contributed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          contribution_count?: number | null
          created_at?: string | null
          display_name?: string | null
          home_island?: string | null
          id?: string
          is_public?: boolean | null
          last_contributed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_contribution_history: {
        Row: {
          activity_type: string | null
          created_at: string | null
          details: string | null
          id: string | null
          metadata: Json | null
          status: string | null
          user_id: string | null
          xp_earned: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_dashboard: { Args: never; Returns: Json }
      admin_get_settings: { Args: never; Returns: Json }
      admin_list_activity: {
        Args: { p_limit?: number }
        Returns: {
          action: string
          actor_email: string
          actor_id: string
          actor_name: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }[]
      }
      admin_list_admins: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          role: string
          user_id: string
        }[]
      }
      admin_list_clips: {
        Args: {
          p_language?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: {
          audio_url: string
          contributed_by: string
          contributor_name: string
          correction_count: number
          created_at: string
          dialect: string
          duration: number
          id: string
          is_duplicate: boolean
          language: string
          reviewed_at: string
          reviewed_by: string
          status: string
          transcription: string
          transcription_history: Json
          updated_at: string
        }[]
      }
      admin_list_contributors: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          admin_role: string
          avatar: string
          contribution_count: number
          corrections_count: number
          created_at: string
          display_name: string
          email: string
          home_island: string
          id: string
          is_public: boolean
          last_contributed_at: string
          last_contribution_date: string
          recordings_count: number
          reviews_count: number
          updated_at: string
          xp_total: number
        }[]
      }
      admin_list_corrections: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: {
          audio_url: string
          clip_dialect: string
          clip_id: string
          clip_language: string
          created_at: string
          id: string
          original_text: string
          review_note: string
          reviewed_at: string
          reviewed_by: string
          status: string
          suggested_by: string
          suggested_text: string
          suggester_name: string
        }[]
      }
      admin_list_users: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          admin_role: string
          avatar: string
          contribution_count: number
          corrections_count: number
          created_at: string
          display_name: string
          email: string
          home_island: string
          id: string
          is_public: boolean
          last_contributed_at: string
          last_contribution_date: string
          recordings_count: number
          reviews_count: number
          updated_at: string
          xp_total: number
        }[]
      }
      admin_remove_admin: { Args: { p_user_id: string }; Returns: undefined }
      admin_review_correction: {
        Args: {
          p_correction_id: string
          p_decision: string
          p_review_note?: string
        }
        Returns: {
          clip_id: string
          created_at: string | null
          id: string
          original_text: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_by: string
          suggested_text: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "corrections"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_clip: {
        Args: {
          p_clip_id: string
          p_is_duplicate?: boolean
          p_status?: string
          p_transcription?: string
        }
        Returns: {
          audio_url: string
          contributed_by: string
          correction_count: number | null
          created_at: string | null
          dialect: string | null
          duration: number
          id: string
          is_duplicate: boolean | null
          language: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          transcription: string
          transcription_history: Json | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "clips"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_settings: { Args: { p_payload: Json }; Returns: Json }
      admin_update_user_profile: {
        Args: {
          p_avatar?: string
          p_display_name?: string
          p_home_island?: string
          p_is_public?: boolean
          p_user_id: string
        }
        Returns: {
          avatar: string | null
          contribution_count: number | null
          created_at: string | null
          display_name: string | null
          home_island: string | null
          id: string
          is_public: boolean | null
          last_contributed_at: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_admin: {
        Args: { p_role?: string; p_user_id: string }
        Returns: {
          created_at: string | null
          role: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_config"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assert_admin: { Args: never; Returns: undefined }
      assert_superadmin: { Args: never; Returns: undefined }
      calculate_streak: { Args: { user_uuid: string }; Returns: number }
      check_and_award_badges: {
        Args: { user_uuid: string }
        Returns: {
          badge_id: string
        }[]
      }
      get_clips_for_correction_v2: {
        Args: { p_language?: string; p_limit?: number; p_user_id: string }
        Returns: {
          audio_url: string
          contributed_by: string
          correction_count: number
          created_at: string
          dialect: string
          duration: number
          id: string
          is_duplicate: boolean
          language: string
          reviewed_at: string
          reviewed_by: string
          status: string
          transcription: string
          transcription_history: Json
        }[]
      }
      get_global_dataset_stats: { Args: never; Returns: Json }
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar: string
          corrections_count: number
          current_streak: number
          display_name: string
          rank: number
          recordings_count: number
          user_id: string
          xp_total: number
        }[]
      }
      get_leaderboard_position: { Args: { user_uuid: string }; Returns: number }
      get_site_data: { Args: never; Returns: Json }
      get_user_dashboard: { Args: { user_uuid: string }; Returns: Json }
      increment_contribution_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_correction_count: {
        Args: { clip_id: string }
        Returns: undefined
      }
      insert_admin_audit_log: {
        Args: {
          p_action: string
          p_after_state?: Json
          p_before_state?: Json
          p_entity_id: string
          p_entity_type: string
        }
        Returns: undefined
      }
      is_admin: { Args: { p_user_id?: string }; Returns: boolean }
      is_superadmin: { Args: { p_user_id?: string }; Returns: boolean }
      record_contribution: {
        Args: {
          activity_type: string
          metadata?: Json
          reference_id?: string
          user_uuid: string
        }
        Returns: {
          badge_earned: string
          streak_updated: boolean
          xp_earned: number
        }[]
      }
      record_contribution_v2: {
        Args: {
          activity_type: string
          metadata?: Json
          reference_id?: string
          user_uuid: string
        }
        Returns: Json
      }
      reset_daily_progress: { Args: never; Returns: undefined }
      review_correction_v2: {
        Args: {
          admin_uid: string
          correction_id: string
          decision: string
          review_note?: string
        }
        Returns: undefined
      }
      update_own_clip_transcription: {
        Args: { p_clip_id: string; p_new_text: string }
        Returns: undefined
      }
      update_own_correction: {
        Args: { p_correction_id: string; p_new_text: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
