export interface Task {
  id: string;
  time: string;
  label: string;
  completed: boolean;
  completedAt: string | null;
  notes: string;
  xp: number;
  category: string;
  color?: string;
  icon?: string;
  duration?: number;
  reminder?: boolean;
}

export interface TaskTemplate {
  id: string;
  time: string;
  label: string;
  category: string;
  color: string;
  icon: string;
  xp: number;
  duration: number;
  reminder: boolean;
}

export interface TimetableTemplate {
  id: string;
  name: string;
  tasks: TaskTemplate[];
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  criteria: {
    type: 'streak' | 'session_count' | 'perfect_day' | 'perfect_week' | 'perfect_month';
    target: number;
    category?: string;
  };
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  theme: 'dark' | 'light' | 'cyberpunk' | 'nord';
  accentColor: string;
  notificationsEnabled: boolean;
  animationsEnabled: boolean;
}

export interface FeedbackRecord {
  id: string;
  name: string;
  email: string;
  content: string;
  date: string;
}

export interface SystemLog {
  id: string;
  type: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface UserState {
  xp: number;
  level: number;
  logs: Record<string, Task[]>;
  selectedDate: string;
  goals: Goal[];
  achievements: Achievement[];
  streakState: StreakState;
  templates: TimetableTemplate[];
  activeTemplateId: string;
  profile: UserProfile;
  feedback: FeedbackRecord[];
  systemLogs: SystemLog[];
  lastSynced: string | null;
}
