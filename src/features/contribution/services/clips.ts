import { supabase, isSupabaseConfigured } from './supabase';
import type { Clip, Correction, User } from '@/types/contribution';

// Create a new clip
export async function createClip(
  clipData: Omit<Clip, 'id' | 'contributedAt' | 'status' | 'correctionsCount' | 'isDuplicate' | 'transcriptionHistory' | 'reviewedBy' | 'reviewedAt'>
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase
    .from('clips')
    .insert({
      audio_url: clipData.audioUrl,
      duration: clipData.duration,
      language: clipData.language,
      dialect: clipData.dialect || null,
      transcription: clipData.transcription.text,
      contributed_by: clipData.contributedBy,
      status: 'pending',
      correction_count: 0,
      is_duplicate: false,
      transcription_history: [
        {
          text: clipData.transcription.text,
          source: 'original',
          created_at: new Date().toISOString(),
          contributed_by: clipData.contributedBy,
        },
      ],
    })
    .select('id')
    .single();

  if (error) throw error;

  return data?.id || null;
}

// Get clips for correction (Method 2)
export async function getClipsForCorrection(
  userId: string,
  language?: 'comorian' | 'french' | 'arabic',
  maxResults = 20
): Promise<Clip[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_clips_for_correction_v2', {
    p_user_id: userId,
    p_language: language || undefined,
    p_limit: maxResults,
  });

  if (error) {
    console.error('Error fetching clips:', error);
    return [];
  }

  return (data || []).map(convertClipRow);
}

// Get a single clip by ID
export async function getClip(clipId: string): Promise<Clip | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('id', clipId)
    .single();

  if (error || !data) return null;

  return convertClipRow(data);
}

// Create a correction suggestion
export async function createCorrection(
  correction: Omit<Correction, 'id' | 'suggestedAt' | 'status' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase
    .from('corrections')
    .insert({
      clip_id: correction.clipId,
      original_text: correction.originalText,
      suggested_text: correction.suggestedText,
      suggested_by: correction.suggestedBy,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;

  return data?.id || null;
}

// Get pending corrections for admin review
export async function getPendingCorrections(
  maxResults = 50
): Promise<Correction[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('corrections')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(maxResults);

  if (error) {
    console.error('Error fetching corrections:', error);
    return [];
  }

  return (data || []).map(convertCorrectionRow);
}

// Approve or reject a correction (admin only)
export async function reviewCorrection(
  correctionId: string,
  decision: 'approved' | 'rejected',
  adminUid: string,
  reviewNote?: string
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('review_correction_v2', {
    correction_id: correctionId,
    decision,
    admin_uid: adminUid,
    review_note: reviewNote || undefined,
  });

  if (error) throw error;
}

// Get user clips
export async function getUserClips(userId: string): Promise<Clip[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('contributed_by', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching user clips:', error);
    return [];
  }

  return (data || []).map(convertClipRow);
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  profile: User['profile']
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase
    .from('users')
    .update({
      display_name: profile?.displayName || null,
      avatar: profile?.avatar || null,
      home_island: profile?.homeIsland || null,
      is_public: profile?.isPublic ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

// Update own clip transcription
export async function updateOwnClipTranscription(clipId: string, newText: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('update_own_clip_transcription', {
    p_clip_id: clipId,
    p_new_text: newText,
  });

  if (error) throw error;
}

// Update own correction
export async function updateOwnCorrection(correctionId: string, newText: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('update_own_correction', {
    p_correction_id: correctionId,
    p_new_text: newText,
  });

  if (error) throw error;
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

// Helper functions to convert database rows to types
function convertClipRow(row: any): Clip {
  return {
    id: row.id,
    audioUrl: row.audio_url,
    duration: row.duration,
    language: row.language as 'comorian' | 'french' | 'arabic',
    dialect: (row.dialect as any) || undefined,
    transcription: {
      text: row.transcription,
      source: 'manual',
    },
    contributedBy: row.contributed_by,
    contributedAt: row.created_at ? new Date(row.created_at) : null,
    status: (row.status as any) || 'pending',
    correctionsCount: row.correction_count || 0,
    isDuplicate: row.is_duplicate || false,
    isAnonymous: false,
    transcriptionHistory: (row.transcription_history as any) || [],
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
  };
}

function convertCorrectionRow(row: any): Correction {
  return {
    id: row.id,
    clipId: row.clip_id,
    originalText: row.original_text,
    suggestedText: row.suggested_text,
    suggestedBy: row.suggested_by,
    suggestedAt: row.created_at ? new Date(row.created_at) : null,
    status: (row.status as any) || 'pending',
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
    reviewNote: row.review_note || null,
  };
}

