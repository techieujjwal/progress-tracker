import type { Task } from '../types';

export interface ProductivityInsights {
  bestCodingDay: string;
  mostProductiveHour: string;
  leastProductiveHour: string;
  mostConsistentHabit: string;
  mostSkippedHabit: string;
  smartInsights: string[];
}

export function generateSmartInsights(logs: Record<string, Task[]>): ProductivityInsights {
  const logEntries = Object.entries(logs);
  
  if (logEntries.length === 0) {
    return {
      bestCodingDay: 'Wednesday',
      mostProductiveHour: '09:00 - 11:00',
      leastProductiveHour: '16:00 - 17:00',
      mostConsistentHabit: 'Wake Up',
      mostSkippedHabit: 'Revision',
      smartInsights: [
        'Welcome to LifeSync! Complete tasks today to see real behavioral insights.',
        'Tip: Consistent wake-up times establish a positive baseline for daily achievements.'
      ]
    };
  }

  const categoryCompleted: Record<string, number> = {};
  const categoryTotal: Record<string, number> = {};
  const weekdayCodingHours: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let countAfterExerciseCompleted = 0;
  let totalAfterExerciseCompleted = 0;
  let countAfterExerciseSkipped = 0;
  let totalAfterExerciseSkipped = 0;

  let revisionSundayCompleted = 0;
  let revisionSundayTotal = 0;

  let codingMorningHours = 0;
  let codingEveningHours = 0;

  let pythonBeforeWebDevCount = 0;
  let pythonAndWebDevBothCompleted = 0;

  const hourCompletions: Record<number, number> = {};
  const hourTotal: Record<number, number> = {};

  logEntries.forEach(([dateStr, tasks]) => {
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();

    
    tasks.forEach((task, idx) => {
      const startHour = parseInt(task.time.split(':')[0]) || 8;
      
      if (!hourCompletions[startHour]) hourCompletions[startHour] = 0;
      if (!hourTotal[startHour]) hourTotal[startHour] = 0;
      hourTotal[startHour]++;
      if (task.completed) {
        hourCompletions[startHour]++;
      }

      if (!categoryTotal[task.category]) {
        categoryTotal[task.category] = 0;
        categoryCompleted[task.category] = 0;
      }
      categoryTotal[task.category]++;
      if (task.completed) {
        categoryCompleted[task.category]++;
      }

      if (task.category === 'coding') {
        const hrs = (task.duration || 60) / 60;
        if (task.completed) {
          weekdayCodingHours[dayOfWeek] += hrs;
          if (startHour < 12) {
            codingMorningHours += hrs;
          } else if (startHour >= 16) {
            codingEveningHours += hrs;
          }
        }
      }

      if (task.category === 'revision' && dayOfWeek === 0) {
        revisionSundayTotal++;
        if (task.completed) {
          revisionSundayCompleted++;
        }
      }

      if (idx > 0) {
        const prevExerciseCompleted = tasks.slice(0, idx).some(t => t.category === 'exercise' && t.completed);
        if (prevExerciseCompleted) {
          totalAfterExerciseCompleted++;
          if (task.completed) countAfterExerciseCompleted++;
        } else {
          totalAfterExerciseSkipped++;
          if (task.completed) countAfterExerciseSkipped++;
        }
      }
    });

    const pythonTask = tasks.find(t => t.id === 'python' || t.label.toLowerCase().includes('python'));
    const webDevTask = tasks.find(t => t.id === 'web_dev' || t.label.toLowerCase().includes('web development'));

    if (pythonTask && webDevTask && pythonTask.completed && webDevTask.completed) {
      if (pythonTask.completedAt && webDevTask.completedAt) {
        pythonAndWebDevBothCompleted++;
        if (pythonTask.completedAt < webDevTask.completedAt) {
          pythonBeforeWebDevCount++;
        }
      }
    }
  });

  let bestCodingDayIdx = 3;
  let maxCodingHrs = 0;
  for (let i = 0; i < 7; i++) {
    if (weekdayCodingHours[i] > maxCodingHrs) {
      maxCodingHrs = weekdayCodingHours[i];
      bestCodingDayIdx = i;
    }
  }

  let mostProductiveHr = 9;
  let maxRate = 0;
  Object.keys(hourTotal).forEach(hStr => {
    const h = parseInt(hStr);
    const rate = hourCompletions[h] / hourTotal[h];
    if (rate > maxRate) {
      maxRate = rate;
      mostProductiveHr = h;
    }
  });

  let leastProductiveHr = 16;
  let minRate = 1;
  Object.keys(hourTotal).forEach(hStr => {
    const h = parseInt(hStr);
    const rate = hourCompletions[h] / hourTotal[h];
    if (rate < minRate) {
      minRate = rate;
      leastProductiveHr = h;
    }
  });

  let mostConsistent = 'Wake Up';
  let maxConsistency = 0;
  let leastConsistent = 'Revision';
  let minConsistency = 1;

  Object.keys(categoryTotal).forEach(cat => {
    const rate = categoryCompleted[cat] / categoryTotal[cat];
    if (rate > maxConsistency) {
      maxConsistency = rate;
      mostConsistent = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
    if (rate < minConsistency) {
      minConsistency = rate;
      leastConsistent = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  });

  const smartInsights: string[] = [];

  if (totalAfterExerciseCompleted > 0 && totalAfterExerciseSkipped > 0) {
    const rateAfterGym = countAfterExerciseCompleted / totalAfterExerciseCompleted;
    const rateNormal = countAfterExerciseSkipped / totalAfterExerciseSkipped;
    if (rateAfterGym > rateNormal) {
      const diff = Math.round(((rateAfterGym - rateNormal) / (rateNormal || 1)) * 100);
      if (diff > 0) {
        smartInsights.push(`You are ${diff}% more productive after exercise sessions.`);
      }
    }
  }

  if (revisionSundayTotal > 0) {
    const revSundayRate = revisionSundayCompleted / revisionSundayTotal;
    if (revSundayRate < 0.4) {
      smartInsights.push(`You usually skip Revision on Sundays (completion: ${Math.round(revSundayRate * 100)}%).`);
    }
  }

  if (codingEveningHours > codingMorningHours) {
    smartInsights.push('You tend to write more code during the evening hours.');
  } else if (codingMorningHours > 0) {
    smartInsights.push('Your highest coding throughput occurs in the morning.');
  }

  if (pythonAndWebDevBothCompleted > 0) {
    const pythonFirstRate = pythonBeforeWebDevCount / pythonAndWebDevBothCompleted;
    const pct = Math.round(pythonFirstRate * 100);
    if (pct > 50) {
      smartInsights.push(`You complete Python before Web Development ${pct}% of the time.`);
    }
  }

  if (smartInsights.length === 0) {
    smartInsights.push('Keep tracking your habits to unlock customized productivity insights.');
    smartInsights.push('Tip: Review your daily checklist before starting tasks to improve focus.');
  }

  return {
    bestCodingDay: weekdayNames[bestCodingDayIdx],
    mostProductiveHour: `${String(mostProductiveHr).padStart(2, '0')}:00 - ${String(mostProductiveHr + 1).padStart(2, '0')}:00`,
    leastProductiveHour: `${String(leastProductiveHr).padStart(2, '0')}:00 - ${String(leastProductiveHr + 1).padStart(2, '0')}:00`,
    mostConsistentHabit: mostConsistent,
    mostSkippedHabit: leastConsistent,
    smartInsights
  };
}
