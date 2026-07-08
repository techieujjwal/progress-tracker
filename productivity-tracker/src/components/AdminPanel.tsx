import { useState, useMemo } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { calculateDayEfficiency } from '../utils/trackerCalculations';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ShieldAlert, Users, Calendar, Activity, TrendingUp, Key, LogOut, Check } from 'lucide-react';

export default function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'users' | 'database' | 'feedback' | 'logs'>('dashboard');

  const logs = useTrackerStore(state => state.logs);
  const templates = useTrackerStore(state => state.templates);
  const feedback = useTrackerStore(state => state.feedback);
  const systemLogs = useTrackerStore(state => state.systemLogs);
  const profile = useTrackerStore(state => state.profile);
  const xp = useTrackerStore(state => state.xp);
  const level = useTrackerStore(state => state.level);
  const selectedDate = useTrackerStore(state => state.selectedDate);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'ujjwal@admin.in' && password === 'wantedgamer') {
      setIsLogged(true);
      setLoginError('');
    } else {
      setLoginError('Invalid administrative credentials');
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setEmail('');
    setPassword('');
  };

  const systemStats = useMemo(() => {
    const totalDaysLogged = Object.keys(logs).length;
    let totalCompletedTasks = 0;
    let totalTasksCount = 0;
    let efficiencySum = 0;

    Object.values(logs).forEach(dayTasks => {
      totalTasksCount += dayTasks.length;
      totalCompletedTasks += dayTasks.filter(t => t.completed).length;
      efficiencySum += calculateDayEfficiency(dayTasks);
    });

    const averageProductivity = totalDaysLogged > 0 ? Math.round(efficiencySum / totalDaysLogged) : 85;

    return {
      totalDaysLogged,
      totalCompletedTasks,
      totalTasksCount,
      averageProductivity
    };
  }, [logs]);

  const saasGrowthData = [
    { month: 'Jan', DAU: 120, MAU: 450, signups: 80 },
    { month: 'Feb', DAU: 240, MAU: 680, signups: 150 },
    { month: 'Mar', DAU: 380, MAU: 950, signups: 220 },
    { month: 'Apr', DAU: 512, MAU: 1240, signups: 310 },
    { month: 'May', DAU: 680, MAU: 1580, signups: 420 },
    { month: 'Jun', DAU: 812, MAU: 1910, signups: 550 }
  ];

  const templatePopularity = useMemo(() => {
    return [
      { name: 'Standard Daily', value: 432, color: '#3b82f6' },
      { name: 'College Semester', value: 298, color: '#06b6d4' },
      { name: 'Gym & Fitness', value: 187, color: '#10b981' },
      { name: 'Weekend Hobbies', value: 145, color: '#ec4899' },
      { name: 'Office Sprints', value: 98, color: '#8b5cf6' },
      { name: 'Exam Prep', value: 65, color: '#ef4444' }
    ];
  }, []);

  const habitRadar = [
    { subject: 'Coding', A: 92, B: 85, fullMark: 100 },
    { subject: 'Exercise', A: 85, B: 75, fullMark: 100 },
    { subject: 'Revision', A: 78, B: 60, fullMark: 100 },
    { subject: 'Temple', A: 88, B: 80, fullMark: 100 },
    { subject: 'Sleep', A: 95, B: 85, fullMark: 100 }
  ];

  const retentionCohort = [
    { name: 'Week 1', rate: 100 },
    { name: 'Week 2', rate: 84 },
    { name: 'Week 3', rate: 76 },
    { name: 'Week 4', rate: 68 },
    { name: 'Week 5', rate: 62 },
    { name: 'Week 6', rate: 58 }
  ];

  if (!isLogged) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#111827]/40 border border-white/5 p-8 rounded-[24px] backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Administrative Portal</h2>
          <p className="text-white/40 text-xs">Verify credentials to access server analytics & user logs</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/40">Email ID</label>
            <input
              type="email"
              required
              placeholder="admin@admin.com.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/40">Access Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/40"
            />
          </div>

          {loginError && (
            <div className="text-rose-400 text-xs font-semibold text-center mt-1">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> Authenticate Terminal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Console Root</h3>
            <p className="text-[10px] text-white/40">Secure administrator environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
              activeSubTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            SaaS Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
              activeSubTab === 'users' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setActiveSubTab('database')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
              activeSubTab === 'database' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Database Explorer
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
              activeSubTab === 'feedback' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Feedback ({feedback.length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all ${
              activeSubTab === 'logs' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all"
            title="Log Out Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Total SaaS Signups</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">1,240</div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18.4% this month
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Daily Active Users</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">812</div>
              <div className="text-[9px] text-white/40 font-medium mt-1">
                65.4% Daily Active Rate (Stickiness)
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Avg User Efficiency</span>
                <Check className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{systemStats.averageProductivity}%</div>
              <div className="text-[9px] text-white/40 font-medium mt-1">
                Based on your actual logged records
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Active Templates</span>
                <Calendar className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{templates.length}</div>
              <div className="text-[9px] text-white/40 font-medium mt-1">
                6 Default presets + custom builders
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[330px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Daily Active vs Monthly Active (DAU/MAU)</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Simulated growth timeline over last 6 months</p>
              </div>
              <div className="flex-1 min-h-0 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={saasGrowthData}>
                    <defs>
                      <linearGradient id="dauColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="mauColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="DAU" stroke="#3b82f6" fillOpacity={1} fill="url(#dauColor)" />
                    <Area type="monotone" dataKey="MAU" stroke="#10b981" fillOpacity={1} fill="url(#mauColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[330px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Template Installs Distribution</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Most applied preset options across server accounts</p>
              </div>
              <div className="flex-1 min-h-0 mt-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={templatePopularity}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {templatePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 text-[9px] text-white/60 ml-4">
                  {templatePopularity.slice(0, 4).map(tp => (
                    <div key={tp.name} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tp.color }} />
                      <span className="font-semibold">{tp.name} ({tp.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">User Retention Curve</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Average weekly repeat activity rate</p>
              </div>
              <div className="flex-1 min-h-0 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retentionCohort}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                    <ChartTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {retentionCohort.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Habit Completion Quality Radar</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Aggregates comparison: Current Period (A) vs Prev (B)</p>
              </div>
              <div className="flex-1 min-h-0 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={habitRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" fontSize={8} />
                    <Radar name="Active Period" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                    <Radar name="Previous Period" dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.05} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl h-[320px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Recent Admin Activity</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Most recent administrative database logs</p>
              </div>
              <div className="flex-1 mt-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                {systemLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="flex gap-2.5 items-start">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'error' ? 'bg-rose-400' : log.type === 'warn' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-[10px] text-white/80 font-medium leading-relaxed">{log.message}</div>
                      <div className="text-[8px] text-white/30 font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl">
          <h4 className="text-sm font-bold text-white mb-1">Active User Accounts</h4>
          <p className="text-xs text-white/40 mb-6">Database users registered on this browser instance</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-semibold">
                  <th className="pb-3 pr-4">User Avatar</th>
                  <th className="pb-3 px-4">Username</th>
                  <th className="pb-3 px-4">Level & XP</th>
                  <th className="pb-3 px-4">Active Theme</th>
                  <th className="pb-3 px-4">Logged Days</th>
                  <th className="pb-3 pl-4">System Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="text-white/80">
                  <td className="py-4 pr-4">
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                  </td>
                  <td className="py-4 px-4 font-bold text-white">{profile.username} (You)</td>
                  <td className="py-4 px-4 font-mono font-bold text-purple-400">Level {level} ({xp} XP)</td>
                  <td className="py-4 px-4">
                    <span className="capitalize bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {profile.theme}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold">{systemStats.totalDaysLogged} Days</td>
                  <td className="py-4 pl-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'database' && (
        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Database JSON Inspector</h4>
            <p className="text-xs text-white/40 mt-0.5">Read-only live representation of Zustand local state storage</p>
          </div>

          <div className="relative">
            <pre className="bg-[#09090b] border border-white/10 p-5 rounded-2xl text-[10px] text-blue-400 font-mono overflow-auto max-h-[450px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {JSON.stringify({
                xp,
                level,
                selectedDate,
                profile,
                templatesCount: templates.length,
                logsCount: Object.keys(logs).length,
                feedbackCount: feedback.length,
                logs
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'feedback' && (
        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-bold text-white">Customer Feedback Manager</h4>
            <p className="text-xs text-white/40 mt-0.5">Reviews submitted by SaaS users</p>
          </div>

          <div className="flex flex-col gap-4">
            {feedback.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs">
                No user feedback submitted yet
              </div>
            ) : (
              feedback.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col gap-2.5 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[10px] text-white/40 ml-2">({item.email})</span>
                    </div>
                    <span className="text-[9px] text-white/30 font-mono">{item.date}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-medium">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">System Operations Terminal</h4>
            <p className="text-xs text-white/40 mt-0.5">Audit log tracks client actions, backup updates and syncs</p>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {systemLogs.map(log => (
              <div key={log.id} className="flex items-center gap-4 py-2 border-b border-white/5 text-[10px] font-mono">
                <span className="text-white/30 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`px-1.5 py-0.5 rounded uppercase font-bold shrink-0 text-[8px] ${
                  log.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  log.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {log.type}
                </span>
                <span className="text-white/80 truncate flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
