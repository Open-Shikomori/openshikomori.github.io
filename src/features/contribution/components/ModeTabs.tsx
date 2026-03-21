import { useTranslation } from 'react-i18next';
import { Mic, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContributionMode } from '@/types/contribution';

interface ModeTabsProps {
  value: ContributionMode;
  onChange: (value: ContributionMode) => void;
}

export function ModeTabs({ value, onChange }: ModeTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-border">
      <button
        type="button"
        onClick={() => onChange('record')}
        className={cn(
          "flex-1 h-14 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors relative",
          value === 'record'
            ? "text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Mic className="h-4 w-4" />
        <span className="hidden sm:inline">{t('contribution.modes.record')}</span>
        <span className="sm:hidden">{t('contribution.modes.recordShort', { defaultValue: t('contribution.modes.record') })}</span>
        {value === 'record' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange('correct')}
        className={cn(
          "flex-1 h-14 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors relative",
          value === 'correct'
            ? "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Edit3 className="h-4 w-4" />
        <span className="hidden sm:inline">{t('contribution.modes.correct')}</span>
        <span className="sm:hidden">{t('contribution.modes.correctShort', { defaultValue: t('contribution.modes.correct') })}</span>
        {value === 'correct' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
        )}
      </button>
    </div>
  );
}
