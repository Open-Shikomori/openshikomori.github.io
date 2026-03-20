import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Edit3, User, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptionEditor } from './TranscriptionEditor';
import { JoinCommunityModal } from './JoinCommunityModal';
import { CorrectionQueue } from './CorrectionQueue';
import { ConvertToPermanentModal } from './ConvertToPermanentModal';
import { useAuth } from '../hooks/useAuth';
import { useCreateContribution, useUpdateProfile } from '../hooks/useContributions';
import { isSupabaseConfigured } from '../services/supabase';
import { useContribution } from '../context/ContributionContext';
import type { ContributionMethod, User as UserType } from '../types';

export function ContributionPanel() {
  const { t } = useTranslation();
  const [activeMethod, setActiveMethod] = useState<ContributionMethod>('record');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [recordingStep, setRecordingStep] = useState<'record' | 'transcribe'>('record');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const { user, loading: authLoading, hasPublicProfile, refreshUser } = useAuth();
  const { isSubmitting, error, success, submitContribution, reset } = useCreateContribution(user?.uid);
  const { isUpdating, updateProfile } = useUpdateProfile(user?.uid);
  const { convertAnonymousToPermanent, isAuthLoading, authError, clearAuthError } = useContribution();

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedBlob(blob);
    setRecordedDuration(duration);
    setRecordingStep('transcribe');
  };

  const handleCancelRecording = () => {
    setRecordedBlob(null);
    setRecordedDuration(0);
    setRecordingStep('record');
    reset();
  };

  const handleSubmitContribution = async (data: {
    transcription: string;
    language: 'comorian' | 'french' | 'arabic';
    dialect?: 'shingazidja' | 'shindzuani' | 'shimwali' | 'shimaore';
    duration: number;
  }) => {
    if (!recordedBlob || !user) return;

    const contribSuccess = await submitContribution(
      recordedBlob,
      data.transcription,
      data.language,
      data.dialect,
      data.duration,
      user.profile,
      !hasPublicProfile
    );

    if (contribSuccess) {
      setTimeout(() => {
        setRecordingStep('record');
        setRecordedBlob(null);
        setRecordedDuration(0);
        reset();
        refreshUser();
      }, 2000);
    }
  };

  const handleJoinCommunity = async (profile: UserType['profile']) => {
    if (!profile) return;
    const success = await updateProfile(profile);
    if (success) {
      setShowJoinModal(false);
      refreshUser();
    }
  };

  const handleConvert = async (email: string, password: string): Promise<boolean> => {
    clearAuthError();
    const success = await convertAnonymousToPermanent(email, password);
    if (success) {
      await refreshUser();
    }
    return success;
  };

  // Not configured state
  if (!isSupabaseConfigured) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">{t('auth.contributionPanel.notConfiguredTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('auth.contributionPanel.notConfiguredDescription')}
        </p>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="border border-border rounded-lg p-8 flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{t('auth.contributionPanel.loading')}</p>
      </div>
    );
  }

  // Not authenticated - should not happen since we redirect, but handle gracefully
  if (!user?.uid) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">{t('auth.contributionPanel.signInRequired')}</p>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('auth.contributionPanel.thankYou')}</h3>
        <p className="text-muted-foreground">
          {t('auth.contributionPanel.contributionSubmitted')}
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setRecordingStep('record');
            setRecordedBlob(null);
            setRecordedDuration(0);
          }}
          className="mt-6 h-11 px-6 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity"
        >
          {t('auth.contributionPanel.contributeAnother')}
        </button>
      </div>
    );
  }

  const userStats = user?.contributionCount || { recordings: 0, corrections: 0, reviews: 0 };
  const totalContributions = userStats.recordings + userStats.corrections;
  const isAnonymous = !hasPublicProfile;

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          {hasPublicProfile && user?.profile ? (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: user.profile.avatar ? undefined : '#0d9488' }}
            >
              {user.profile.avatar || '👤'}
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">
              {hasPublicProfile && user?.profile?.displayName
                ? user.profile.displayName
                : t('auth.contributionPanel.anonymousContributor')}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalContributions > 0
                ? `${totalContributions} ${totalContributions !== 1 ? t('auth.contributionPanel.contributions') : t('auth.contributionPanel.contribution')}`
                : t('auth.contributionPanel.readyToContribute')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAnonymous && (
            <button
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="h-9 px-4 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
            >
              {t('auth.contributionPanel.createAccount')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className="h-9 w-9 flex items-center justify-center rounded hover:bg-muted transition-colors"
            title={t('auth.contributionPanel.settings')}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveMethod('record')}
          className={`flex-1 h-12 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors relative ${
            activeMethod === 'record'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">{t('auth.contributionPanel.recordAudio')}</span>
          <span className="sm:hidden">{t('auth.contributionPanel.record')}</span>
          {activeMethod === 'record' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveMethod('correct')}
          className={`flex-1 h-12 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors relative ${
            activeMethod === 'correct'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('auth.contributionPanel.correctTranscriptions')}</span>
          <span className="sm:hidden">{t('auth.contributionPanel.correct')}</span>
          {activeMethod === 'correct' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="border border-border rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">
            {error}
          </div>
        )}

        {activeMethod === 'record' ? (
          recordingStep === 'record' ? (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={handleCancelRecording}
            />
          ) : (
            <TranscriptionEditor
              audioUrl={recordedBlob ? URL.createObjectURL(recordedBlob) : null}
              duration={recordedDuration}
              onSubmit={handleSubmitContribution}
              onBack={handleCancelRecording}
              isSubmitting={isSubmitting}
            />
          )
        ) : (
          <CorrectionQueue userId={user?.uid} />
        )}
      </div>

      {/* Convert to Permanent Modal (for anonymous users) */}
      <ConvertToPermanentModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvert}
        isLoading={isAuthLoading}
        error={authError}
      />

      {/* Join Community Modal (for updating profile) */}
      <JoinCommunityModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinCommunity}
        isSubmitting={isUpdating}
      />
    </div>
  );
}
