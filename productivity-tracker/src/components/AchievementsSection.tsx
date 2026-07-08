import { useTrackerStore } from '../store/useTrackerStore';
import { getDatesRange } from '../utils/dateHelpers';
import { calculateDayEfficiency } from '../utils/trackerCalculations';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Award, Crown, Trophy, Terminal, Cpu, Heart, Lock } from 'lucide-react';

export default function AchievementsSection() {
  const xp = useTrackerStore(state => state.xp);
  const level = useTrackerStore(state => state.level);
  const achievements = useTrackerStore(state => state.achievements);
  const logs = useTrackerStore(state => state.logs);
  const streakState = useTrackerStore(state => state.streakState);

  const dates = getDatesRange();

  let pythonCount = 0;
  let projectCount = 0;
  let templeCount = 0;
  let perfectDaysCount = 0;

  const efficiencies: Record<string, number> = {};
  dates.forEach(d => {
    const dTasks = logs[d] || [];
    const eff = calculateDayEfficiency(dTasks);
    efficiencies[d] = eff;
    if (eff === 100) {
      perfectDaysCount++;
    }
    dTasks.forEach(t => {
      if (t.completed) {
        if (t.id === 'python') pythonCount++;
        if (t.id === 'project_dev') projectCount++;
        if (t.id === 'temple_morning' || t.id === 'temple_evening') templeCount++;
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

  const getAchievementProgress = (achId: string) => {
    if (achId === 'streak_7') return { current: streakState.longestStreak, text: `${streakState.longestStreak} / 7 days` };
    if (achId === 'streak_15') return { current: streakState.longestStreak, text: `${streakState.longestStreak} / 15 days` };
    if (achId === 'streak_30') return { current: streakState.longestStreak, text: `${streakState.longestStreak} / 30 days` };
    if (achId === 'perfect_day') return { current: perfectDaysCount, text: `${perfectDaysCount} / 1 day` };
    if (achId === 'perfect_week') return { current: longestPerfectStreak, text: `${longestPerfectStreak} / 7 days` };
    if (achId === 'perfect_month') return { current: longestPerfectStreak, text: `${longestPerfectStreak} / 30 days` };
    if (achId === 'python_100') return { current: pythonCount, text: `${pythonCount} / 100 blocks` };
    if (achId === 'project_100') return { current: projectCount, text: `${projectCount} / 100 blocks` };
    if (achId === 'temple_100') return { current: templeCount, text: `${templeCount} / 100 visits` };
    return { current: 0, text: '0 / 0' };
  };

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const baseColor = isUnlocked ? 'text-white' : 'text-white/20';

    switch (iconName) {
      case 'Flame':
        return <Flame className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#f97316' : 'none'} />;
      case 'FlameKindling':
        return <Flame className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#ea580c' : 'none'} />;
      case 'Sparkles':
        return <Sparkles className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#fbbf24' : 'none'} />;
      case 'Award':
        return <Award className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#3b82f6' : 'none'} />;
      case 'Crown':
        return <Crown className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#a855f7' : 'none'} />;
      case 'Trophy':
        return <Trophy className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#eab308' : 'none'} />;
      case 'Terminal':
        return <Terminal className={`${baseColor} w-8 h-8`} />;
      case 'Cpu':
        return <Cpu className={`${baseColor} w-8 h-8`} />;
      case 'Heart':
        return <Heart className={`${baseColor} w-8 h-8`} fill={isUnlocked ? '#f43f5e' : 'none'} />;
      default:
        return <Lock className="text-white/20 w-8 h-8" />;
    }
  };

  const xpProgress = xp % 150;
  const xpPercent = Math.round((xpProgress / 150) * 100);

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
            {level}
          </div>
          <div>
            <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">Level Status</span>
            <h4 className="text-lg font-bold text-white mt-0.5">Ujjwal's Level {level}</h4>
            <p className="text-white/40 text-xs mt-1">Complete activities daily to gain XP and unlock achievements</p>
          </div>
        </div>

        <div className="flex-1 max-w-md flex flex-col gap-2 w-full">
          <div className="flex justify-between text-xs text-white/50 font-medium">
            <span>XP Progress to Level {level + 1}</span>
            <span>{xpProgress} / 150 XP ({xpPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlockedAt !== null;
          const prog = getAchievementProgress(ach.id);
          const progPercent = Math.min(100, Math.round((prog.current / ach.criteria.target) * 100));

          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`relative overflow-hidden bg-[#111827]/40 border p-6 rounded-[24px] backdrop-blur-xl shadow-lg flex flex-col justify-between h-[210px] transition-colors ${
                isUnlocked 
                  ? 'border-purple-500/30 bg-[#111827]/60 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnlocked 
                    ? 'bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                    : 'bg-white/5 border border-white/5'
                }`}>
                  {getBadgeIcon(ach.icon, isUnlocked)}
                </div>
                <div className="flex flex-col gap-1">
                  <h5 className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                    {ach.name}
                  </h5>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between text-[10px] text-white/50 font-semibold">
                  <span>{isUnlocked ? 'Completed' : 'Progress'}</span>
                  <span>{prog.text}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                    }`}
                    style={{ width: `${isUnlocked ? 100 : progPercent}%` }}
                  />
                </div>
                {isUnlocked && ach.unlockedAt && (
                  <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider mt-1 block">
                    Unlocked {new Date(ach.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
