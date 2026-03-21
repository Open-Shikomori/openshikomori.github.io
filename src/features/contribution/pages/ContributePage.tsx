import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { ContributionWorkspace } from '../components/ContributionWorkspace';
import { JoinCommunityModal } from '../components/JoinCommunityModal';
import { ConvertToPermanentModal } from '../components/ConvertToPermanentModal';
import { useAuth } from '../hooks/useAuth';
import { useUpdateProfile } from '../hooks/useContributions';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';
import { useContribution } from '../context/ContributionContext';
import type { User } from '@/types/contribution';

export function ContributePage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const { updateProfile, isUpdating } = useUpdateProfile(user?.uid);
  const { convertAnonymousToPermanent } = useContribution();

  useEffect(() => {
    if (!loading && !user?.uid) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleJoinCommunity = async (profile: User['profile'] | undefined) => {
    if (!profile) return;
    const success = await updateProfile(profile);

    if (success) {
      setShowJoinModal(false);
      refreshUser();
    }
  };

  const handleConvert = async (email: string, password: string) => {
    return await convertAnonymousToPermanent(email, password);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">System Not Configured</h1>
          <p className="text-muted-foreground">Supabase environment variables are missing.</p>
        </div>
      </div>
    );
  }

  // Show loading while checking auth or redirecting
  if (loading || !user?.uid) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contribute | OpenShikomori</title>
        <meta name="description" content="Contribute to the Comorian language voice dataset. Record audio or help correct transcriptions." />
      </Helmet>

      <ContributionWorkspace
        user={user}
      />

      {/* Join Community Modal (for updating profile) */}
      <JoinCommunityModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinCommunity}
        isSubmitting={isUpdating}
      />

      {/* Convert to Permanent Modal (for anonymous users) */}
      <ConvertToPermanentModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvert}
        isLoading={isUpdating}
        error={null}
      />
    </>
  );
}
