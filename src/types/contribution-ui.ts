export type ContributionMode = 'record' | 'correct';

export interface UserStatsSummary {
  recordings: number;
  corrections: number;
  reviews: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: 'volume' | 'consistency' | 'quality' | 'special';
  tier?: 1 | 2 | 3;
  xpReward?: number;
  earnedAt?: Date;
  locked: boolean;
}

export interface ContributionHistoryItem {
  id: string;
  type: 'record' | 'correct';
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  details: string;
  referenceId?: string;
  audioUrl?: string;
}

export interface DailyProgress {
  current: number;
  goal: number;
}

export interface WeeklyData {
  day: string;
  count: number;
}
