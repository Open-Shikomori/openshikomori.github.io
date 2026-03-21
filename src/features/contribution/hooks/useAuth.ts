import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { User } from '@/types/contribution';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  hasPublicProfile: boolean;
}

export function useAuth(): AuthState & {
  refreshUser: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    hasPublicProfile: false,
  });

  const fetchUserDoc = useCallback(async (userId: string): Promise<User | null> => {
    if (!supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        // Create new user document for email/password users
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            is_public: false,
            contribution_count: 0,
          });

        if (createError) throw createError;

        return {
          uid: userId,
          contributionCount: { recordings: 0, corrections: 0, reviews: 0 },
          createdAt: new Date(),
          lastActiveAt: new Date(),
        } as User;
      }

      return {
        uid: userId,
        contributionCount: {
          recordings: profile.contribution_count || 0,
          corrections: 0,
          reviews: 0,
        },
        profile: profile.is_public
          ? {
              displayName: profile.display_name || '',
              avatar: profile.avatar || '',
              homeIsland: profile.home_island || undefined,
              isPublic: true,
            }
          : undefined,
        createdAt: profile.created_at ? new Date(profile.created_at) : null,
        lastActiveAt: profile.updated_at ? new Date(profile.updated_at) : null,
      };
    } catch (err) {
      console.error('Error fetching/creating user doc:', err);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const userDoc = await fetchUserDoc(user.id);
      setState((prev) => ({
        ...prev,
        user: userDoc,
        hasPublicProfile: !!userDoc?.profile?.isPublic,
      }));
    }
  }, [fetchUserDoc]);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Check for existing session
    const initAuth = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userDoc = await fetchUserDoc(session.user.id);
        setState({
          user: userDoc,
          loading: false,
          error: null,
          hasPublicProfile: !!userDoc?.profile?.isPublic,
        });
      } else {
        // No session - user needs to sign in
        setState({
          user: null,
          loading: false,
          error: null,
          hasPublicProfile: false,
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid race conditions with Supabase client
          setTimeout(() => {
            fetchUserDoc(session.user.id).then((userDoc) => {
              setState({
                user: userDoc,
                loading: false,
                error: null,
                hasPublicProfile: !!userDoc?.profile?.isPublic,
              });
            });
          }, 0);
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
            hasPublicProfile: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserDoc]);

  return {
    ...state,
    refreshUser,
  };
}
