import { useMemo } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { getDatesRange, formatDateShort } from '../utils/dateHelpers';
import { calculateDayEfficiency, calculateHabitConsistency } from '../utils/trackerCalculations';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function AnalyticsSection() {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const logs = useTrackerStore(state => state.logs);

  const sortedDates = useMemo(() => {
    return getDatesRange().sort();
  }, []);

  const todayTasks = logs[selectedDate] || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const remainingToday = todayTasks.length - completedToday;

  const donutData = useMemo(() => {
    return [
      { name: 'Completed', value: completedToday, color: '#3b82f6' },
      { name: 'Remaining', value: remainingToday, color: 'rgba(255,255,255,0.05)' }
    ];
  }, [completedToday, remainingToday]);

  const radarData = useMemo(() => {
    return [
      { subject: 'Python', value: calculateHabitConsistency(logs, 'python') },
      { subject: 'Web Dev', value: calculateHabitConsistency(logs, 'web_dev') },
      { subject: 'Project', value: calculateHabitConsistency(logs, 'project_dev') },
      { subject: 'Temple', value: calculateHabitConsistency(logs, 'temple') },
      { subject: 'Football', value: calculateHabitConsistency(logs, 'football') },
      { subject: 'Sleep', value: calculateHabitConsistency(logs, 'sleep') },
      { subject: 'Revision', value: calculateHabitConsistency(logs, 'revision') }
    ];
  }, [logs]);

  const pieData = useMemo(() => {
    let totalCoding = 0;
    let totalExercise = 0;
    let totalTemple = 0;
    let totalEntertainment = 0;
    let totalRest = 0;

    Object.values(logs).forEach(tasks => {
      tasks.forEach(t => {
        if (t.completed) {
          if (t.category === 'coding') {
            if (t.id === 'python') totalCoding += 1.33;
            if (t.id === 'web_dev') totalCoding += 2.0;
            if (t.id === 'project_dev') totalCoding += 1.92;
          } else if (t.category === 'exercise') {
            if (t.id === 'park') totalExercise += 0.75;
            if (t.id === 'football') totalExercise += 1.5;
          } else if (t.category === 'temple') {
            if (t.id === 'temple_morning') totalTemple += 0.25;
            if (t.id === 'temple_evening') totalTemple += 1.0;
          } else if (t.id === 'food_mobile') {
            totalEntertainment += 1.0;
          } else {
            if (t.id === 'wake') totalRest += 0.25;
            if (t.id === 'school') totalRest += 0.5;
            if (t.id === 'breakfast') totalRest += 0.5;
            if (t.id === 'rest_phone') totalRest += 2.0;
            if (t.id === 'lunch_rest') totalRest += 2.0;
            if (t.id === 'dinner_rest') totalRest += 0.5;
          }
        }
      });
    });

    return [
      { name: 'Coding', value: parseFloat(totalCoding.toFixed(1)), color: '#3b82f6' },
      { name: 'Exercise', value: parseFloat(totalExercise.toFixed(1)), color: '#10b981' },
      { name: 'Temple', value: parseFloat(totalTemple.toFixed(1)), color: '#f43f5e' },
      { name: 'Entertainment', value: parseFloat(totalEntertainment.toFixed(1)), color: '#eab308' },
      { name: 'Rest', value: parseFloat(totalRest.toFixed(1)), color: '#8b5cf6' }
    ].filter(d => d.value > 0);
  }, [logs]);

  const barData = useMemo(() => {
    const selectedIdx = sortedDates.indexOf(selectedDate);
    const startIdx = Math.max(0, selectedIdx - 9);
    const endIdx = selectedIdx;
    const barChartDates = sortedDates.slice(startIdx, endIdx + 1);

    return barChartDates.map(d => {
      const dTasks = logs[d] || [];
      return {
        name: formatDateShort(d),
        efficiency: calculateDayEfficiency(dTasks)
      };
    });
  }, [logs, selectedDate, sortedDates]);

  const lineData = useMemo(() => {
    const selectedIdx = sortedDates.indexOf(selectedDate);
    return sortedDates.slice(0, selectedIdx + 1).map((d, idx, arr) => {
      const recentDays = arr.slice(Math.max(0, idx - 6), idx + 1);
      const sum = recentDays.reduce((acc, currentDay) => {
        const dTasks = logs[currentDay] || [];
        return acc + calculateDayEfficiency(dTasks);
      }, 0);
      const avg = recentDays.length > 0 ? Math.round(sum / recentDays.length) : 0;
      return {
        name: formatDateShort(d),
        trend: avg
      };
    }).slice(-12);
  }, [logs, selectedDate, sortedDates]);

  const areaData = useMemo(() => {
    const weeklyDataMap: Record<string, number[]> = {};
    sortedDates.forEach((d, idx) => {
      const weekNum = Math.floor(idx / 7) + 1;
      const weekKey = `Week ${weekNum}`;
      if (!weeklyDataMap[weekKey]) weeklyDataMap[weekKey] = [];
      const dTasks = logs[d] || [];
      weeklyDataMap[weekKey].push(calculateDayEfficiency(dTasks));
    });

    return Object.entries(weeklyDataMap).map(([week, effs]) => {
      const avg = Math.round(effs.reduce((s, v) => s + v, 0) / effs.length);
      return { name: week, productivity: avg };
    });
  }, [logs, sortedDates]);

  const customTooltip = (props: unknown) => {
    const { active, payload } = props as { active?: boolean; payload?: Array<{ name: string; value: number }> };
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white/60 text-xs font-semibold">{payload[0].name}</p>
          <p className="text-sm font-bold text-blue-400 mt-1">
            {payload[0].value}% Efficiency
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Daily Tasks Completion</h4>
          <p className="text-white/40 text-xs mt-0.5">Ratio of completed tasks for selected day</p>
        </div>
        <div className="flex-1 min-h-0 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white">{completedToday}</span>
            <span className="text-[10px] text-white/40">of {todayTasks.length} tasks</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Habit Performance Radar</h4>
          <p className="text-white/40 text-xs mt-0.5">Completion percentage per category</p>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={false} />
              <Radar
                name="Consistency"
                dataKey="value"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Time Distribution</h4>
          <p className="text-white/40 text-xs mt-0.5">Hours logged per category across logs</p>
        </div>
        {pieData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
            Check some tasks to view distribution
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}h)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between lg:col-span-2">
        <div>
          <h4 className="text-sm font-semibold text-white">Daily Efficiency Log</h4>
          <p className="text-white/40 text-xs mt-0.5">Daily efficiency % for last 10 tracked days</p>
        </div>
        <div className="flex-1 min-h-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="efficiency" radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Consistency Trend</h4>
          <p className="text-white/40 text-xs mt-0.5">7-day rolling average efficiency trend</p>
        </div>
        <div className="flex-1 min-h-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between lg:col-span-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Weekly Productivity Curve</h4>
          <p className="text-white/40 text-xs mt-0.5">Average weekly productivity across date range</p>
        </div>
        <div className="flex-1 min-h-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="productivity"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
