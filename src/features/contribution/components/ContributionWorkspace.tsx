import { useState } from 'react';
import { useLocation } from 'react-router';
import { WorkArea } from './WorkArea';
import { StatsPanel } from './StatsPanel';
import { useUserDashboard } from '../hooks/useStats';
import type { ContributionHistoryItem } from '@/types/contribution-ui';
import type { ContributionMode } from '@/types/contribution';

interface ContributionWorkspaceProps {
  user: {
    uid: string;
    profile?: {
      displayName: string;
      avatar?: string;
      isPublic: boolean;
    };
  };
}

export function ContributionWorkspace({ user }: ContributionWorkspaceProps) {
  const location = useLocation();
  
  const view = location.pathname.includes('/stats') ? 'stats' : 'contribute';
  
  const [activeMode, setActiveMode] = useState<ContributionMode>('record');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ContributionHistoryItem | null>(null);

  // Single optimized query fetches all dashboard data
  const { data: dashboard, refetch } = useUserDashboard(user.uid);

  const handleContributionComplete = async () => {
    // Wait for the background trigger to finish then refresh UI
    await refetch();
  };

  const totalXP = dashboard?.stats.xpTotal ?? 0;
  const totalWords = dashboard?.stats.wordsPreserved ?? 0;

  const history = dashboard?.history.map((h) => ({
    id: h.id,
    type: (h.activityType === 'recording' ? 'record' : 'correct') as 'record' | 'correct',
    date: h.createdAt,
    status: h.status as 'pending' | 'approved' | 'rejected',
    details: h.details || '',
    referenceId: h.referenceId,
    audioUrl: h.audioUrl,
  })) ?? [];

  const dailyProgress = dashboard?.stats
    ? {
        current: dashboard.stats.dailyProgress,
        goal: dashboard.stats.dailyGoal,
      }
    : { current: 0, goal: 10 };

  const userStats = dashboard?.stats
    ? {
        recordings: dashboard.stats.recordingsCount,
        corrections: dashboard.stats.correctionsCount,
        reviews: 0,
      }
    : { recordings: 0, corrections: 0, reviews: 0 };

  const handleBackToWork = () => {
    setSelectedHistoryItem(null);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background overflow-hidden flex flex-col">
      <main className="w-full flex-1 flex flex-col min-w-0 bg-background relative">
        {view === 'contribute' ? (
          <div className="flex-1 flex flex-col h-full absolute inset-0">
            <WorkArea
              mode={activeMode}
              userId={user.uid}
              onContributionComplete={handleContributionComplete}
              selectedItem={selectedHistoryItem}
              onModeChange={setActiveMode}
              onBackToWork={handleBackToWork}
              history={history}
              onSelectItem={setSelectedHistoryItem}
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsPanel
              userStats={userStats}
              streak={dashboard?.stats.currentStreak ?? 0}
              personalBestStreak={dashboard?.stats.bestStreak ?? 0}
              badges={dashboard?.badges ?? []}
              weeklyData={dashboard?.weeklyData ?? []}
              dailyProgress={dailyProgress}
              totalXP={totalXP}
              totalWords={totalWords}
            />
          </div>
        )}
      </main>
    </div>
  );
}
