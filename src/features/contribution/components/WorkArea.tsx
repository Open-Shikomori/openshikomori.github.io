import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ContributionMode, ContributionHistoryItem } from './types';
import { Mic, Edit3, History, ArrowLeft, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatInputRecord } from './ChatInputRecord';
import { ChatFeedCorrect } from './ChatFeedCorrect';
import { ChatFeedRecord } from './ChatFeedRecord';
import { generateAIContent } from '@/lib/openrouter';

interface WorkAreaProps {
  mode: ContributionMode;
  userId: string;
  onContributionComplete: (type: 'record' | 'correct') => void;
  selectedItem?: ContributionHistoryItem | null;
  onModeChange?: (mode: ContributionMode) => void;
  onBackToWork?: () => void;
}

export function WorkArea({ mode, userId, onContributionComplete, selectedItem, onModeChange, onBackToWork }: WorkAreaProps) {
  const { t, i18n } = useTranslation();
  const [pendingRecording, setPendingRecording] = useState<{
    blob: Blob, 
    duration: number,
    language: string,
    dialect?: string
  } | null>(null);
  const [suggestedPhrase, setSuggestedPhrase] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleRecordingComplete = (blob: Blob, duration: number, metadata: { language: string, dialect?: string }) => {
    setPendingRecording({
      blob, 
      duration,
      ...metadata
    });
    // Clear suggestion once recording is done for it
    setSuggestedPhrase(null);
  };

  const handleGetSuggestion = async (dialect?: string) => {
    if (isSuggesting) return; // Prevent multiple concurrent requests
    setIsSuggesting(true);
    try {
      const resolvedLang = i18n.resolvedLanguage || 'fr';
      const baseLang = resolvedLang.split('-')[0];
      
      const langNames: Record<string, string> = {
        'fr': 'French',
        'en': 'English',
        'ar': 'Arabic'
      };

      const targetLangName = langNames[baseLang] || langNames[resolvedLang] || 'French';

      const prompt = `Generate a natural, conversational text in ${targetLangName}. 
      This text will be used as a prompt for a Comorian speaker to record a native translation in their dialect (${dialect || 'any'}). 
      The goal is to create a high-quality dataset for training Comorian Large Language Models (LLMs) and Speech-to-Text (Whisper) models.
      
      Guidelines:
      - Topic: Daily life, Comorian culture, family, or common work scenarios.
      - Style: Spontaneous and conversational, not overly formal.
      - Linguistic variety: Include varied sentence structures (questions, descriptions).
      - Length: Approximately 30-45 seconds of clear speech when translated (roughly 4-6 sentences).
      
      Provide ONLY the text in ${targetLangName}, with no introduction, labels, or translations.`;
      
      const phrase = await generateAIContent(prompt);
      setSuggestedPhrase(phrase.trim());
    } catch (error) {
      console.error('Failed to get suggestion:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTranscriptionComplete = async (data: any) => {
    // In a real app, send to server. For now, simulate delay and clear.
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPendingRecording(null);
    onContributionComplete('record');
    // Get a fresh suggestion for the next recording
    handleGetSuggestion();
  };

  // Trigger initial suggestion on mount
  useEffect(() => {
    if (mode === 'record' && !suggestedPhrase && !isSuggesting) {
      handleGetSuggestion();
    }
  }, [mode]);

  // 1. Review Mode (When a history item is selected)
  if (selectedItem) {
    return (
      <div className="flex-1 flex flex-col w-full bg-background">
        <div className="h-14 border-b border-border flex items-center px-4">
           <Button variant="ghost" size="sm" onClick={onBackToWork} className="gap-2 -ml-2 text-muted-foreground">
             <ArrowLeft className="h-4 w-4" />
             {t('contribution.chat.backToChat')}
           </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('contribution.review.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedItem.date).toLocaleDateString()} {t('contribution.time.at')} {new Date(selectedItem.date).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="p-6 rounded-xl bg-muted/30 border border-border space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <Info className="h-3.5 w-3.5" />
                {t('contribution.review.details')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.type')}</p>
                  <p className="text-sm font-medium capitalize">{selectedItem.type === 'record' ? t('contribution.sidebar.recorded') : t('contribution.sidebar.corrected')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.status')}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      selectedItem.status === 'approved' ? "bg-green-500" : selectedItem.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                    )} />
                    <p className="text-sm font-medium capitalize">{t(`contribution.history.status.${selectedItem.status}`)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-muted/30 border border-border space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <FileText className="h-3.5 w-3.5" />
                {t('contribution.review.content')}
              </div>
              <p className="text-lg font-medium italic">"{selectedItem.details}"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Chat Layout
  return (
    <div className="flex-1 flex flex-col w-full bg-background">
      {/* Top Bar - Mode Switcher */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center sticky top-0 z-10">
        <div className="flex bg-muted p-1 rounded-none">
          <button 
            onClick={() => onModeChange?.('record')} 
            className={cn("flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-none transition-all", mode === 'record' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Mic className="h-4 w-4" />
            {t('contribution.modes.record', { defaultValue: 'Record Audio' })}
          </button>
          <button 
            onClick={() => onModeChange?.('correct')} 
            className={cn("flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-none transition-all", mode === 'correct' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Edit3 className="h-4 w-4" />
            {t('contribution.modes.correct', { defaultValue: 'Review & Edit' })}
          </button>
        </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col">
        {mode === 'record' ? (
           <ChatFeedRecord 
             userId={userId} 
             pendingRecording={pendingRecording}
             suggestedPhrase={suggestedPhrase}
             onSubmit={handleTranscriptionComplete}
             onDiscard={() => setPendingRecording(null)}
           />
        ) : (
           <ChatFeedCorrect userId={userId} onComplete={() => onContributionComplete('correct')} />
        )}
      </div>

      {/* Bottom Input Area */}
      {mode === 'record' && (
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
          <ChatInputRecord 
            onComplete={handleRecordingComplete} 
            onGetSuggestion={handleGetSuggestion}
            isSuggesting={isSuggesting}
            suggestedPhrase={suggestedPhrase}
          />
        </div>
      )}
    </div>
  );
}
