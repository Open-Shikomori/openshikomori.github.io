import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Trash2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranscriptionEditor } from './TranscriptionEditor';
import { useTranslation } from 'react-i18next';

interface ChatFeedRecordProps {
  userId: string;
  pendingRecording: { blob: Blob; duration: number; language: string; dialect?: string } | null;
  suggestedPhrase: string | null;
  onSubmit: (data: any) => Promise<void>;
  onDiscard: () => void;
}

export function ChatFeedRecord({ userId, pendingRecording, onSubmit, onDiscard }: ChatFeedRecordProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-end gap-6 min-h-full pb-4">
      <AnimatePresence mode="popLayout">
        {!pendingRecording && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 h-full text-center text-muted-foreground"
          >
            <div className="h-16 w-16 bg-muted/50 rounded-none flex items-center justify-center mb-4 ring-1 ring-border shadow-inner">
              <Mic className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm max-w-md leading-relaxed font-medium">
              {t('contribution.chat.onboarding')}
            </p>
          </motion.div>
        )}

        {pendingRecording && (
          <motion.div 
            key="recording"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex gap-3 justify-center w-full"
          >
            <div className="flex flex-col gap-1.5 w-full">
              <div className="bg-card border border-border text-foreground p-5 rounded-none shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {t('contribution.chat.reviewAndTranscribe')}
                  </span>
                  <Button variant="ghost" size="sm" onClick={onDiscard} className="h-7 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none transition-colors">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> {t('contribution.chat.discard')}
                  </Button>
                </div>
                
                <TranscriptionEditor 
                  audioUrl={URL.createObjectURL(pendingRecording.blob)}
                  onSubmit={handleSubmit}
                  onBack={onDiscard}
                  isSubmitting={isSubmitting}
                  initialLanguage={pendingRecording.language as any}
                  initialDialect={pendingRecording.dialect as any}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
