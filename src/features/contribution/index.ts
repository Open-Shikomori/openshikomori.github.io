// Types
export * from '@/types/contribution';

// Services
export { supabase, isSupabaseConfigured, getCurrentUser, signOut } from './services/supabase';
export {
  createClip,
  getClipsForCorrection,
  getClip,
  createCorrection,
  getPendingCorrections,
  reviewCorrection,
  getUserClips,
  updateUserProfile,
  isUserAdmin,
} from './services/clips';
export { uploadAudioClip, isR2Configured } from './services/r2';

// Context
export { ContributionProvider, useContribution } from './context/ContributionContext';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useAudioRecorder, formatDuration } from './hooks/useAudioRecorder';
export { useTranscription, isTranscriptionSupported } from './hooks/useTranscription';
export {
  useCreateContribution,
  useCorrectionQueue,
  useSubmitCorrection,
  useUserContributions,
  useUpdateProfile,
  useIsAdmin,
  useAdminReview,
} from './hooks/useContributions';

// Components
export { AudioRecorder } from './components/AudioRecorder';
export { TranscriptionEditor } from './components/TranscriptionEditor';
export { ContributionPanel } from './components/ContributionPanel';
export { JoinCommunityModal } from './components/JoinCommunityModal';
export { ClipPlayer } from './components/ClipPlayer';
export { CorrectionQueue } from './components/CorrectionQueue';
export { EntryChoiceModal } from './components/EntryChoiceModal';
export { ProfileSetupModal } from './components/ProfileSetupModal';
export { ConvertToPermanentModal } from './components/ConvertToPermanentModal';

// Pages
export { ContributePage } from './pages/ContributePage';
export { ReviewPage } from './pages/ReviewPage';

// Layouts
export { ContributeLayout } from './ui/ContributeLayout';

// Data
export { avatarOptions, getAvatarById, getDefaultAvatar } from './data/avatars';
