import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { calculateDayEfficiency } from '../utils/trackerCalculations';
import { Globe, ArrowLeft, Sparkles, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function PublicDashboard() {
  const profile = useAuthStore(s => s.publicViewerProfile);
  const setPublicViewMode = useAuthStore(s => s.setPublicViewMode);
  const setPublicViewerProfile = useAuthStore(s => s.setPublicViewerProfile);

  const [viewDate, setViewDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!profile) return null;

  const dayTasks = profile.logs[viewDate] || [];
  const efficiency = calculateDayEfficiency(dayTasks);
  const completedCount = dayTasks.filter(t => t.completed).length;

  const sortedDates = useMemo(() => {
    return Object.keys(profile.logs).sort().reverse();
  }, [profile.logs]);

  const recentDates = sortedDates.slice(0, 14);

  const handleExit = () => {
    setPublicViewMode(false);
    setPublicViewerProfile(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('u');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen text-white relative font-sans pb-12" style={{ background: '#09090b' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-bold">
              Viewing {profile.username}&apos;s Public Dashboard
            </span>
          </div>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to my tracker
          </button>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-5"
        >
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
            />
          )}
          <div>
            <h1 className="text-2xl font-black text-white">{profile.username}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Level {profile.level}
              </span>
              <span className="text-xs text-white/40">{profile.xp} XP</span>
              <span className="text-xs text-white/40">{sortedDates.length} days tracked</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {recentDates.map(date => {
            const tasks = profile.logs[date] || [];
            const eff = calculateDayEfficiency(tasks);
            const isSelected = date === viewDate;
            return (
              <button
                key={date}
                onClick={() => setViewDate(date)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500/40'
                    : 'bg-[#111827]/60 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] text-white/50 font-semibold">{date}</span>
                </div>
                <div className={`text-lg font-black ${eff === 100 ? 'text-emerald-400' : eff >= 50 ? 'text-blue-400' : 'text-white/60'}`}>
                  {eff}%
                </div>
              </button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827]/60 border border-white/5 rounded-[24px] p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">{viewDate}</h2>
              <p className="text-xs text-white/40 mt-0.5">
                {completedCount} of {dayTasks.length} tasks completed
              </p>
            </div>
            <div className={`text-2xl font-black ${efficiency === 100 ? 'text-emerald-400' : efficiency >= 50 ? 'text-blue-400' : 'text-white/50'}`}>
              {efficiency}%
            </div>
          </div>

          {dayTasks.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">No tasks recorded for this date.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dayTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/20 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${task.completed ? 'text-white' : 'text-white/50'}`}>
                      {task.label}
                    </span>
                    <span className="text-[10px] text-white/30 ml-2">{task.time}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{task.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
