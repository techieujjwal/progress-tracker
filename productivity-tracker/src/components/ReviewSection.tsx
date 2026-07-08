import { useTrackerStore } from '../store/useTrackerStore';
import { getDatesRange, formatDateLabel, getLocalDateString } from '../utils/dateHelpers';
import { 
  calculateDayEfficiency, 
  calculateWeeklyGrade, 
  getSmartMotivationalMessage, 
  generateHabitInsights 
} from '../utils/trackerCalculations';
import { TrendingUp, TrendingDown, Target, Zap, Clock, ShieldAlert } from 'lucide-react';

export default function ReviewSection() {
  const logs = useTrackerStore(state => state.logs);
  const selectedDate = useTrackerStore(state => state.selectedDate);

  const dates = getDatesRange();
  const sortedDates = [...dates].sort();
  const todayStr = getLocalDateString();
  const activeIdx = sortedDates.indexOf(selectedDate);

  const getPeriodStats = (start: number, end: number) => {
    let effSum = 0;
    let codingHrs = 0;
    let templeCount = 0;
    let daysCount = 0;

    for (let i = start; i <= end; i++) {
      if (i < 0 || i >= sortedDates.length) continue;
      const d = sortedDates[i];
      const tasks = logs[d] || [];
      const checked = tasks.some(t => t.completed);
      if (checked || d === todayStr) {
        effSum += calculateDayEfficiency(tasks);
        daysCount++;
      }
      tasks.forEach(t => {
        if (t.completed) {
          if (t.category === 'coding') {
            if (t.id === 'python') codingHrs += 1.33;
            if (t.id === 'web_dev') codingHrs += 2.0;
            if (t.id === 'project_dev') codingHrs += 1.92;
          }
          if (t.id === 'temple_morning' || t.id === 'temple_evening') {
            templeCount++;
          }
        }
      });
    }

    return {
      avgEfficiency: daysCount > 0 ? Math.round(effSum / daysCount) : 0,
      codingHours: parseFloat(codingHrs.toFixed(2)),
      templeVisits: templeCount
    };
  };

  const thisWeekStats = getPeriodStats(activeIdx - 6, activeIdx);
  const lastWeekStats = getPeriodStats(activeIdx - 13, activeIdx - 7);

  const thisMonthStats = getPeriodStats(activeIdx - 29, activeIdx);
  const lastMonthStats = getPeriodStats(activeIdx - 59, activeIdx - 30);

  const grade = calculateWeeklyGrade(thisWeekStats.avgEfficiency);
  const monthGrade = calculateWeeklyGrade(thisMonthStats.avgEfficiency);
  const motivation = getSmartMotivationalMessage(thisWeekStats.avgEfficiency, useTrackerStore.getState().streakState.currentStreak);

  const getBestDay = () => {
    let bestEff = -1;
    let bestDate = 'No logs';

    for (let i = 0; i <= activeIdx; i++) {
      const d = sortedDates[i];
      const eff = calculateDayEfficiency(logs[d] || []);
      if (eff > bestEff) {
        bestEff = eff;
        bestDate = d;
      }
    }
    return bestDate !== 'No logs' ? `${formatDateLabel(bestDate)} (${bestEff}% Efficiency)` : 'N/A';
  };

  const getMostSkippedHabit = () => {
    const habits = ['wake', 'school', 'park', 'breakfast', 'temple_morning', 'revision', 'python', 'rest_phone', 'lunch_rest', 'web_dev', 'football', 'project_dev', 'dinner_rest', 'temple_evening', 'food_mobile', 'sleep'];
    const missCount: Record<string, { label: string, missed: number }> = {};

    habits.forEach(hId => {
      missCount[hId] = { label: '', missed: 0 };
    });

    for (let i = 0; i <= activeIdx; i++) {
      const d = sortedDates[i];
      const tasks = logs[d] || [];
      tasks.forEach(t => {
        if (!missCount[t.id]) {
          missCount[t.id] = { label: t.label, missed: 0 };
        } else {
          missCount[t.id].label = t.label;
        }
        if (!t.completed) {
          missCount[t.id].missed++;
        }
      });
    }

    let maxMiss = -1;
    let worstHabit = 'None';
    Object.values(missCount).forEach(item => {
      if (item.missed > maxMiss && item.label) {
        maxMiss = item.missed;
        worstHabit = item.label;
      }
    });

    return maxMiss > 0 ? worstHabit : 'None';
  };

  const getLongestCodingSession = () => {
    let pythonDone = false;
    let webDone = false;
    let projectDone = false;

    const currentTasks = logs[selectedDate] || [];
    currentTasks.forEach(t => {
      if (t.completed) {
        if (t.id === 'python') pythonDone = true;
        if (t.id === 'web_dev') webDone = true;
        if (t.id === 'project_dev') projectDone = true;
      }
    });

    if (webDone) return 'Web Development (2.0 Hours)';
    if (projectDone) return 'Project Development (1.92 Hours)';
    if (pythonDone) return 'Python Block (1.33 Hours)';
    return 'None';
  };

  const insights = generateHabitInsights(logs, dates);

  const getDiff = (curr: number, prev: number, unit = '') => {
    const diff = curr - prev;
    const isUp = diff >= 0;
    return (
      <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{Math.abs(parseFloat(diff.toFixed(2)))}{unit}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="flex flex-col gap-6 bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl justify-between">
        <div className="flex flex-col gap-4">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Performance Scorecard</span>
          <div className="flex items-center gap-6 mt-2">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-black shadow-lg shadow-purple-600/20 text-white select-none">
              {grade}
            </div>
            <div>
              <span className="text-white/30 text-xs">Weekly Grade</span>
              <h4 className="text-xl font-bold mt-0.5">Focus Grade: {grade}</h4>
              <p className="text-white/40 text-xs mt-1">Based on rolling 7-day average</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-xl mt-2 relative">
            <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-white/70">Coaches Feedback</span>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">{motivation}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-white/5 pt-6 mt-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Best Day
            </span>
            <span className="font-semibold text-white/80">{getBestDay()}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Most Skipped Habit
            </span>
            <span className="font-semibold text-white/80">{getMostSkippedHabit()}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Longest Coding Session
            </span>
            <span className="font-semibold text-white/80 truncate max-w-[200px]">{getLongestCodingSession()}</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6 bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl justify-between">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Review & Smart Insights</h3>
            <p className="text-white/40 text-xs mt-1">
              Dynamic patterns generated dynamically from your daily schedules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col gap-3.5">
              <span className="text-white/40 text-[10px] uppercase font-semibold">Weekly Analysis</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Efficiency:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{thisWeekStats.avgEfficiency}%</span>
                    {getDiff(thisWeekStats.avgEfficiency, lastWeekStats.avgEfficiency, '%')}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Coding Hours:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{thisWeekStats.codingHours} hrs</span>
                    {getDiff(thisWeekStats.codingHours, lastWeekStats.codingHours, 'h')}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Temple Visits:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{thisWeekStats.templeVisits}</span>
                    {getDiff(thisWeekStats.templeVisits, lastWeekStats.templeVisits)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col gap-3.5">
              <span className="text-white/40 text-[10px] uppercase font-semibold">Monthly Analysis</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Efficiency:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{thisMonthStats.avgEfficiency}%</span>
                    {getDiff(thisMonthStats.avgEfficiency, lastMonthStats.avgEfficiency, '%')}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Coding Hours:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{thisMonthStats.codingHours} hrs</span>
                    {getDiff(thisMonthStats.codingHours, lastMonthStats.codingHours, 'h')}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Month Grade:</span>
                  <span className="font-extrabold text-blue-400">{monthGrade}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 pt-6 mt-6">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Productivity Insights</span>
          <div className="flex flex-col gap-2.5">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
