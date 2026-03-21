import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send, RotateCcw, CheckCircle, MapPin, SkipForward, Bot, Languages } from 'lucide-react';
import { useCorrectionQueue, useSubmitCorrection } from '../hooks/useContributions';
import { ClipPlayer } from './ClipPlayer';
import type { Clip } from '@/types/contribution';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ChatFeedCorrectProps {
  userId: string | undefined;
  onComplete?: () => void;
}

function CorrectionBubble({
  clip,
  userId,
  onCorrected,
  onSkip,
}: {
  clip: Clip;
  userId: string | undefined;
  onCorrected: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [suggestedText, setSuggestedText] = useState(clip.transcription.text || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isSubmitting, error, submitCorrection } = useSubmitCorrection(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedText.trim()) return;

    const success = await submitCorrection(
      clip.id,
      clip.transcription.text,
      suggestedText.trim()
    );

    if (success) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onCorrected();
      }, 1500);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex gap-3 w-full">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-none p-4 text-center w-full"
        >
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-700 dark:text-green-300 text-sm">{t('contribution.chat.thanks')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-3 w-full"
    >
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs font-semibold text-muted-foreground ml-1">{t('contribution.chat.communityTask')}</span>
        <div className="bg-card border border-border rounded-none p-5 shadow-sm space-y-4">
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded-none">
            <div className="flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5" />
              <span>{t(`contribution.languages.${clip.language}`)}</span>
              {clip.dialect && (
                <>
                  <span className="opacity-50">·</span>
                  <MapPin className="h-3 w-3" />
                  <span>{t(`contribution.dialects.${clip.dialect}`)}</span>
                </>
              )}
            </div>
            <span>{Math.round(clip.duration)}s</span>
          </div>

          {/* Audio Player */}
          <ClipPlayer audioUrl={clip.audioUrl} duration={clip.duration} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-none"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest pl-1">
                {t('contribution.chat.editTranscription')}
              </label>
              <textarea
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                placeholder={t('contribution.chat.editPlaceholder')}
                className="w-full p-3.5 rounded-none border border-input bg-background/50 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-colors"
                required
              />
            </div>
            
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="flex-1 rounded-none h-10 gap-2"
              >
                <SkipForward className="h-4 w-4" />
                {t('contribution.chat.skip')}
              </Button>
              <Button
                type="submit"
                disabled={!suggestedText.trim() || isSubmitting}
                className="flex-[2] rounded-none h-10 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t('contribution.chat.submitCorrection')}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </motion.div>
  );
}

export function ChatFeedCorrect({ userId, onComplete }: ChatFeedCorrectProps) {
  const { t } = useTranslation();
  const { clips, loading, error, refetch } = useCorrectionQueue(userId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-muted-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">{t('contribution.chat.loadingTasks')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{error}</p>
        <Button onClick={refetch} variant="outline" className="rounded-full gap-2">
          <RotateCcw className="h-4 w-4" /> {t('contribution.chat.tryAgain')}
        </Button>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50 dark:ring-green-900/10"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{t('contribution.chat.allCaughtUp')}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-8">
          {t('contribution.chat.noPending')}
        </p>
        <Button onClick={refetch} variant="outline" className="rounded-full gap-2">
          <RotateCcw className="h-4 w-4" /> {t('contribution.chat.checkNewTasks')}
        </Button>
      </div>
    );
  }

  const currentClip = clips[currentIndex];

  const handleCorrected = () => {
    if (onComplete) onComplete();
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      refetch();
      setCurrentIndex(0);
    }
  };

  const handleSkip = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-end min-h-full pb-4 gap-6">
      {/* We could render history here, but showing just the active task keeps it focused */}
      <AnimatePresence mode="wait">
        <CorrectionBubble
          key={currentClip.id}
          clip={currentClip}
          userId={userId}
          onCorrected={handleCorrected}
          onSkip={handleSkip}
        />
      </AnimatePresence>
    </div>
  );
}
