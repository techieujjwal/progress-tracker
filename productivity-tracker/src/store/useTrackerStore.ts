import { create } from 'zustand';
import type { UserState, Task, Goal, Achievement, UserProfile, TimetableTemplate, FeedbackRecord, SystemLog } from '../types';
import { timetableTemplate, initialTemplates } from '../data/timetableTemplate';
import { storageService } from '../services/storage';
import { getDatesRange, getInitialSelectedDate } from '../utils/dateHelpers';
import { calculateDayEfficiency, calculateStreaks } from '../utils/trackerCalculations';
import { cloudService } from '../services/cloudSync';
import { useAuthStore } from './useAuthStore';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedCloudSync(state: UserState) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const authState = useAuthStore.getState();
    if (!authState.session || !cloudService.available) return;
    try {
      useAuthStore.getState().setSyncStatus('syncing');
      await cloudService.pushLogs(authState.session.user.id, state.logs);
      await cloudService.pushProfile(
        authState.session.user.id,
        state.profile,
        state.xp,
        state.level,
        authState.publicSharing
      );
      await cloudService.pushTemplates(authState.session.user.id, state.templates);
      useAuthStore.getState().setSyncStatus('synced');
    } catch {
      useAuthStore.getState().setSyncStatus('error');
    }
  }, 2000);
}

function persistState(state: UserState) {
  storageService.saveState(state);
  debouncedCloudSync(state);
}

interface TrackerActions {
  setSelectedDate: (date: string) => void;
  setActiveTaskId: (id: string | null) => void;
  toggleTask: (date: string, taskId: string) => { levelUp: boolean; perfectDay: boolean; unlockedBadges: string[] };
  updateTaskNotes: (date: string, taskId: string, notes: string) => void;
  resetTracker: () => void;
  exportTrackerData: () => string;
  importTrackerData: (dataStr: string) => boolean;
  updateGoalsProgress: () => void;
  triggerManualSync: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  createTemplate: (template: TimetableTemplate) => void;
  updateTemplate: (templateId: string, template: Partial<TimetableTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  duplicateTemplate: (templateId: string) => void;
  applyTemplateToDate: (date: string, templateId: string) => void;
  addCustomTaskToDate: (date: string, task: Omit<Task, 'completed' | 'completedAt' | 'notes'>) => void;
  deleteCustomTaskFromDate: (date: string, taskId: string) => void;
  updateCustomTaskInDate: (date: string, taskId: string, task: Partial<Task>) => void;
  addFeedback: (name: string, email: string, content: string) => void;
  addSystemLog: (type: 'info' | 'warn' | 'error', message: string) => void;
}

type TrackerStore = UserState & { activeTaskId: string | null } & TrackerActions;

const initialGoals: Goal[] = [
  { id: 'daily_coding', name: 'Daily Coding Goal', category: 'coding', target: 5, current: 0, unit: 'hours', period: 'daily' },
  { id: 'weekly_coding', name: 'Weekly Coding Goal', category: 'coding', target: 25, current: 0, unit: 'hours', period: 'weekly' },
  { id: 'monthly_coding', name: 'Monthly Coding Goal', category: 'coding', target: 100, current: 0, unit: 'hours', period: 'monthly' },
  { id: 'temple_weekly', name: 'Temple Visits Goal', category: 'temple', target: 10, current: 0, unit: 'visits', period: 'weekly' },
  { id: 'football_weekly', name: 'Football Goal', category: 'exercise', target: 3, current: 0, unit: 'sessions', period: 'weekly' },
  { id: 'project_weekly', name: 'Project Development Goal', category: 'coding', target: 5, current: 0, unit: 'sessions', period: 'weekly' }
];

const initialAchievements: Achievement[] = [
  { id: 'streak_7', name: '7 Day Streak', description: 'Maintain a consistency streak of 7 days', icon: 'Flame', unlockedAt: null, criteria: { type: 'streak', target: 7 } },
  { id: 'streak_15', name: '15 Day Streak', description: 'Maintain a consistency streak of 15 days', icon: 'Flame', unlockedAt: null, criteria: { type: 'streak', target: 15 } },
  { id: 'streak_30', name: '30 Day Streak', description: 'Maintain a consistency streak of 30 days', icon: 'Sparkles', unlockedAt: null, criteria: { type: 'streak', target: 30 } },
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all daily tasks', icon: 'Award', unlockedAt: null, criteria: { type: 'perfect_day', target: 1 } },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Achieve 7 consecutive perfect days', icon: 'Award', unlockedAt: null, criteria: { type: 'perfect_week', target: 7 } },
  { id: 'perfect_month', name: 'Perfect Month', description: 'Achieve 30 consecutive perfect days', icon: 'Trophy', unlockedAt: null, criteria: { type: 'perfect_month', target: 30 } },
  { id: 'python_100', name: '100 Python Sessions', description: 'Complete 100 Python practice blocks', icon: 'Terminal', unlockedAt: null, criteria: { type: 'session_count', target: 100, category: 'python' } },
  { id: 'project_100', name: '100 Project Sessions', description: 'Complete 100 project development blocks', icon: 'Terminal', unlockedAt: null, criteria: { type: 'session_count', target: 100, category: 'project_dev' } },
  { id: 'temple_100', name: '100 Temple Visits', description: 'Visit temple 100 times', icon: 'Heart', unlockedAt: null, criteria: { type: 'session_count', target: 100, category: 'temple' } }
];

function generateEmptyState(): UserState {
  const dates = getDatesRange();
  const logs: Record<string, Task[]> = {};
  dates.forEach(date => {
    logs[date] = timetableTemplate.map(t => ({ ...t }));
  });

  return {
    xp: 0,
    level: 1,
    logs,
    selectedDate: getInitialSelectedDate(),
    goals: initialGoals.map(g => ({ ...g })),
    achievements: initialAchievements.map(a => ({ ...a })),
    streakState: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
    templates: initialTemplates.map(t => ({
      ...t,
      tasks: t.tasks.map(tsk => ({ ...tsk }))
    })),
    activeTemplateId: 'default',
    profile: {
      username: 'Ujjwal',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      theme: 'dark',
      accentColor: '#3b82f6',
      notificationsEnabled: true,
      animationsEnabled: true
    },
    feedback: [
      { id: '1', name: 'Alex Johnson', email: 'alex@startup.co', content: 'The dark-mode layout and stardust micro-animations look gorgeous! Perfect Cron-style calendar replacement.', date: '2026-07-08 14:32' },
      { id: '2', name: 'Sophia Chen', email: 'sophia.c@designers.org', content: 'Can we get an integrations layer? Syncing with Cron and Google Calendar would make this my primary hub.', date: '2026-07-08 19:10' },
      { id: '3', name: 'Marcus Brody', email: 'marcus@brodydev.io', content: 'The dynamic insights engine detected my coding patterns immediately. Extremely high product polish!', date: '2026-07-09 00:05' }
    ],
    systemLogs: [
      { id: 'log_1', type: 'info', message: 'LifeSync DB engine successfully initialized.', timestamp: new Date().toISOString() },
      { id: 'log_2', type: 'info', message: 'Loaded 6 pre-configured timetable templates.', timestamp: new Date().toISOString() },
      { id: 'log_3', type: 'info', message: 'Synchronized local state with indexDB storage adapter.', timestamp: new Date().toISOString() }
    ],
    lastSynced: new Date().toISOString()
  };
}

const savedState = storageService.loadState();
const defaultState = savedState || generateEmptyState();

export const useTrackerStore = create<TrackerStore>((set, get) => ({
  ...defaultState,
  activeTaskId: null,

  setSelectedDate: (date: string) => set({ selectedDate: date }),
  setActiveTaskId: (id: string | null) => set({ activeTaskId: id }),

  toggleTask: (date: string, taskId: string) => {
    const state = get();
    const currentTasks = state.logs[date] || [];
    let xpDiff = 0;
    let perfectDay = false;
    let levelUp = false;
    const unlockedBadges: string[] = [];

    const updatedTasks = currentTasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        const now = new Date();
        const completedAt = completed ? now.toTimeString().split(' ')[0].substring(0, 5) : null;
        xpDiff = completed ? task.xp : -task.xp;
        return { ...task, completed, completedAt };
      }
      return task;
    });

    const newLogs = { ...state.logs, [date]: updatedTasks };
    const newXp = Math.max(0, state.xp + xpDiff);
    const newLevel = Math.floor(newXp / 150) + 1;

    if (newLevel > state.level) {
      levelUp = true;
    }

    const dayEfficiency = calculateDayEfficiency(updatedTasks);
    if (dayEfficiency === 100) {
      perfectDay = true;
    }

    const dates = getDatesRange();
    const newStreaks = calculateStreaks(newLogs, dates);

    let pythonCount = 0;
    let projectCount = 0;
    let templeCount = 0;
    let perfectDaysCount = 0;

    const efficiencies: Record<string, number> = {};
    dates.forEach(d => {
      const dTasks = newLogs[d] || [];
      const eff = calculateDayEfficiency(dTasks);
      efficiencies[d] = eff;
      if (eff === 100) {
        perfectDaysCount++;
      }
      dTasks.forEach(t => {
        if (t.completed) {
          if (t.id === 'python') pythonCount++;
          if (t.id === 'project_dev') projectCount++;
          if (t.category === 'temple') templeCount++;
        }
      });
    });

    let longestPerfectStreak = 0;
    let currentPerfectStreak = 0;
    const sortedDates = [...dates].sort();
    sortedDates.forEach(d => {
      if (efficiencies[d] === 100) {
        currentPerfectStreak++;
        if (currentPerfectStreak > longestPerfectStreak) {
          longestPerfectStreak = currentPerfectStreak;
        }
      } else {
        currentPerfectStreak = 0;
      }
    });

    const updatedAchievements = state.achievements.map(ach => {
      if (ach.unlockedAt) return ach;
      let unlocked = false;

      if (ach.criteria.type === 'streak') {
        if (newStreaks.longestStreak >= ach.criteria.target) {
          unlocked = true;
        }
      } else if (ach.criteria.type === 'perfect_day') {
        if (perfectDaysCount >= ach.criteria.target) {
          unlocked = true;
        }
      } else if (ach.criteria.type === 'perfect_week') {
        if (longestPerfectStreak >= 7) {
          unlocked = true;
        }
      } else if (ach.criteria.type === 'perfect_month') {
        if (longestPerfectStreak >= 30) {
          unlocked = true;
        }
      } else if (ach.criteria.type === 'session_count') {
        if (ach.criteria.category === 'python' && pythonCount >= ach.criteria.target) {
          unlocked = true;
        }
        if (ach.criteria.category === 'project_dev' && projectCount >= ach.criteria.target) {
          unlocked = true;
        }
        if (ach.criteria.category === 'temple' && templeCount >= ach.criteria.target) {
          unlocked = true;
        }
      }

      if (unlocked) {
        unlockedBadges.push(ach.name);
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });

    const nextState = {
      ...state,
      logs: newLogs,
      xp: newXp,
      level: newLevel,
      streakState: newStreaks,
      achievements: updatedAchievements,
      lastSynced: new Date().toISOString()
    };

    set(nextState);
    get().updateGoalsProgress();
    persistState(get());

    return { levelUp, perfectDay, unlockedBadges };
  },

  updateTaskNotes: (date: string, taskId: string, notes: string) => {
    const state = get();
    const currentTasks = state.logs[date] || [];
    const updatedTasks = currentTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, notes };
      }
      return task;
    });

    const newLogs = { ...state.logs, [date]: updatedTasks };
    set({ logs: newLogs, lastSynced: new Date().toISOString() });
    persistState(get());
  },

  resetTracker: () => {
    const fresh = generateEmptyState();
    set(fresh);
    persistState(fresh);
  },

  exportTrackerData: () => {
    return JSON.stringify(get());
  },

  importTrackerData: (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed && typeof parsed === 'object' && parsed.logs && typeof parsed.xp === 'number') {
        const sanitizedLogs = { ...parsed.logs };
        const dates = getDatesRange();
        dates.forEach(d => {
          if (!sanitizedLogs[d]) {
            sanitizedLogs[d] = timetableTemplate.map(t => ({ ...t }));
          } else {
            const dayTasks = sanitizedLogs[d];
            const updatedDayTasks = timetableTemplate.map(tmpl => {
              const existing = dayTasks.find((t: Task) => t.id === tmpl.id);
              if (existing) {
                return {
                  ...tmpl,
                  completed: !!existing.completed,
                  completedAt: existing.completedAt || null,
                  notes: existing.notes || ''
                };
              }
              return { ...tmpl };
            });
            sanitizedLogs[d] = updatedDayTasks;
          }
        });

        set({
          xp: parsed.xp,
          level: parsed.level || 1,
          logs: sanitizedLogs,
          selectedDate: parsed.selectedDate || getInitialSelectedDate(),
          goals: parsed.goals || initialGoals.map(g => ({ ...g })),
          achievements: parsed.achievements || initialAchievements.map(a => ({ ...a })),
          streakState: parsed.streakState || { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
          templates: parsed.templates || initialTemplates.map(t => ({ ...t })),
          activeTemplateId: parsed.activeTemplateId || 'default',
          profile: parsed.profile || {
            username: 'Ujjwal',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            theme: 'dark',
            accentColor: '#3b82f6',
            notificationsEnabled: true,
            animationsEnabled: true
          },
          feedback: parsed.feedback || [],
          systemLogs: parsed.systemLogs || [],
          lastSynced: new Date().toISOString()
        });
        get().updateGoalsProgress();
        persistState(get());
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  updateGoalsProgress: () => {
    const state = get();
    const activeDate = state.selectedDate;
    const activeDateObj = new Date(activeDate);

    const activeTasks = state.logs[activeDate] || [];
    const codingHoursToday = activeTasks.reduce((sum, t) => {
      if (t.completed && t.category === 'coding') {
        return sum + (t.duration || 60) / 60;
      }
      return sum;
    }, 0);

    const getWeekDays = (date: Date): string[] => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d.toISOString().split('T')[0]);
      }
      return days;
    };

    const currentWeekDays = getWeekDays(new Date(activeDateObj));
    let weeklyCodingHours = 0;
    let weeklyTempleCount = 0;
    let weeklyFootballCount = 0;
    let weeklyProjectCount = 0;

    currentWeekDays.forEach(d => {
      const dTasks = state.logs[d] || [];
      dTasks.forEach(t => {
        if (t.completed) {
          if (t.category === 'coding') {
            weeklyCodingHours += (t.duration || 60) / 60;
            if (t.id === 'project_dev' || t.label.toLowerCase().includes('project')) {
              weeklyProjectCount++;
            }
          }
          if (t.category === 'temple') {
            weeklyTempleCount++;
          }
          if (t.id === 'football' || t.label.toLowerCase().includes('football')) {
            weeklyFootballCount++;
          }
        }
      });
    });

    const activeMonth = activeDateObj.getMonth();
    const activeYear = activeDateObj.getFullYear();
    let monthlyCodingHours = 0;

    Object.entries(state.logs).forEach(([dStr, dTasks]) => {
      const dObj = new Date(dStr);
      if (dObj.getMonth() === activeMonth && dObj.getFullYear() === activeYear) {
        dTasks.forEach(t => {
          if (t.completed && t.category === 'coding') {
            monthlyCodingHours += (t.duration || 60) / 60;
          }
        });
      }
    });

    const updatedGoals = state.goals.map(g => {
      let current = 0;
      if (g.id === 'daily_coding') current = codingHoursToday;
      if (g.id === 'weekly_coding') current = weeklyCodingHours;
      if (g.id === 'monthly_coding') current = monthlyCodingHours;
      if (g.id === 'temple_weekly') current = weeklyTempleCount;
      if (g.id === 'football_weekly') current = weeklyFootballCount;
      if (g.id === 'project_weekly') current = weeklyProjectCount;

      return { ...g, current: parseFloat(current.toFixed(2)) };
    });

    set({ goals: updatedGoals });
  },

  triggerManualSync: () => {
    set({ lastSynced: new Date().toISOString() });
    persistState(get());
  },

  updateUserProfile: (profileUpdates: Partial<UserProfile>) => {
    set(state => {
      const nextProfile = { ...state.profile, ...profileUpdates };
      const nextState = { ...state, profile: nextProfile, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { profile: nextProfile };
    });
  },

  createTemplate: (template: TimetableTemplate) => {
    set(state => {
      const newTemplates = [...state.templates, template];
      const nextState = { ...state, templates: newTemplates, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { templates: newTemplates };
    });
    get().addSystemLog('info', `Created timetable template: ${template.name}`);
  },

  updateTemplate: (templateId: string, templateUpdates: Partial<TimetableTemplate>) => {
    set(state => {
      const newTemplates = state.templates.map(t => {
        if (t.id === templateId) {
          return { ...t, ...templateUpdates };
        }
        return t;
      });
      const nextState = { ...state, templates: newTemplates, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { templates: newTemplates };
    });
  },

  deleteTemplate: (templateId: string) => {
    set(state => {
      const newTemplates = state.templates.filter(t => t.id !== templateId);
      const activeTemplateId = state.activeTemplateId === templateId ? 'default' : state.activeTemplateId;
      const nextState = { ...state, templates: newTemplates, activeTemplateId, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { templates: newTemplates, activeTemplateId };
    });
    get().addSystemLog('info', `Deleted template: ${templateId}`);
  },

  duplicateTemplate: (templateId: string) => {
    const state = get();
    const original = state.templates.find(t => t.id === templateId);
    if (original) {
      const dup = {
        ...original,
        id: `template_${Date.now()}`,
        name: `${original.name} (Copy)`,
        tasks: original.tasks.map(t => ({ ...t, id: `task_${Math.random().toString(36).substr(2, 9)}` }))
      };
      get().createTemplate(dup);
    }
  },

  applyTemplateToDate: (date: string, templateId: string) => {
    const state = get();
    const template = state.templates.find(t => t.id === templateId);
    if (template) {
      const newTasks: Task[] = template.tasks.map(t => ({
        id: t.id,
        time: t.time,
        label: t.label,
        completed: false,
        completedAt: null,
        notes: '',
        xp: t.xp,
        category: t.category,
        color: t.color,
        icon: t.icon,
        duration: t.duration,
        reminder: t.reminder
      }));
      set(prev => {
        const newLogs = { ...prev.logs, [date]: newTasks };
        const nextState = { ...prev, logs: newLogs, activeTemplateId: templateId, lastSynced: new Date().toISOString() };
        persistState(nextState);
        return { logs: newLogs, activeTemplateId: templateId };
      });
      get().updateGoalsProgress();
      get().addSystemLog('info', `Applied template ${template.name} to ${date}`);
    }
  },

  addCustomTaskToDate: (date: string, taskDetails: Omit<Task, 'completed' | 'completedAt' | 'notes'>) => {
    const state = get();
    const currentTasks = state.logs[date] || [];
    const newTask: Task = {
      ...taskDetails,
      completed: false,
      completedAt: null,
      notes: ''
    };
    const newTasks = [...currentTasks, newTask];
    set(prev => {
      const newLogs = { ...prev.logs, [date]: newTasks };
      const nextState = { ...prev, logs: newLogs, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { logs: newLogs };
    });
    get().updateGoalsProgress();
  },

  deleteCustomTaskFromDate: (date: string, taskId: string) => {
    const state = get();
    const currentTasks = state.logs[date] || [];
    const newTasks = currentTasks.filter(t => t.id !== taskId);
    set(prev => {
      const newLogs = { ...prev.logs, [date]: newTasks };
      const nextState = { ...prev, logs: newLogs, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { logs: newLogs };
    });
    get().updateGoalsProgress();
  },

  updateCustomTaskInDate: (date: string, taskId: string, taskUpdates: Partial<Task>) => {
    const state = get();
    const currentTasks = state.logs[date] || [];
    const newTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, ...taskUpdates };
      }
      return t;
    });
    set(prev => {
      const newLogs = { ...prev.logs, [date]: newTasks };
      const nextState = { ...prev, logs: newLogs, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { logs: newLogs };
    });
    get().updateGoalsProgress();
  },

  addFeedback: (name: string, email: string, content: string) => {
    set(state => {
      const rec: FeedbackRecord = {
        id: `feed_${Date.now()}`,
        name,
        email,
        content,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      const newFeedback = [rec, ...state.feedback];
      const nextState = { ...state, feedback: newFeedback, lastSynced: new Date().toISOString() };
      persistState(nextState);
      return { feedback: newFeedback };
    });
  },

  addSystemLog: (type: 'info' | 'warn' | 'error', message: string) => {
    set(state => {
      const logItem: SystemLog = {
        id: `syslog_${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString()
      };
      const newLogs = [logItem, ...state.systemLogs].slice(0, 100);
      const nextState = { ...state, systemLogs: newLogs };
      persistState(nextState);
      return { systemLogs: newLogs };
    });
  }
}));
