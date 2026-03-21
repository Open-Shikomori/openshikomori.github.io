import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Flame, Trophy, TrendingUp, Sparkles, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyProgress } from '@/types/contribution-ui';
import { useLeaderboard } from '../hooks/useStats';

interface ProgressSidebarProps {
  dailyProgress: DailyProgress;
  streak: number;
  totalXP: number;
  className?: string;
}

export function ProgressSidebar({ dailyProgress, streak, totalXP, className }: ProgressSidebarProps) {
  const { t } = useTranslation();
  const { leaders, loading: leaderboardLoading } = useLeaderboard(3);
  const progressPercentage = Math.min((dailyProgress.current / dailyProgress.goal) * 100, 100);

  return (
    <aside className={cn("flex flex-col h-full bg-card border-l border-border overflow-hidden p-4 space-y-6 overflow-y-auto custom-scrollbar", className)}>
      {/* Daily Goal */}
      <div className="shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary" />
          {t('contribution.goals.title', { defaultValue: 'Daily Goal' })}
        </h3>
        <div className="relative h-24 flex flex-col items-center justify-center">
          {/* Progress Circle (simplified SVG) */}
          <svg className="h-20 w-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-muted/30"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="226.2"
              initial={{ strokeDashoffset: 226.2 }}
              animate={{ strokeDashoffset: 226.2 - (226.2 * progressPercentage) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-primary"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>{dailyProgress.current} {t('contribution.sidebar.completed', { defaultValue: 'completed' })}</span>
          <span>{dailyProgress.goal} {t('contribution.sidebar.goal', { defaultValue: 'goal' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 shrink-0">
        {/* Streak */}
        <div className="p-3 rounded-none bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-none bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{streak}</p>
              <p className="text-[10px] uppercase font-semibold text-orange-600/70 dark:text-orange-400/70 tracking-wider">
                {t('contribution.sidebar.dayStreak', { defaultValue: 'Day Streak' })}
              </p>
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="p-3 rounded-none bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-none bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{totalXP}</p>
              <p className="text-[10px] uppercase font-semibold text-teal-600/70 dark:text-teal-400/70 tracking-wider">
                {t('contribution.sidebar.totalXP', { defaultValue: 'Total XP' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="flex-1 min-h-0">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Medal className="h-4 w-4 text-amber-500" />
          {t('contribution.leaderboard.miniTitle', { defaultValue: 'Top Contributors' })}
        </h3>
        <div className="space-y-3">
          {leaderboardLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted animate-pulse rounded-lg" />
            ))
          ) : (
            leaders.map((leader, index) => (
              <div key={leader.userId} className="flex items-center gap-3 group">
                <div className={cn(
                  "h-6 w-6 rounded-none flex items-center justify-center text-[10px] font-bold",
                  index === 0 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                  index === 1 ? "bg-slate-100 text-slate-700 border border-slate-200" :
                  "bg-orange-50 text-orange-700 border border-orange-100"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{leader.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{leader.xpTotal.toLocaleString()} XP</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tip/Impact Card */}
      <div className="shrink-0 p-4 rounded-none bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 relative overflow-hidden group">
        <Sparkles className="absolute -right-2 -top-2 h-12 w-12 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          {t('contribution.sidebar.yourImpact', { defaultValue: 'Your Impact' })}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('contribution.impact.preserveLanguage', { defaultValue: 'Every contribution helps preserve the Shikomori language for future generations.' })}
        </p>
      </div>
    </aside>
  );
}
