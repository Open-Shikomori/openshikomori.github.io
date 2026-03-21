import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { avatarOptions, getAvatarById } from '../data/avatars';
import type { User } from '@/types/contribution';
import {
  ResponsiveModal,
  ResponsiveModalContainer,
  ResponsiveModalScrollable,
} from './ResponsiveModal';

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: User['profile'] | undefined) => void;
  isSubmitting?: boolean;
}

export function JoinCommunityModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: JoinCommunityModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]!.id);
  const [isPublic, setIsPublic] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    onSubmit({
      displayName: displayName.trim(),
      avatar: selectedAvatar,
      isPublic,
    });
  };

  const selectedAvatarData = getAvatarById(selectedAvatar);
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalContainer className="bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Join the Community</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ResponsiveModalScrollable className="px-4 py-4">
          <div className="p-6 bg-muted/50 flex flex-col items-center rounded-xl">
            {selectedAvatarData && (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-4xl shadow-lg mb-3"
                style={{ backgroundColor: selectedAvatarData.bgColor }}
              >
                {selectedAvatarData.emoji}
              </div>
            )}
            <p className="text-lg font-medium">
              {displayName.trim() || 'Your Name'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPublic ? 'Public Contributor' : 'Anonymous Contributor'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Choose a name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Khadija, Ali, or any name"
                className="w-full h-10 px-3 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={30}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Choose an avatar</label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      selectedAvatar === avatar.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: avatar.bgColor }}
                    title={avatar.label}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded bg-muted/50">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary"
              />
              <label htmlFor="isPublic" className="text-sm cursor-pointer">
                <span className="font-medium">Appear in the contributor cloud</span>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Your name and avatar will be shown on the homepage alongside other contributors.
                </p>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={!displayName.trim() || isSubmitting}
                className="flex-1 h-10 px-4 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : 'Join Community'}
              </button>
            </div>
          </form>
        </ResponsiveModalScrollable>
      </ResponsiveModalContainer>
    </ResponsiveModal>
  );
}
