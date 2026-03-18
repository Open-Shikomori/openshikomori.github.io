import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Trophy, Flame, Target, Clock, Globe, TrendingUp, Mic, Edit3, Lock,
  Sprout, Zap, BookOpen, Star, Award, Crown, Calendar, CalendarCheck, CheckCircle, BarChart3, Medal
} from 'lucide-react';
import { StatCard, StatCardGroup } from './StatCard';
import type { UserStats, Badge, ContributionHistoryItem, DailyProgress, WeeklyData } from './types';
import { useLeaderboard } from '../hooks/useStats';
import { cn } from '@/lib/utils';

interface StatsPanelProps {
  userStats: UserStats;
  streak: number;
  personalBestStreak: number;
  badges: Badge[];
  weeklyData: WeeklyData[];
  dailyProgress: DailyProgress;
  history: ContributionHistoryItem[];
  totalXP: number;
  totalWords: number;
}

const badgeIcons = {
  sprout: Sprout,
  zap: Zap,
  flame: Flame,
  'book-open': BookOpen,
  star: Star,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  target: Target,
  'edit-3': Edit3,
  'check-circle': CheckCircle,
  mic: Mic,
};

export function StatsPanel({
  userStats,
  streak,
  personalBestStreak,
  badges,
  weeklyData,
  dailyProgress,
  history,
  totalXP,
  totalWords,
}: StatsPanelProps) {
  const { t } = useTranslation();
  const { leaders } = useLeaderboard(5);
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
  const progressPercentage = Math.min((dailyProgress.current / dailyProgress.goal) * 100, 100);

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Stats Header */}
      <section className="w-full border-b border-border bg-background">
        <div className="w-full px-6 py-16 sm:px-12 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl font-black tracking-tight mb-4 sm:text-6xl lg:text-7xl uppercase">
              {t('contribution.tabs.stats')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t('contribution.stats.description', { defaultValue: 'Your lifetime contributions and impact on the platform.' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Key Metrics Grid */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('contribution.sidebar.recorded'), value: userStats.recordings, icon: Mic, color: 'text-teal-500' },
            { label: t('contribution.sidebar.corrected'), value: userStats.corrections, icon: Edit3, color: 'text-amber-500' },
            { label: t('contribution.sidebar.streak'), value: streak, icon: Flame, color: 'text-orange-500', sub: `${t('contribution.sidebar.best')}: ${personalBestStreak}` },
            { label: t('contribution.stats.totalXP'), value: totalXP.toLocaleString(), icon: Trophy, color: 'text-primary', sub: `${totalWords} ${t('contribution.impact.wordsPreserved')}` },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-background p-8 sm:p-12">
              <stat.icon className={cn("h-8 w-8 mb-6", stat.color)} />
              <p className="text-4xl sm:text-5xl font-black tracking-tighter mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              {stat.sub && (
                <p className="mt-2 text-xs font-medium text-muted-foreground/60">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Activity & Goals */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          {/* Weekly Activity */}
          <div className="bg-background p-8 sm:p-12 lg:p-16">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('contribution.sidebar.weeklyActivity')}
            </h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.count / maxCount) * 100}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className={cn(
                      "w-full rounded-none transition-colors",
                      day.count >= 10 ? 'bg-primary' : day.count >= 5 ? 'bg-primary/60' : day.count > 0 ? 'bg-primary/30' : 'bg-muted'
                    )}
                    style={{ minHeight: day.count > 0 ? '4px' : '2px' }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Progress */}
          <div className="bg-background p-8 sm:p-12 lg:p-16 border-t border-border lg:border-t-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('contribution.goals.title')}
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-6xl font-black tracking-tighter">{dailyProgress.current}</span>
                  <span className="text-2xl font-bold text-muted-foreground ml-2">/ {dailyProgress.goal}</span>
                </div>
                <span className="text-xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-4 bg-muted rounded-none overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-none"
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {progressPercentage >= 100 
                  ? t('contribution.goals.completed') 
                  : t('contribution.goals.remaining', { minutes: Math.max((dailyProgress.goal - dailyProgress.current) * 2, 0) })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Badges & Leaderboard */}
      <section className="w-full border-b border-border">
        <div className="grid gap-px bg-border lg:grid-cols-3">
          {/* Badges */}
          <div className="lg:col-span-2 bg-background p-8 sm:p-12 lg:p-16">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-10 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {t('contribution.sidebar.badges')}
              <span className="ml-auto text-[10px] font-bold bg-muted px-2 py-1">
                {badges.filter(b => !b.locked).length} / {badges.length}
              </span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-8 gap-4">
              {badges.map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Star;
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ y: -5 }}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center border border-border p-2 transition-all",
                      badge.locked ? "bg-muted/30 grayscale opacity-40" : "bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
                    )}
                    title={badge.description}
                  >
                    {badge.locked ? (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <IconComponent className="h-8 w-8 text-primary" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-background p-8 sm:p-12 lg:p-16 border-t border-border lg:border-t-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-10 flex items-center gap-2">
              <Medal className="h-4 w-4" />
              {t('contribution.stats.topContributors')}
            </h3>
            <div className="space-y-6">
              {leaders.slice(0, 5).map((leader, index) => (
                <div key={leader.userId} className="flex items-center gap-4 group">
                  <div className={cn(
                    "h-8 w-8 flex items-center justify-center font-black text-sm border-2",
                    index === 0 ? "border-amber-400 bg-amber-50 text-amber-600" :
                    index === 1 ? "border-slate-300 bg-slate-50 text-slate-500" :
                    index === 2 ? "border-orange-300 bg-orange-50 text-orange-600" :
                    "border-border bg-muted/30 text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate group-hover:text-primary transition-colors">{leader.displayName}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{leader.xpTotal.toLocaleString()} {t('contribution.stats.xp')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent History */}
      <section className="w-full bg-background p-8 sm:p-12 lg:p-16">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-10 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('contribution.history.title')}
        </h3>
        {history.length === 0 ? (
          <div className="border-2 border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">{t('contribution.history.empty')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {history.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="border border-border p-6 hover:border-primary/30 hover:bg-muted/10 transition-all flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-2",
                    item.type === 'record' ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {item.type === 'record' ? <Mic className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      "h-2 w-2",
                      item.status === 'approved' ? 'bg-green-500' : item.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                    )}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm line-clamp-2 italic mb-2">"{item.details}"</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
