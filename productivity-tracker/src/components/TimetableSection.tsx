import { useState, useMemo } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { getPreviousDay, getNextDay, formatDateLabel, START_DATE, END_DATE, getLocalDateString } from '../utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar as CalendarIcon, 
  Sparkles, 
  FileText, 
  Check, 
  Clock,
  Terminal,
  Activity,
  Moon,
  Compass,
  Heart
} from 'lucide-react';

export default function TimetableSection() {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const setSelectedDate = useTrackerStore(state => state.setSelectedDate);
  const activeTaskId = useTrackerStore(state => state.activeTaskId);
  const setActiveTaskId = useTrackerStore(state => state.setActiveTaskId);
  const logs = useTrackerStore(state => state.logs);
  const toggleTask = useTrackerStore(state => state.toggleTask);
  const updateTaskNotes = useTrackerStore(state => state.updateTaskNotes);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'coding' | 'exercise' | 'temple' | 'sleep'>('all');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  const tasks = logs[selectedDate] || [];

  const handleToggle = async (taskId: string) => {
    const wasCompleted = tasks.find(t => t.id === taskId)?.completed;
    const { perfectDay } = toggleTask(selectedDate, taskId);

    if (!wasCompleted && perfectDay) {
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#a855f7', '#10b981']
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding': return <Terminal className="w-4 h-4 text-blue-400" />;
      case 'exercise': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'temple': return <Heart className="w-4 h-4 text-rose-400/80" fill="currentColor" />;
      case 'sleep': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'wake': return <Sparkles className="w-4 h-4 text-yellow-400" />;
      default: return <Compass className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTasks = useMemo(() => {
    const currentTasks = logs[selectedDate] || [];
    return currentTasks.filter(task => {
      const matchesSearch = task.label.toLowerCase().includes(search.toLowerCase()) || 
                            task.notes.toLowerCase().includes(search.toLowerCase()) ||
                            task.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      if (filter === 'coding') return task.category === 'coding';
      if (filter === 'exercise') return task.category === 'exercise';
      if (filter === 'temple') return task.category === 'temple';
      if (filter === 'sleep') return task.category === 'sleep';

      return true;
    });
  }, [logs, selectedDate, search, filter]);

  const jumpToToday = () => {
    const todayStr = getLocalDateString();
    if (todayStr >= START_DATE && todayStr <= END_DATE) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(START_DATE);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const prev = getPreviousDay(selectedDate);
              if (prev) setSelectedDate(prev);
            }}
            disabled={!getPreviousDay(selectedDate)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="relative flex items-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-2 transition-colors cursor-pointer">
            <CalendarIcon className="w-4 h-4 text-blue-400 mr-2 pointer-events-none" />
            <span className="text-sm font-semibold pr-2 pointer-events-none">{formatDateLabel(selectedDate)}</span>
            <input
              type="date"
              min={START_DATE}
              max={END_DATE}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              const next = getNextDay(selectedDate);
              if (next) setSelectedDate(next);
            }}
            disabled={!getNextDay(selectedDate)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-white/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={jumpToToday}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          Jump to Today
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-white/30 text-white outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {(['all', 'completed', 'pending', 'coding', 'exercise', 'temple', 'sleep'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                filter === opt
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 min-h-[350px]">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-white/40 py-12"
            >
              <Search className="w-10 h-10 mb-3 opacity-30 text-blue-400" />
              <p className="text-sm font-medium">No activities found</p>
              <p className="text-xs text-white/20 mt-1">Try adjusting your filters or search keywords</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const isActive = task.id === activeTaskId;
              const isNotesExpanded = expandedNotesId === task.id;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`relative flex flex-col overflow-hidden bg-[#1f2937]/20 border rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-[#1f2937]/40' 
                      : 'border-white/5 hover:border-white/10 hover:bg-[#1f2937]/30'
                  }`}
                >
                  <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(task.id);
                        }}
                        className={`relative w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          task.completed 
                            ? 'bg-blue-600 border-blue-500 text-white scale-95' 
                            : 'bg-white/5 border-white/15 text-transparent hover:border-white/30'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4" strokeWidth={3} />}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm sm:text-base font-semibold truncate ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                          {task.label}
                        </span>
                        <div className="flex items-center gap-3 text-white/40 text-xs mt-1">
                          <span className="font-mono text-white/50 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {task.time}
                          </span>
                          <span className="flex items-center gap-1.5 capitalize">
                            {getCategoryIcon(task.category)}
                            {task.category}
                          </span>
                          {task.completed && task.completedAt && (
                            <span className="text-blue-400 font-medium">
                              Done at {task.completedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <span className="px-2.5 py-1 text-xs bg-white/5 border border-white/5 text-purple-400 font-bold rounded-lg shrink-0">
                        +{task.xp} XP
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNotesId(isNotesExpanded ? null : task.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          task.notes 
                            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' 
                            : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isNotesExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-black/30 border-t border-white/5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 flex flex-col gap-2">
                          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                            Daily Notes
                          </label>
                          <textarea
                            value={task.notes}
                            onChange={(e) => updateTaskNotes(selectedDate, task.id, e.target.value)}
                            placeholder="Add important details or journal entries..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/5 focus:border-blue-500/50 rounded-xl p-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
