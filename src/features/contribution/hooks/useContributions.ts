import { useState, useEffect, useCallback } from 'react';
import type { Clip, Correction, User, LanguageOption, DialectOption } from '@/types/contribution';
import {
  createClip,
  getClipsForCorrection,
  createCorrection,
  getUserClips,
  updateUserProfile,
  isUserAdmin,
  getPendingCorrections,
  reviewCorrection as reviewCorrectionService,
} from '../services/clips';
import { uploadAudioClip } from '../services/r2';

// Hook for creating a new contribution (Method 1)
export function useCreateContribution(userId: string | undefined) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitContribution = useCallback(async (
    audioBlob: Blob,
    transcription: string,
    language: LanguageOption['code'],
    dialect: DialectOption['code'] | undefined,
    durationSeconds: number,
    contributorProfile: User['profile'],
    isAnonymous: boolean
  ): Promise<string | null> => {
    if (!userId) {
      setError('You must be signed in to contribute');
      return null;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // First create a temporary ID for R2 (we don't have the DB ID yet)
      const tempId = `clip_${Date.now()}`;

      // Upload audio to R2
      const uploadResult = await uploadAudioClip(audioBlob, userId, tempId);

      if (!uploadResult.success || !uploadResult.url) {
        setError(uploadResult.error || 'Failed to upload audio');
        setIsSubmitting(false);
        return null;
      }

      // Use the actual recorded duration (passed from component)
      const duration = Math.max(1, Math.round(durationSeconds)); // Ensure at least 1 second and integer

      const clipId = await createClip({
        audioUrl: uploadResult.url,
        duration,
        language,
        dialect,
        transcription: {
          text: transcription,
          source: 'manual',
        },
        contributedBy: userId,
        contributorProfile: isAnonymous ? undefined : contributorProfile,
        isAnonymous,
      });

      if (!clipId) {
        throw new Error('Failed to create clip in database');
      }

      setSuccess(true);
      setIsSubmitting(false);
      return clipId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit contribution';
      setError(message);
      setIsSubmitting(false);
      return null;
    }
  }, [userId]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isSubmitting,
    error,
    success,
    submitContribution,
    reset,
  };
}

// Hook for fetching clips to correct (Method 2)
export function useCorrectionQueue(userId: string | undefined, language?: LanguageOption['code']) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClips = useCallback(async () => {
    if (!userId) {
      setClips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getClipsForCorrection(userId, language, 20);
      setClips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load clips';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  return {
    clips,
    loading,
    error,
    refetch: fetchClips,
  };
}

// Hook for submitting a correction
export function useSubmitCorrection(userId: string | undefined) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCorrection = useCallback(async (
    clipId: string,
    originalText: string,
    suggestedText: string
  ): Promise<boolean> => {
    if (!userId) {
      setError('You must be signed in to submit corrections');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCorrection({
        clipId,
        originalText,
        suggestedText,
        suggestedBy: userId,
      });

      setIsSubmitting(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit correction';
      setError(message);
      setIsSubmitting(false);
      return false;
    }
  }, [userId]);

  return {
    isSubmitting,
    error,
    submitCorrection,
  };
}

// Hook for user contributions
export function useUserContributions(userId: string | undefined) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    if (!userId) {
      setClips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserClips(userId);
      setClips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load contributions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return {
    clips,
    loading,
    error,
    refetch: fetchContributions,
  };
}

// Hook for updating user profile
export function useUpdateProfile(userId: string | undefined) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = useCallback(async (profile: User['profile']): Promise<boolean> => {
    if (!userId) {
      setError('You must be signed in to update your profile');
      return false;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile(userId, profile);
      setSuccess(true);
      setIsUpdating(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      setIsUpdating(false);
      return false;
    }
  }, [userId]);

  const reset = useCallback(() => {
    setIsUpdating(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isUpdating,
    error,
    success,
    updateProfile,
    reset,
  };
}

// Hook for checking admin status
export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!userId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const admin = await isUserAdmin(userId);
        setIsAdmin(admin);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [userId]);

  return { isAdmin, loading };
}

// Hook for admin correction review
export function useAdminReview(adminId: string | undefined) {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCorrections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPendingCorrections(50);
      setCorrections(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load corrections';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCorrections();
  }, [fetchPendingCorrections]);

  const reviewCorrection = useCallback(async (
    correctionId: string,
    decision: 'approved' | 'rejected',
    reviewNote?: string
  ): Promise<boolean> => {
    if (!adminId) return false;

    try {
      await reviewCorrectionService(correctionId, decision, adminId, reviewNote);
      // Refresh the list
      await fetchPendingCorrections();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
      return false;
    }
  }, [adminId, fetchPendingCorrections]);

  return {
    corrections,
    loading,
    error,
    reviewCorrection,
    refetch: fetchPendingCorrections,
  };
}
