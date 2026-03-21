import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send, RotateCcw, CheckCircle, Languages, MapPin, SkipForward } from 'lucide-react';
import { useCorrectionQueue, useSubmitCorrection } from '../hooks/useContributions';
import { ClipPlayer } from './ClipPlayer';
import type { Clip, LanguageOption, DialectOption } from '@/types/contribution';

const languageLabels: Record<LanguageOption['code'], { en: string; fr: string }> = {
  comorian: { en: 'Comorian', fr: 'Comorien' },
  french: { en: 'French', fr: 'Français' },
  arabic: { en: 'Arabic', fr: 'Arabe' },
};

const dialectLabels: Record<DialectOption['code'], string> = {
  shingazidja: 'Shingazidja',
  shindzuani: 'Shindzuani',
  shimwali: 'Shimwali',
  shimaore: 'Shimaore',
};

interface CorrectionQueueProps {
  userId: string | undefined;
  onComplete?: () => void;
}

function CorrectionCard({
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
  const [suggestedText, setSuggestedText] = useState('');
  const [showForm, setShowForm] = useState(false);
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
        setSuggestedText('');
        setShowForm(false);
        setIsSubmitted(false);
        onCorrected();
      }, 1500);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center"
      >
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-700 dark:text-green-300">Correction submitted!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-xl overflow-hidden bg-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {languageLabels[clip.language]?.en || clip.language}
        </span>
        {clip.dialect && (
          <>
            <span className="text-muted-foreground">·</span>
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{dialectLabels[clip.dialect]}</span>
          </>
        )}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{Math.round(clip.duration)}s</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Audio Player */}
        <ClipPlayer audioUrl={clip.audioUrl} duration={clip.duration} />

        {/* Current Transcription */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Current transcription
          </p>
          <p className="text-sm">
            {clip.transcription.text || <em className="text-muted-foreground">No transcription yet</em>}
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Your correction
              </label>
              <textarea
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                placeholder="Type the corrected transcription..."
                className="w-full mt-1 p-3 rounded-lg border border-input bg-background text-sm resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!suggestedText.trim() || isSubmitting}
                className="flex-1 h-10 bg-primary text-primary-foreground font-medium rounded-lg text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 h-10 border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex-1 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg text-sm font-medium transition-colors"
            >
              Suggest Correction
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CorrectionQueue({ userId, onComplete }: CorrectionQueueProps) {
  const { clips, loading, error, refetch } = useCorrectionQueue(userId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading clips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-4 h-10 px-6 text-sm font-medium text-primary hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="h-8 w-8 text-green-500" />
        </motion.div>
        <p className="font-medium text-lg">All caught up!</p>
        <p className="text-sm text-muted-foreground mt-1">
          No clips need correction right now. Check back later.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-6 h-10 px-6 text-sm font-medium text-primary hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
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
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Clip {currentIndex + 1} of {clips.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="text-sm text-primary hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / clips.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current Card */}
      <CorrectionCard
        key={currentClip.id}
        clip={currentClip}
        userId={userId}
        onCorrected={handleCorrected}
        onSkip={handleSkip}
      />
    </div>
  );
}
