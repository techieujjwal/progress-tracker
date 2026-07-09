import { useRef, useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { useAuthStore } from '../store/useAuthStore';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { cloudService } from '../services/cloudSync';
import { getDatesRange, formatDateLabel } from '../utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDayEfficiency, calculateCodingHours, calculateHabitConsistency } from '../utils/trackerCalculations';
import {
  Upload,
  Trash2,
  RefreshCw,
  FileJson,
  FileText,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  FileImage,
  User,
  Sparkles,
  MessageSquare,
  Volume2,
  Cloud,
  LogIn,
  LogOut,
  Globe
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
];

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#8b5cf6' }
];

export default function SettingsSection() {
  const xp = useTrackerStore(state => state.xp);
  const level = useTrackerStore(state => state.level);
  const logs = useTrackerStore(state => state.logs);
  const streakState = useTrackerStore(state => state.streakState);
  const profile = useTrackerStore(state => state.profile);
  const updateUserProfile = useTrackerStore(state => state.updateUserProfile);
  const addFeedback = useTrackerStore(state => state.addFeedback);
  const resetTracker = useTrackerStore(state => state.resetTracker);
  const exportTrackerData = useTrackerStore(state => state.exportTrackerData);
  const importTrackerData = useTrackerStore(state => state.importTrackerData);
  const triggerManualSync = useTrackerStore(state => state.triggerManualSync);
  const lastSynced = useTrackerStore(state => state.lastSynced);

  const authSession = useAuthStore(s => s.session);
  const syncStatus = useAuthStore(s => s.syncStatus);
  const publicSharing = useAuthStore(s => s.publicSharing);
  const setPublicSharing = useAuthStore(s => s.setPublicSharing);
  const setAuthModalOpen = useAuthStore(s => s.setAuthModalOpen);
  const signOut = useAuthStore(s => s.signOut);
  const setSyncStatus = useAuthStore(s => s.setSyncStatus);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateProfile = () => {
    if (!usernameInput.trim()) return;
    updateUserProfile({ username: usernameInput });
    showSuccess('Profile updated successfully');
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackEmail || !feedbackContent) return;
    addFeedback(feedbackName, feedbackEmail, feedbackContent);
    setFeedbackName('');
    setFeedbackEmail('');
    setFeedbackContent('');
    showSuccess('Feedback submitted successfully');
  };

  const handleExportJSON = () => {
    const dataStr = exportTrackerData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('JSON backup exported successfully');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = importTrackerData(result);
        if (success) {
          showSuccess('Data restored successfully from backup');
        } else {
          alert('Invalid backup file structure');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    const dates = getDatesRange();
    const sortedDates = [...dates].sort();
    let csvContent = 'Date,Completed Tasks,Total Tasks,Efficiency %,XP Earned,Notes\n';

    sortedDates.forEach(d => {
      const dTasks = logs[d] || [];
      const completed = dTasks.filter(t => t.completed).length;
      const total = dTasks.length;
      const efficiency = calculateDayEfficiency(dTasks);
      const dayXP = dTasks.reduce((sum, t) => sum + (t.completed ? t.xp : 0), 0);
      const notes = dTasks.map(t => t.notes).filter(Boolean).join(' | ').replace(/"/g, '""');
      csvContent += `"${d}",${completed},${total},${efficiency},${dayXP},"${notes}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync_productivity_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('CSV report exported successfully');
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const coding = calculateCodingHours(logs);
    const temple = calculateHabitConsistency(logs, 'temple');
    const football = calculateHabitConsistency(logs, 'football');
    const sleep = calculateHabitConsistency(logs, 'sleep');
    const revision = calculateHabitConsistency(logs, 'revision');

    doc.setFillColor(9, 9, 11);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('LIFESYNC PRODUCTIVITY REPORT', 20, 35);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
    doc.text('User: Ujjwal | Target Period: 10 July 2026 - 31 August 2026', 20, 47);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 52, 190, 52);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CORE PERFORMANCE METRICS', 20, 65);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`Level Status: Level ${level}`, 20, 75);
    doc.text(`Total XP Accumulated: ${xp} XP`, 20, 81);
    doc.text(`Current Active Streak: ${streakState.currentStreak} Days`, 20, 87);
    doc.text(`Longest Tracked Streak: ${streakState.longestStreak} Days`, 20, 93);

    doc.text(`Total Coding Hours: ${coding.total} Hours`, 110, 75);
    doc.text(`- Python practice: ${coding.python} Hours`, 110, 81);
    doc.text(`- Web development: ${coding.web} Hours`, 110, 87);
    doc.text(`- Project development: ${coding.project} Hours`, 110, 93);

    doc.line(20, 103, 190, 103);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HABIT CONSISTENCY RATES', 20, 115);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Temple Visits Rate: ${temple}%`, 20, 125);
    doc.text(`Football Sessions: ${football}%`, 20, 131);
    doc.text(`Sleep Hygiene Consistency: ${sleep}%`, 110, 125);
    doc.text(`Revision Blocks Completed: ${revision}%`, 110, 131);

    doc.line(20, 142, 190, 142);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CHRONOLOGICAL JOURNAL (COMPLETED DAYS)', 20, 155);

    let yOffset = 167;
    const dates = getDatesRange();
    let loggedCount = 0;

    dates.forEach(d => {
      const dTasks = logs[d] || [];
      const completed = dTasks.filter(t => t.completed).length;
      if (completed > 0 && loggedCount < 12) {
        const eff = calculateDayEfficiency(dTasks);
        const notes = dTasks.map(t => t.notes).filter(Boolean).join(', ');
        const notesTruncated = notes.length > 55 ? notes.substring(0, 52) + '...' : notes;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 220, 220);
        doc.text(`${formatDateLabel(d)}`, 20, yOffset);
        doc.text(`Efficiency: ${eff}% (${completed} Tasks Completed)`, 75, yOffset);
        
        if (notesTruncated) {
          doc.setTextColor(140, 140, 140);
          doc.text(`[Notes: ${notesTruncated}]`, 132, yOffset);
        }

        yOffset += 8;
        loggedCount++;
      }
    });

    if (loggedCount === 0) {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('No completed tasks recorded in current logs database.', 20, yOffset);
    }

    doc.save(`lifesync_comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showSuccess('PDF report downloaded successfully');
  };

  const handleExportPNG = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const element = document.getElementById('root') || document.body;
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: profile.theme === 'light' ? '#f9fafb' : '#09090b',
        scale: 2,
        logging: false,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lifesync_dashboard_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      showSuccess('PNG dashboard snapshot downloaded');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetConfirm = () => {
    resetTracker();
    setIsResetConfirmOpen(false);
    showSuccess('All database tracker logs reset successfully');
  };

  const handleDeleteAccount = () => {
    resetTracker();
    updateUserProfile({ username: 'Ujjwal', theme: 'dark', accentColor: '#3b82f6' });
    showSuccess('Account settings removed successfully');
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> User Profile Config
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">Customize public username and select custom identity avatar presets</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/5 pb-6">
          <img
            src={profile.avatarUrl}
            alt="User Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-lg"
          />

          <div className="flex-1 flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-white/40">Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500/40 font-semibold"
                />
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-white/40">Avatar Presets</label>
          <div className="flex gap-3">
            {AVATAR_PRESETS.map((av, idx) => (
              <button
                key={`avatar_${idx}`}
                onClick={() => updateUserProfile({ avatarUrl: av })}
                className={`w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                  profile.avatarUrl === av ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img src={av} alt="Preset Avatar" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" /> Cloud Sync & Authentication
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">Connect to Supabase for real-time cloud sync and public dashboard sharing</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
            <p className="text-xs text-yellow-400 font-semibold">Cloud sync is not configured</p>
            <p className="text-[10px] text-white/40 mt-1">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to enable cloud features.</p>
          </div>
        ) : !authSession ? (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
              <p className="text-xs text-blue-400 font-semibold">Not signed in</p>
              <p className="text-[10px] text-white/40 mt-1">Sign in to sync your data to the cloud and share your dashboard publicly.</p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In or Register
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
              <div>
                <p className="text-xs text-emerald-400 font-semibold">Signed in as {authSession.user.email}</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Status: <span className={syncStatus === 'synced' ? 'text-emerald-400' : syncStatus === 'syncing' ? 'text-blue-400' : 'text-yellow-400'}>{syncStatus}</span>
                  {lastSynced && <span className="ml-2">Last synced: {new Date(lastSynced).toLocaleTimeString()}</span>}
                </p>
              </div>
              <button
                onClick={async () => {
                  setSyncStatus('syncing');
                  try {
                    const state = useTrackerStore.getState();
                    const merged = await cloudService.fullSync(authSession.user.id, state, publicSharing);
                    useTrackerStore.setState(merged);
                    setSyncStatus('synced');
                    showSuccess('Cloud sync completed');
                  } catch {
                    setSyncStatus('error');
                  }
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /> Sync Now
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Public Dashboard Sharing</p>
                  <p className="text-[10px] text-white/40">Allow others to view your progress at ?u={profile.username}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const newVal = !publicSharing;
                  setPublicSharing(newVal);
                  if (authSession) {
                    await cloudService.pushProfile(authSession.user.id, profile, xp, level, newVal);
                  }
                  showSuccess(newVal ? 'Public sharing enabled' : 'Public sharing disabled');
                }}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  publicSharing ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    publicSharing ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={async () => {
                await signOut();
                showSuccess('Signed out successfully');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Display Preferences
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">Toggle animations, cycle theme interfaces, and set color accents</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/5 pb-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-white/40">SaaS Display Themes</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dark', label: 'Dark Mode', bg: 'bg-[#09090b]', text: 'text-white' },
                { id: 'light', label: 'Light Clean', bg: 'bg-gray-100', text: 'text-gray-900' },
                { id: 'cyberpunk', label: 'Neon Cyber', bg: 'bg-[#08090f]', text: 'text-[#00ffcc]' },
                { id: 'nord', label: 'Nord Ice', bg: 'bg-[#2e3440]', text: 'text-[#eceff4]' }
              ].map(th => (
                <button
                  key={th.id}
                  onClick={() => updateUserProfile({ theme: th.id as 'dark' | 'light' | 'cyberpunk' | 'nord' })}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    profile.theme === th.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-[11px] font-bold text-white">{th.label}</div>
                  <div className={`mt-1.5 h-2 rounded w-full ${th.bg} border border-white/10`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-semibold text-white/40">Custom Color Accents</label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_COLORS.map(ac => (
                <button
                  key={ac.name}
                  onClick={() => updateUserProfile({ accentColor: ac.value })}
                  className="w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-all border border-black/20 hover:scale-110"
                  style={{ backgroundColor: ac.value }}
                  title={ac.name}
                >
                  {profile.accentColor === ac.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-4 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Interface Animations</div>
                  <div className="text-[9px] text-white/40">Enable smooth Lenis and GSAP animations</div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.animationsEnabled}
                  onChange={e => updateUserProfile({ animationsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Sound Notifications</div>
                  <div className="text-[9px] text-white/40">Enable alert reminders audio on task starts</div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notificationsEnabled}
                  onChange={e => updateUserProfile({ notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" /> Cloud Sync & Backup Status
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">
            LifeSync operates offline locally. Synchronize manually or trigger backups here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/5 pb-6">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-white/40 uppercase font-semibold">Active Database</span>
              <h5 className="text-xs font-bold text-white mt-1">Status: Operational (Indexed Storage)</h5>
            </div>
            <span className="text-[9px] text-emerald-400 font-semibold mt-4">Offline Mode Enabled</span>
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-white/40 uppercase font-semibold">Last Backup Timestamp</span>
              <h5 className="text-xs font-bold text-white mt-1">
                {lastSynced ? new Date(lastSynced).toLocaleString() : 'N/A'}
              </h5>
            </div>
            <button
              onClick={() => {
                triggerManualSync();
                showSuccess('Manual sync backup generated');
              }}
              className="mt-4 flex items-center gap-1.5 text-[10px] text-blue-400 font-bold self-start hover:text-blue-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Force Sync Backup
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Export Dashboard Ledger</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-purple-400" />
              Export JSON
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Download PDF
            </button>

            <button
              onClick={handleExportPNG}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-pink-400" />
              Capture PNG
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
          <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Restore & Recover Database</span>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Restore JSON Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <span className="text-[10px] text-white/30 text-center sm:text-left leading-relaxed">
              Restoring a JSON backup file will completely overwrite all local schedule logs.
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" /> Submit Developer Feedback
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">Send feature requests, comments, or report issues directly to console developers</p>
        </div>

        <form onSubmit={handleSendFeedback} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-white/40">Your Name</label>
              <input
                type="text"
                required
                value={feedbackName}
                onChange={e => setFeedbackName(e.target.value)}
                placeholder="Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-white/40">Your Email Address</label>
              <input
                type="email"
                required
                value={feedbackEmail}
                onChange={e => setFeedbackEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-white/40">Feedback Messages</label>
            <textarea
              required
              rows={4}
              value={feedbackContent}
              onChange={e => setFeedbackContent(e.target.value)}
              placeholder="What features or suggestions do you have for LifeSync V2?"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500/40 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg self-end"
          >
            Submit Feedback
          </button>
        </form>
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone Settings
          </h3>
          <p className="text-white/40 text-[10px] mt-0.5">Highly critical actions. Handle data deletions with extreme caution.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-bold text-white">Reset Tracker Progress Logs</h5>
              <p className="text-white/40 text-[10px] mt-0.5">
                Wipe all completed checklist days, XP milestones, and streaks. Keeps templates.
              </p>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Reset Tracker Data
            </button>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-bold text-white">Delete Profile Account Settings</h5>
              <p className="text-white/40 text-[10px] mt-0.5">
                Remove username, custom display settings, themes, and reset to default profiles.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-1.5 bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-400 text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete Account Data
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden bg-[#111827] border border-red-500/20 rounded-[24px] p-6 shadow-2xl z-10 text-white"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Wipe Database Logs?</h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    This will delete all completed sessions, streaks, custom progress milestones, and notes. Make sure to download a backup.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/15 cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-emerald-600 border border-emerald-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-2xl z-50 text-xs font-semibold"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
