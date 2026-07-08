import type { Task } from '../types';
import { getLocalDateString } from './dateHelpers';

export const TOTAL_XP_PER_DAY = 140;

export function calculateDayEfficiency(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completedXp = tasks.reduce((sum, task) => sum + (task.completed ? task.xp : 0), 0);
  return Math.round((completedXp / TOTAL_XP_PER_DAY) * 100);
}

export function calculateStreaks(logs: Record<string, Task[]>, dates: string[]): { currentStreak: number, longestStreak: number, lastActiveDate: string | null } {
  let longest = 0;
  let current = 0;
  let tempStreak = 0;
  let lastActiveDate: string | null = null;

  const sortedDates = [...dates].sort();

  for (const d of sortedDates) {
    const tasks = logs[d] || [];
    const efficiency = calculateDayEfficiency(tasks);
    if (efficiency >= 80) {
      tempStreak++;
      lastActiveDate = d;
      if (tempStreak > longest) {
        longest = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  const todayStr = getLocalDateString();
  const todayIdx = sortedDates.indexOf(todayStr);
  const activeEndIdx = todayIdx !== -1 ? todayIdx : sortedDates.length - 1;

  for (let i = activeEndIdx; i >= 0; i--) {
    const d = sortedDates[i];
    const tasks = logs[d] || [];
    const efficiency = calculateDayEfficiency(tasks);

    if (i === activeEndIdx && efficiency < 80) {
      const yesterday = sortedDates[i - 1];
      if (yesterday) {
        const yTasks = logs[yesterday] || [];
        const yEff = calculateDayEfficiency(yTasks);
        if (yEff < 80) {
          current = 0;
          break;
        }
      }
      continue;
    }

    if (efficiency >= 80) {
      current++;
    } else {
      break;
    }
  }

  return { currentStreak: current, longestStreak: longest, lastActiveDate };
}

export function calculateCodingHours(logs: Record<string, Task[]>): { python: number, web: number, project: number, total: number } {
  let python = 0;
  let web = 0;
  let project = 0;

  Object.values(logs).forEach(tasks => {
    tasks.forEach(task => {
      if (task.completed) {
        const hrs = (task.duration || 60) / 60;
        if (task.id === 'python' || task.label.toLowerCase().includes('python')) {
          python += hrs;
        } else if (task.id === 'web_dev' || task.label.toLowerCase().includes('web development')) {
          web += hrs;
        } else if (task.id === 'project_dev' || task.label.toLowerCase().includes('project')) {
          project += hrs;
        }
      }
    });
  });

  return {
    python: parseFloat(python.toFixed(2)),
    web: parseFloat(web.toFixed(2)),
    project: parseFloat(project.toFixed(2)),
    total: parseFloat((python + web + project).toFixed(2))
  };
}

export function calculateHabitConsistency(logs: Record<string, Task[]>, key: string): number {
  let completed = 0;
  let total = 0;

  Object.values(logs).forEach(tasks => {
    tasks.forEach(task => {
      const matchesKey = 
        task.id === key || 
        task.category === key ||
        (key === 'temple' && (task.id === 'temple_morning' || task.id === 'temple_evening' || task.category === 'temple')) ||
        (key === 'sleep' && (task.id === 'sleep' || task.category === 'sleep')) ||
        (key === 'revision' && (task.id === 'revision' || task.category === 'revision')) ||
        (key === 'football' && (task.id === 'football' || task.label.toLowerCase().includes('football')));

      if (matchesKey) {
        total++;
        if (task.completed) {
          completed++;
        }
      }
    });
  });

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}


export function calculateWeeklyGrade(efficiency: number): string {
  if (efficiency >= 90) return 'A+';
  if (efficiency >= 80) return 'A';
  if (efficiency >= 60) return 'B';
  return 'C';
}

export function getSmartMotivationalMessage(efficiency: number, streak: number): string {
  if (efficiency === 100) return 'Absolute perfection, Ujjwal! You are in the top 1% today. 🚀';
  if (efficiency >= 80) return 'Incredible productivity! Keep this momentum going. 🔥';
  if (efficiency >= 50) return 'Good progress, but you can push harder. Let\'s close those remaining tasks!';
  if (streak > 0) return `You are on a ${streak}-day streak! Don't let it break today. You got this.`;
  return 'A new day is a fresh opportunity. Start small, win the morning, win the day!';
}

export function generateHabitInsights(logs: Record<string, Task[]>, dates: string[]): string[] {
  const insights: string[] = [];
  
  let weekendCoding = 0;
  let weekdayCoding = 0;
  let weekendDays = 0;
  let weekdayDays = 0;

  let revisionCompleted = 0;
  let revisionTotal = 0;

  let templeCompletedThisWeek = 0;
  let templeTotalThisWeek = 0;
  let templeCompletedLastWeek = 0;
  let templeTotalLastWeek = 0;

  const sortedDates = [...dates].sort();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIdx = sortedDates.indexOf(todayStr);
  const activeIdx = todayIdx !== -1 ? todayIdx : sortedDates.length - 1;

  sortedDates.forEach((d, idx) => {
    const tasks = logs[d] || [];
    const dayOfWeek = new Date(d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const codingTasks = tasks.filter(t => t.category === 'coding');
    const codingCompleted = codingTasks.filter(t => t.completed).length;

    if (isWeekend) {
      weekendCoding += codingCompleted;
      if (codingTasks.length > 0) weekendDays++;
    } else {
      weekdayCoding += codingCompleted;
      if (codingTasks.length > 0) weekdayDays++;
    }

    const rev = tasks.find(t => t.id === 'revision');
    if (rev) {
      revisionTotal++;
      if (rev.completed) revisionCompleted++;
    }

    const temples = tasks.filter(t => t.id === 'temple_morning' || t.id === 'temple_evening');
    if (idx > activeIdx - 7 && idx <= activeIdx) {
      temples.forEach(t => {
        templeTotalThisWeek++;
        if (t.completed) templeCompletedThisWeek++;
      });
    } else if (idx > activeIdx - 14 && idx <= activeIdx - 7) {
      temples.forEach(t => {
        templeTotalLastWeek++;
        if (t.completed) templeCompletedLastWeek++;
      });
    }
  });

  const avgWeekend = weekendDays > 0 ? weekendCoding / weekendDays : 0;
  const avgWeekday = weekdayDays > 0 ? weekdayCoding / weekdayDays : 0;

  if (avgWeekend > avgWeekday && avgWeekday > 0) {
    const pct = Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100);
    insights.push(`You code ${pct}% more on weekends.`);
  } else if (avgWeekday > avgWeekend && avgWeekend > 0) {
    const pct = Math.round(((avgWeekday - avgWeekend) / avgWeekend) * 100);
    insights.push(`You code ${pct}% more on weekdays.`);
  } else {
    insights.push("Your coding consistency is uniform across weekends and weekdays.");
  }

  if (revisionTotal > 0) {
    const revRate = revisionCompleted / revisionTotal;
    if (revRate < 0.4) {
      insights.push("You usually miss Revision. Try locking in morning sessions.");
    } else {
      insights.push("Excellent work keeping up with your Revision routine!");
    }
  }

  const thisWeekTemple = templeTotalThisWeek > 0 ? (templeCompletedThisWeek / templeTotalThisWeek) * 100 : 0;
  const lastWeekTemple = templeTotalLastWeek > 0 ? (templeCompletedLastWeek / templeTotalLastWeek) * 100 : 0;

  if (thisWeekTemple > lastWeekTemple) {
    const diff = Math.round(thisWeekTemple - lastWeekTemple);
    if (diff > 0) {
      insights.push(`Temple consistency increased ${diff}% this week.`);
    }
  } else if (lastWeekTemple > thisWeekTemple) {
    const diff = Math.round(lastWeekTemple - thisWeekTemple);
    if (diff > 0) {
      insights.push(`Temple consistency decreased ${diff}% this week.`);
    }
  } else {
    insights.push("Your Temple visits are holding steady compared to last week.");
  }

  let eveningCompleted = 0;
  let eveningTotal = 0;
  Object.values(logs).forEach(tasks => {
    tasks.forEach(t => {
      if (t.id === 'project_dev' || t.id === 'temple_evening') {
        eveningTotal++;
        if (t.completed) eveningCompleted++;
      }
    });
  });

  if (eveningTotal > 0 && (eveningCompleted / eveningTotal) >= 0.7) {
    insights.push("You are most productive between 6 PM and 8 PM.");
  } else {
    insights.push("Try scheduling your primary focus block in the afternoon.");
  }

  return insights;
}
