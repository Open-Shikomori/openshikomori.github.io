import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { LanguageOption, DialectOption } from '@/types/contribution';
import { useTranslation } from 'react-i18next';

interface TranscriptionEditorProps {
  initialText?: string;
  initialLanguage?: LanguageOption['code'];
  initialDialect?: DialectOption['code'];
  audioUrl: string | null;
  duration?: number;
  onSubmit: (data: {
    transcription: string;
    language: LanguageOption['code'];
    dialect?: DialectOption['code'];
    duration: number;
  }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function TranscriptionEditor({
  initialText = '',
  initialLanguage = 'comorian',
  initialDialect,
  audioUrl,
  duration = 0,
  onSubmit,
  onBack,
  isSubmitting = false,
}: TranscriptionEditorProps) {
  const { t } = useTranslation();
  
  const [transcription, setTranscription] = useState(initialText);
  const [language] = useState<LanguageOption['code']>(initialLanguage);
  const [dialect] = useState<DialectOption['code'] | undefined>(initialDialect);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcription.trim()) return;

    onSubmit({
      transcription: transcription.trim(),
      language,
      dialect,
      duration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Audio Player */}
      {audioUrl && (
        <div className="p-4 bg-muted/50 rounded-none border border-border/50">
          <audio
            src={audioUrl}
            controls
            className="w-full h-10"
          />
        </div>
      )}

      {/* Transcription textarea */}
      <div className="space-y-2">
        <label htmlFor="transcription" className="text-sm font-medium">
          {t('contribution.editor.transcription')}
        </label>
        <textarea
          id="transcription"
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder={t('contribution.editor.placeholder')}
          className="w-full min-h-[120px] p-3 rounded-none border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-11 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 rounded-none border border-transparent"
        >
          {t('contribution.editor.back')}
        </button>
        <button
          type="submit"
          disabled={!transcription.trim() || isSubmitting}
          className="flex-1 h-11 px-4 bg-primary text-primary-foreground font-medium rounded-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('contribution.editor.submitting')}
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              {t('contribution.editor.submit')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
