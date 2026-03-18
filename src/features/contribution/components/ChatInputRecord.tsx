import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Send, RotateCcw, Languages } from 'lucide-react';
import { useAudioRecorder, formatDuration } from '../hooks/useAudioRecorder';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DialectOption } from '../types';

interface ChatInputRecordProps {
  onComplete: (blob: Blob, duration: number, metadata: { language: string, dialect?: string }) => void;
  onGetSuggestion: (dialect?: string) => void;
  isSuggesting: boolean;
  suggestedPhrase: string | null;
}

export function ChatInputRecord({ onComplete, onGetSuggestion, isSuggesting, suggestedPhrase }: ChatInputRecordProps) {
  const { t } = useTranslation();
  
  const [dialect, setDialect] = useState<DialectOption['code'] | undefined>(undefined);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);

  // Auto-show when a new suggestion comes in
  useEffect(() => {
    if (suggestedPhrase) {
      setIsSuggestionVisible(true);
    }
  }, [suggestedPhrase]);

  const dialects: { code: DialectOption['code'] }[] = [
    { code: 'shingazidja' },
    { code: 'shindzuani' },
    { code: 'shimwali' },
    { code: 'shimaore' },
  ];

  const {
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error,
    waveformData,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);

  // Show error toast when recorder error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStart = async () => {
    if (recordingState === 'idle') {
      const permitted = await requestPermission();
      if (permitted) {
        await startRecording();
      }
    } else {
      await startRecording();
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleSubmit = () => {
    if (audioBlob) {
      onComplete(audioBlob, duration, { language: 'comorian', dialect });
      // Wait for submission to complete before resetting? The parent handles submission.
      // But we can reset here for the next one.
      setTimeout(() => resetRecording(), 500); 
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const isRecording = recordingState === 'recording';
  const hasRecording = recordingState === 'stopped' && audioBlob;

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Floating Suggestion Area */}
      <div className="absolute bottom-[calc(100%+1rem)] left-0 right-0 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          {isSuggesting && !suggestedPhrase ? (
            <motion.div
              key="loading-msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-2 py-2 px-4 bg-background/80 backdrop-blur-sm border border-border shadow-lg inline-block rounded-none"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">
                {t('contribution.chat.gettingSuggestion')}
              </span>
            </motion.div>
          ) : suggestedPhrase && !isRecording && !hasRecording ? (
            <>
              {isSuggestionVisible ? (
                <motion.div
                  key="suggestion-visible"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="mx-2 p-4 bg-card border-2 border-primary/20 shadow-2xl flex flex-col gap-1.5 pointer-events-auto rounded-none relative group"
                >
                  {/* Decorative corner */}
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-card border-r-2 border-b-2 border-primary/20 rotate-45" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-primary animate-pulse" />
                      {t('contribution.chat.suggestionPrompt')}
                    </span>
                    <button 
                      onClick={() => setIsSuggestionVisible(false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {t('common.hideSuggestion', { defaultValue: 'Hide' })}
                    </button>
                  </div>
                  <p className="text-lg font-bold italic text-foreground leading-relaxed">
                    {suggestedPhrase}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="suggestion-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-2 pointer-events-auto"
                >
                  <button
                    onClick={() => setIsSuggestionVisible(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-sm border border-border shadow-md hover:bg-background transition-colors rounded-none"
                  >
                    <span className="h-1.5 w-1.5 bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t('common.showSuggestion', { defaultValue: 'Show Prompt' })}
                    </span>
                  </button>
                </motion.div>
              )}
            </>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-end gap-2 bg-muted/50 p-2 rounded-none border border-border">

        {/* Dynamic Content Area */}
        <div className="flex-1 min-h-[44px] flex items-center px-4 bg-background rounded-none border border-border shadow-sm overflow-hidden order-1 sm:order-none">
          <AnimatePresence mode="wait">
            {!isRecording && !hasRecording && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center py-2"
              >
                <span className="text-muted-foreground text-sm font-medium">
                  {t('contribution.chat.idle', { defaultValue: 'Tap the mic to start recording...' })}
                </span>
              </motion.div>
            )}

            {isRecording && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center w-full gap-4 py-2"
              >
                <div className="flex items-center gap-2 text-red-500 font-bold tabular-nums min-w-[60px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-none h-2 w-2 bg-red-500" />
                  </span>
                  {formatDuration(duration)}
                </div>
                <div className="flex-1 flex items-center gap-0.5 h-6">
                  {waveformData.length > 0 ? (
                    waveformData.slice(-30).map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 2 }}
                        animate={{ height: `${Math.max(2, value * 100)}%` }}
                        className="flex-1 bg-red-500 rounded-none transition-all duration-75 max-w-[4px]"
                      />
                    ))
                  ) : (
                    Array.from({ length: 20 }).map((_, index) => (
                      <div key={index} className="flex-1 bg-red-500/20 rounded-none h-1 max-w-[4px]" />
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {hasRecording && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between w-full py-2"
              >
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-none border-border" 
                    onClick={handlePlay}
                    disabled={isPlaying}
                  >
                    <Play className="h-4 w-4 ml-0.5 fill-current" />
                  </Button>
                  <div className="text-sm font-bold tabular-nums">{formatDuration(duration)}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetRecording}
                  className="text-muted-foreground hover:text-destructive h-8 px-2 rounded-none"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('contribution.chat.discard')}</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 order-2 sm:order-none">
          {/* Dialect Selector - Near the send button */}
          {!isRecording && !hasRecording && (
            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-background h-[44px] px-3 border border-border rounded-none shadow-sm">
              <Languages className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={dialect || ''}
                onChange={(e) => setDialect(e.target.value as DialectOption['code'] || undefined)}
                className="bg-transparent text-[10px] font-black uppercase tracking-[0.1em] focus:outline-none cursor-pointer flex-1 sm:flex-none min-w-0"
              >
                <option value="" className="bg-background text-foreground">{t('contribution.editor.anyDialect')}</option>
                {dialects.map((d) => (
                  <option key={d.code} value={d.code} className="bg-background text-foreground">
                    {t(`contribution.dialects.${d.code}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Button */}
          <div className="shrink-0 flex items-center justify-center h-[44px]">
            {!hasRecording ? (
              <Button
                type="button"
                size="icon"
                onClick={isRecording ? handleStop : handleStart}
                disabled={recordingState === 'requesting'}
                className={cn(
                  "h-11 w-11 rounded-none shadow-sm transition-all duration-200 border-none",
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
              >
                {recordingState === 'requesting' ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-none animate-spin" />
                ) : isRecording ? (
                  <Square className="h-4 w-4 fill-current" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={handleSubmit}
                className="h-11 w-11 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 border-none"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
