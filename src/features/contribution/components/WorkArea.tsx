import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributionMode } from '@/types/contribution';
import type { ContributionHistoryItem } from '@/types/contribution-ui';
import { Mic, Edit3, History, ArrowLeft, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatInputRecord } from './ChatInputRecord';
import { ChatFeedCorrect } from './ChatFeedCorrect';
import { ChatFeedRecord } from './ChatFeedRecord';
import { generateAIContent } from '@/lib/openrouter';
import { useCreateContribution } from '../hooks/useContributions';
import { toast } from 'sonner';
import { updateOwnClipTranscription, updateOwnCorrection } from '../services/clips';
import { ClipPlayer } from './ClipPlayer';

interface WorkAreaProps {
  mode: ContributionMode;
  userId: string;
  onContributionComplete: () => void;
  selectedItem?: ContributionHistoryItem | null;
  onModeChange?: (mode: ContributionMode) => void;
  onBackToWork?: () => void;
  history?: ContributionHistoryItem[];
  onSelectItem?: (item: ContributionHistoryItem | null) => void;
}

export function WorkArea({ 
  mode, 
  userId, 
  onContributionComplete, 
  selectedItem, 
  onModeChange, 
  onBackToWork,
  history = [],
  onSelectItem
}: WorkAreaProps) {
  const { t, i18n } = useTranslation();
  const [pendingRecording, setPendingRecording] = useState<{
    blob: Blob, 
    duration: number,
    language: string,
    dialect?: string
  } | null>(null);
  const [suggestedPhrase, setSuggestedPhrase] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const suggestingRef = useRef(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Reset edit state when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setIsEditing(false);
      setEditValue(selectedItem.details);
    }
  }, [selectedItem]);

  const handleSaveEdit = async () => {
    if (!selectedItem || !selectedItem.referenceId || !editValue.trim()) return;

    setIsSavingEdit(true);
    try {
      if (selectedItem.type === 'record') {
        await updateOwnClipTranscription(selectedItem.referenceId, editValue.trim());
      } else {
        await updateOwnCorrection(selectedItem.referenceId, editValue.trim());
      }
      toast.success(t('contribution.chat.success', { defaultValue: 'Update saved!' }));
      setIsEditing(false);
      if (onBackToWork) onBackToWork(); // Go back to refresh the list
      if (onSelectItem) onSelectItem(null); // Close review mode
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error(t('contribution.chat.error', { defaultValue: 'Failed to update.' }));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const { submitContribution } = useCreateContribution(userId);

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
    if (suggestingRef.current) return; // Prevent multiple concurrent requests synchronously
    
    suggestingRef.current = true;
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
      suggestingRef.current = false;
    }
  };

  const handleTranscriptionComplete = async (data: any) => {
    if (!pendingRecording || !userId) return;

    try {
      // Use the actual service to submit
      const clipId = await submitContribution(
        pendingRecording.blob,
        data.transcription,
        data.language as any,
        data.dialect as any,
        data.duration,
        undefined, // We'll let the service handle profile or lack thereof
        false      // isAnonymous
      );

      if (clipId) {
        setPendingRecording(null);
        // Triggers handle the stats, we just notify completion
        onContributionComplete();
        toast.success(t('contribution.chat.success', { defaultValue: 'Contribution recorded!' }));
        // Get a fresh suggestion for the next recording
        handleGetSuggestion();
      } else {
        toast.error(t('contribution.chat.error', { defaultValue: 'Failed to save contribution.' }));
      }
    } catch (error) {
      console.error('Failed to submit contribution:', error);
      toast.error(t('contribution.chat.error', { defaultValue: 'Failed to save contribution.' }));
    }
  };

  // Trigger initial suggestion on mount or mode change
  useEffect(() => {
    if (mode === 'record' && !suggestedPhrase && !isSuggesting && !suggestingRef.current && !selectedItem) {
      handleGetSuggestion();
    }
  }, [mode, suggestedPhrase, isSuggesting, selectedItem]);

  const isEditable = selectedItem && (selectedItem.status === 'pending' || selectedItem.type === 'record');

  // 2. Chat Layout
  return (
    <div className="flex-1 flex flex-col w-full bg-background overflow-hidden h-full">
      {/* Top Bar - Mode Switcher */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center sticky top-0 z-10 shrink-0">
        <div className="flex bg-muted p-1 rounded-none">
          <button 
            onClick={() => { onModeChange?.('record'); onSelectItem?.(null); }} 
            className={cn("flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-none transition-all", mode === 'record' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Mic className="h-4 w-4" />
            {t('contribution.modes.record', { defaultValue: 'Record Audio' })}
          </button>
          <button 
            onClick={() => { onModeChange?.('correct'); onSelectItem?.(null); }} 
            className={cn("flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-none transition-all", mode === 'correct' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Edit3 className="h-4 w-4" />
            {t('contribution.modes.correct', { defaultValue: 'Review & Edit' })}
          </button>
        </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col min-h-0">
        {selectedItem ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
               <Button variant="ghost" size="sm" onClick={() => onSelectItem?.(null)} className="gap-2 -ml-2 text-muted-foreground">
                 <ArrowLeft className="h-4 w-4" />
                 {t('contribution.chat.backToChat', { defaultValue: 'Back to recordings' })}
               </Button>
               {isEditable && !isEditing && (
                 <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                   <Edit3 className="h-4 w-4 mr-2" />
                   {t('contribution.review.edit', { defaultValue: 'Edit Text' })}
                 </Button>
               )}
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('contribution.review.title', { defaultValue: 'Contribution Details' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedItem.date).toLocaleDateString()} {t('contribution.time.at', { defaultValue: 'at' })} {new Date(selectedItem.date).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {selectedItem.audioUrl && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <ClipPlayer audioUrl={selectedItem.audioUrl} />
                </div>
              )}

              <div className="p-6 rounded-xl bg-muted/30 border border-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  <Info className="h-3.5 w-3.5" />
                  {t('contribution.review.details', { defaultValue: 'Details' })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.type', { defaultValue: 'Type' })}</p>
                    <p className="text-sm font-medium capitalize">{selectedItem.type === 'record' ? t('contribution.sidebar.recorded') : t('contribution.sidebar.corrected')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.status', { defaultValue: 'Status' })}</p>
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
                  {t('contribution.review.content', { defaultValue: 'Content' })}
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-base resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => { setIsEditing(false); setEditValue(selectedItem.details); }}>
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                      </Button>
                      <Button onClick={handleSaveEdit} disabled={isSavingEdit || !editValue.trim() || editValue === selectedItem.details}>
                        {isSavingEdit ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.save', { defaultValue: 'Save Changes' })}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-medium italic">"{selectedItem.details}"</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {mode === 'record' ? (
               <ChatFeedRecord 
                 userId={userId} 
                 pendingRecording={pendingRecording}
                 suggestedPhrase={suggestedPhrase}
                 onSubmit={handleTranscriptionComplete}
                 onDiscard={() => setPendingRecording(null)}
                 history={history.filter(h => h.type === 'record')}
                 onSelectItem={onSelectItem}
               />
            ) : (
               <ChatFeedCorrect 
                 userId={userId} 
                 onComplete={() => onContributionComplete()} 
               />
            )}
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      {mode === 'record' && !selectedItem && (
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 shrink-0">
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
