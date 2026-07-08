import { useTrackerStore } from '../store/useTrackerStore';
import { calculateDayEfficiency, calculateCodingHours, calculateHabitConsistency, calculateWeeklyGrade } from '../utils/trackerCalculations';
import { getDatesRange, getLocalDateString } from '../utils/dateHelpers';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Terminal, CheckCircle2, Award, Zap } from 'lucide-react';

export default function DashboardStats() {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const logs = useTrackerStore(state => state.logs);
  const xp = useTrackerStore(state => state.xp);
  const level = useTrackerStore(state => state.level);
  const streakState = useTrackerStore(state => state.streakState);
  const goals = useTrackerStore(state => state.goals);

  const todayTasks = logs[selectedDate] || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const remainingToday = todayTasks.length - completedToday;
  const efficiencyToday = calculateDayEfficiency(todayTasks);

  const coding = calculateCodingHours(logs);

  const templeConsistency = calculateHabitConsistency(logs, 'temple');
  const footballConsistency = calculateHabitConsistency(logs, 'football');
  const sleepConsistency = calculateHabitConsistency(logs, 'sleep');
  const revisionConsistency = calculateHabitConsistency(logs, 'revision');
  const wakeConsistency = calculateHabitConsistency(logs, 'wake');

  const dates = getDatesRange();
  let totalEff = 0;
  let loggedDaysCount = 0;
  const todayStr = getLocalDateString();

  dates.forEach(d => {
    if (d <= todayStr) {
      const dTasks = logs[d] || [];
      const checked = dTasks.some(t => t.completed);
      if (checked || d === todayStr) {
        totalEff += calculateDayEfficiency(dTasks);
        loggedDaysCount++;
      }
    }
  });

  const averageEfficiency = loggedDaysCount > 0 ? Math.round(totalEff / loggedDaysCount) : 0;
  const weeklyGrade = calculateWeeklyGrade(averageEfficiency);

  const xpProgress = xp % 150;
  const xpPercent = Math.round((xpProgress / 150) * 100);

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col justify-between h-[180px] shadow-lg hover:border-white/10 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Level & Experience</span>
            <h4 className="text-2xl font-bold mt-1 text-white">Level {level}</h4>
          </div>
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between text-xs text-white/50 font-medium">
            <span>Progress to Level {level + 1}</span>
            <span>{xpProgress} / 150 XP</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <span className="text-[10px] text-white/30 text-right">Total: {xp} XP</span>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col justify-between h-[180px] shadow-lg hover:border-white/10 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Task Completion</span>
            <h4 className="text-2xl font-bold mt-1 text-white">{completedToday} <span className="text-white/40 text-sm font-normal">completed</span></h4>
          </div>
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between text-xs text-white/50 font-medium">
            <span>Today's Task Status</span>
            <span>{remainingToday} remaining</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${efficiencyToday}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>Overall efficiency</span>
            <span>{efficiencyToday}%</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col justify-between h-[180px] shadow-lg hover:border-white/10 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Streak Tracker</span>
            <h4 className="text-2xl font-bold mt-1 text-white">{streakState.currentStreak} <span className="text-white/40 text-sm font-normal">days</span></h4>
          </div>
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
            <Flame className="w-5 h-5 fill-orange-500/10" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <span className="text-xs text-white/50 font-medium">Longest Consistency Streak</span>
          <span className="text-xl font-bold text-white/80">{streakState.longestStreak} <span className="text-white/40 text-xs font-normal">days</span></span>
          <span className="text-[10px] text-white/30">Maintain {`>=`} 80% daily efficiency</span>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col justify-between h-[180px] shadow-lg hover:border-white/10 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Consistency Grade</span>
            <h4 className="text-2xl font-bold mt-1 text-white">{weeklyGrade} Grade</h4>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <span className="text-xs text-white/50 font-medium">Average Performance</span>
          <span className="text-xl font-bold text-white/80">{averageEfficiency}% <span className="text-white/40 text-xs font-normal">efficiency</span></span>
          <span className="text-[10px] text-white/30">Calculated over logged days</span>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="md:col-span-2 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/10 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Coding Log Hours</span>
          </div>
          <h4 className="text-3xl font-extrabold text-white mt-2">
            {coding.total} <span className="text-white/40 text-sm font-normal">hours accumulated</span>
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col bg-white/5 border border-white/5 p-3.5 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Python</span>
            <span className="text-base font-bold text-white mt-1">{coding.python} hrs</span>
            <div className="w-full h-1 bg-blue-500/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (coding.python / 50) * 100)}%` }} />
            </div>
          </div>

          <div className="flex flex-col bg-white/5 border border-white/5 p-3.5 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Web Dev</span>
            <span className="text-base font-bold text-white mt-1">{coding.web} hrs</span>
            <div className="w-full h-1 bg-purple-500/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (coding.web / 50) * 100)}%` }} />
            </div>
          </div>

          <div className="flex flex-col bg-white/5 border border-white/5 p-3.5 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Project</span>
            <span className="text-base font-bold text-white mt-1">{coding.project} hrs</span>
            <div className="w-full h-1 bg-pink-500/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min(100, (coding.project / 50) * 100)}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="md:col-span-2 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl shadow-lg hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>Active Goals</span>
        </div>

        <div className="flex flex-col gap-4 mt-5">
          {goals.map((g) => {
            const goalPercent = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/80">{g.name}</span>
                  <span className="text-white/50">{g.current} / {g.target} {g.unit}</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="md:col-span-4 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl shadow-lg hover:border-white/10 transition-colors"
      >
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-4">
          Habit Consistency Distribution
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Temple', rate: templeConsistency, color: 'text-rose-400', barColor: 'bg-rose-500' },
            { label: 'Football', rate: footballConsistency, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
            { label: 'Sleep', rate: sleepConsistency, color: 'text-indigo-400', barColor: 'bg-indigo-500' },
            { label: 'Revision', rate: revisionConsistency, color: 'text-yellow-400', barColor: 'bg-yellow-500' },
            { label: 'Wake-up', rate: wakeConsistency, color: 'text-pink-400', barColor: 'bg-pink-500' }
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-white/50 font-medium">{item.label}</span>
              <span className={`text-2xl font-black mt-2 ${item.color}`}>{item.rate}%</span>
              <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${item.barColor} rounded-full`} style={{ width: `${item.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
