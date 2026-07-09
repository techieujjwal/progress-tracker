import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { useTrackerStore } from './store/useTrackerStore';
import { useAuthStore } from './store/useAuthStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { cloudService } from './services/cloudSync';
import BlobBackground from './components/BlobBackground';
import LoadingSkeleton from './components/LoadingSkeleton';
import Hero from './components/Hero';
import TimetableSection from './components/TimetableSection';
import TimetableBuilder from './components/TimetableBuilder';
import DashboardStats from './components/DashboardStats';
const AnalyticsSection = lazy(() => import('./components/AnalyticsSection'));
import ReviewSection from './components/ReviewSection';
import AchievementsSection from './components/AchievementsSection';
import SettingsSection from './components/SettingsSection';
import AdminPanel from './components/AdminPanel';
import HelpModal from './components/HelpModal';
import CommandPalette from './components/CommandPalette';
import AuthOverlay from './components/AuthOverlay';
import SyncStatusBadge from './components/SyncStatusBadge';
import PublicDashboard from './components/PublicDashboard';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Trophy,
  Settings as SettingsIcon,
  HelpCircle,
  AlertTriangle,
  Check,
  Search,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('timetable');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const selectedDate = useTrackerStore(state => state.selectedDate);
  const resetTracker = useTrackerStore(state => state.resetTracker);
  const exportTrackerData = useTrackerStore(state => state.exportTrackerData);
  const importTrackerData = useTrackerStore(state => state.importTrackerData);
  const updateGoalsProgress = useTrackerStore(state => state.updateGoalsProgress);
  const profile = useTrackerStore(state => state.profile);
  const level = useTrackerStore(state => state.level);

  const authSession = useAuthStore(s => s.session);
  const initializeAuth = useAuthStore(s => s.initializeAuth);
  const isPublicViewMode = useAuthStore(s => s.isPublicViewMode);
  const loadPublicProfile = useAuthStore(s => s.loadPublicProfile);
  const setSyncStatus = useAuthStore(s => s.setSyncStatus);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const init = async () => {
      await initializeAuth();

      const params = new URLSearchParams(window.location.search);
      const publicUser = params.get('u');
      if (publicUser) {
        await loadPublicProfile(publicUser);
      }

      if (authSession) {
        try {
          setSyncStatus('syncing');
          const state = useTrackerStore.getState();
          const publicSharing = useAuthStore.getState().publicSharing;
          const merged = await cloudService.fullSync(authSession.user.id, state, publicSharing);
          useTrackerStore.setState(merged);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }

      setTimeout(() => setIsLoading(false), 800);
    };
    init();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  useEffect(() => {
    if (isLoading) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

  useEffect(() => {
    let anim: gsap.core.Tween | null = null;
    if (!isLoading && mainContainerRef.current) {
      anim = gsap.fromTo(
        mainContainerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
    return () => {
      if (anim) anim.kill();
    };
  }, [isLoading]);

  useEffect(() => {
    updateGoalsProgress();
  }, [selectedDate, updateGoalsProgress]);

  const handleExport = () => {
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
    showToast('JSON backup exported');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = importTrackerData(result);
        if (success) {
          showToast('Data restored successfully');
        } else {
          alert('Invalid backup structure');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useKeyboardShortcuts({
    onExport: handleExport,
    onImportClick: () => importInputRef.current?.click(),
    onResetClick: () => setIsResetOpen(true),
    onHelpClick: () => setIsHelpOpen(prev => !prev),
    onCmdKClick: () => setIsCmdKOpen(prev => !prev)
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isPublicViewMode) {
    return <PublicDashboard />;
  }

  return (
    <div className="min-h-screen text-white relative flex flex-col font-sans select-none pb-12">
      <BlobBackground />

      <input
        type="file"
        ref={importInputRef}
        accept=".json"
        onChange={handleImportFileChange}
        className="hidden"
      />

      <header className="sticky top-0 z-40 bg-[#09090b]/80 border-b border-white/5 backdrop-blur-md">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              L
            </div>
            <span className="text-sm font-black tracking-wider bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              LIFESYNC <span className="text-[10px] text-blue-400 font-bold ml-1 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">V2</span>
            </span>
          </div>

          <button
            onClick={() => setIsCmdKOpen(true)}
            className="hidden md:flex items-center justify-between gap-12 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/40 hover:text-white/60 transition-all cursor-pointer w-64"
          >
            <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5" /> Search features...</span>
            <kbd className="text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>

          <div className="flex items-center gap-3.5">
            <SyncStatusBadge />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{profile.username}</div>
              <div className="text-[9px] text-purple-400 font-bold flex items-center gap-0.5 justify-end">
                <Sparkles className="w-2.5 h-2.5" /> Level {level}
              </div>
            </div>
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          </div>
        </div>
      </header>

      <div ref={mainContainerRef} className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <Hero />

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#111827]/40 border border-white/5 p-3 rounded-[24px] backdrop-blur-xl">
            <Tabs.List className="flex flex-wrap gap-1">
              {[
                { value: 'timetable', label: 'Timetable', icon: Calendar },
                { value: 'builder', label: 'Builder', icon: Sparkles },
                { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { value: 'analytics', label: 'Analytics', icon: BarChart3 },
                { value: 'reviews', label: 'Reviews', icon: BookOpen },
                { value: 'achievements', label: 'Achievements', icon: Trophy },
                { value: 'settings', label: 'Settings', icon: SettingsIcon },
                { value: 'admin', label: 'Admin Panel', icon: ShieldAlert }
              ].map(tab => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/50 hover:text-white cursor-pointer"
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Shortcuts Help (?)</span>
            </button>
          </div>

          <div className="flex-1">
            <Tabs.Content value="timetable" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <TimetableSection />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="builder" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <TimetableBuilder />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="dashboard" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <DashboardStats />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="analytics" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<LoadingSkeleton />}>
                  <AnalyticsSection />
                </Suspense>
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="reviews" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ReviewSection />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="achievements" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AchievementsSection />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="settings" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <SettingsSection />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="admin" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AdminPanel />
              </motion.div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <AuthOverlay />

      <CommandPalette
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        onNavigate={setActiveTab}
        onOpenAdminLogin={() => {
          setActiveTab('admin');
        }}
      />

      <AnimatePresence>
        {isResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                  onClick={() => setIsResetOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetTracker();
                    setIsResetOpen(false);
                    showToast('Tracker data wiped');
                  }}
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
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-emerald-600 border border-emerald-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-2xl z-50 text-xs font-semibold"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
