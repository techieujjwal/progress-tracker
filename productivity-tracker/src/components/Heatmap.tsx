import { useTrackerStore } from '../store/useTrackerStore';
import { getDatesRange, formatDateShort, START_DATE, getLocalDateString } from '../utils/dateHelpers';
import { calculateDayEfficiency } from '../utils/trackerCalculations';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function Heatmap() {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const setSelectedDate = useTrackerStore(state => state.setSelectedDate);
  const logs = useTrackerStore(state => state.logs);

  const dates = getDatesRange();
  const sortedDates = [...dates].sort();

  const firstDate = new Date(START_DATE);
  const firstDayOfWeek = firstDate.getDay();

  const padCount = firstDayOfWeek;
  const todayStr = getLocalDateString();

  const getCellColor = (dateStr: string, efficiency: number) => {
    const isSelected = dateStr === selectedDate;
    const isFuture = dateStr > todayStr;

    if (isFuture) {
      return isSelected 
        ? 'bg-[#1f2937] border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
        : 'bg-white/5 border-white/5 hover:border-white/20';
    }

    let colorClass: string;
    if (efficiency === 100) {
      colorClass = 'bg-blue-500 border-blue-400 hover:bg-blue-400';
    } else if (efficiency >= 80) {
      colorClass = 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500';
    } else if (efficiency >= 40) {
      colorClass = 'bg-amber-500 border-amber-400 hover:bg-amber-400';
    } else {
      colorClass = 'bg-rose-700 border-rose-600 hover:bg-rose-600';
    }

    if (isSelected) {
      return `${colorClass} border-blue-400 scale-110 shadow-[0_0_12px_rgba(59,130,246,0.6)] z-10`;
    }
    return `${colorClass} border-transparent`;
  };

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="flex flex-col gap-6 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl shadow-xl">
        <div>
          <h3 className="text-lg font-semibold text-white">Consistency Grid</h3>
          <p className="text-white/40 text-xs mt-1">
            Visual log of daily productivity. Click a cell to view and edit that day's timetable.
          </p>
        </div>

        <div className="flex flex-col items-center overflow-x-auto w-full py-4 scrollbar-thin">
          <div className="flex gap-3">
            <div className="grid grid-rows-7 gap-1 text-[10px] text-white/30 pr-1 select-none font-semibold justify-items-end h-[116px] leading-[14px]">
              <span>Sun</span>
              <span className="invisible">Mon</span>
              <span>Tue</span>
              <span className="invisible">Wed</span>
              <span>Thu</span>
              <span className="invisible">Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-[116px]">
              {[...Array(padCount)].map((_, i) => (
                <div key={`pad-${i}`} className="w-3.5 h-3.5 opacity-0 pointer-events-none" />
              ))}

              {sortedDates.map((dateStr) => {
                const dayTasks = logs[dateStr] || [];
                const efficiency = calculateDayEfficiency(dayTasks);
                const completedCount = dayTasks.filter(t => t.completed).length;
                const totalXP = dayTasks.reduce((sum, t) => sum + (t.completed ? t.xp : 0), 0);

                return (
                  <Tooltip.Root key={dateStr}>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => setSelectedDate(dateStr)}
                        className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-pointer outline-none hover:scale-125 hover:z-20 ${getCellColor(
                          dateStr,
                          efficiency
                        )}`}
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        sideOffset={5}
                        className="bg-[#111827] border border-white/10 rounded-xl p-3 shadow-2xl text-xs text-white z-50 flex flex-col gap-1.5 min-w-[150px] backdrop-blur-md"
                      >
                        <div className="font-semibold border-b border-white/5 pb-1 mb-1 text-white/90">
                          {formatDateShort(dateStr)}
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/50">Efficiency:</span>
                          <span className="font-bold text-blue-400">{efficiency}%</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/50">Completed:</span>
                          <span className="font-bold">{completedCount} / 16</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/50">XP Earned:</span>
                          <span className="font-bold text-purple-400">+{totalXP} XP</span>
                        </div>
                        <Tooltip.Arrow className="fill-[#111827] stroke-white/10 stroke-1" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 text-[10px] text-white/40 border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-700" />
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span>More</span>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
