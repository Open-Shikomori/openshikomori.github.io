import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, Mic, Edit3, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContributionHistoryItem } from '@/types/contribution-ui';

interface HistorySidebarProps {
  history: ContributionHistoryItem[];
  onItemClick?: (item: ContributionHistoryItem) => void;
  className?: string;
}

export function HistorySidebar({ history, onItemClick, className }: HistorySidebarProps) {
  const { t } = useTranslation();

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <aside className={cn("flex flex-col h-full bg-card border-r border-border overflow-hidden", className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {t('contribution.history.title', { defaultValue: 'Recent Activity' })}
        </h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-none bg-muted text-muted-foreground">
          {history.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
            <Timer className="h-8 w-8 mb-2" />
            <p className="text-xs">{t('contribution.history.empty', { defaultValue: 'No activity yet this session' })}</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onItemClick?.(item)}
              className="w-full text-left p-3 rounded-none hover:bg-muted/50 transition-colors group relative"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 h-8 w-8 rounded-none flex items-center justify-center shrink-0",
                  item.type === 'record' ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {item.type === 'record' ? <Mic className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {item.type === 'record' ? t('contribution.modes.record') : t('contribution.modes.correct')}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTime(item.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {item.details}
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  {item.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  {item.status === 'rejected' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                  {item.status === 'pending' && <div className="h-2 w-2 rounded-none bg-amber-500 animate-pulse" />}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </aside>
  );
}
