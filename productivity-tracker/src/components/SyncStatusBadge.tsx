import { useAuthStore } from '../store/useAuthStore';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { Cloud, CloudOff, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SyncStatusBadge() {
  const session = useAuthStore(s => s.session);
  const syncStatus = useAuthStore(s => s.syncStatus);
  const setAuthModalOpen = useAuthStore(s => s.setAuthModalOpen);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <CloudOff className="w-3 h-3 text-yellow-500" />
        <span className="text-[10px] text-yellow-500 font-semibold">Local Only</span>
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => setAuthModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors cursor-pointer"
      >
        <LogIn className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] text-blue-400 font-semibold">Sign In</span>
      </button>
    );
  }

  const statusConfig = {
    synced: { icon: Cloud, color: 'emerald', label: 'Synced' },
    syncing: { icon: Loader2, color: 'blue', label: 'Syncing...' },
    offline: { icon: CloudOff, color: 'yellow', label: 'Offline' },
    error: { icon: AlertCircle, color: 'red', label: 'Sync Error' }
  };

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-${config.color}-500/10 border border-${config.color}-500/20 rounded-xl`}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.color === 'emerald' ? '#10b981' : config.color === 'blue' ? '#3b82f6' : config.color === 'yellow' ? '#eab308' : '#ef4444'} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${config.color === 'emerald' ? '#10b981' : config.color === 'blue' ? '#3b82f6' : config.color === 'yellow' ? '#eab308' : '#ef4444'} 20%, transparent)`
      }}
    >
      <Icon
        className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
        style={{
          color: config.color === 'emerald' ? '#10b981' : config.color === 'blue' ? '#3b82f6' : config.color === 'yellow' ? '#eab308' : '#ef4444'
        }}
      />
      <span
        className="text-[10px] font-semibold"
        style={{
          color: config.color === 'emerald' ? '#10b981' : config.color === 'blue' ? '#3b82f6' : config.color === 'yellow' ? '#eab308' : '#ef4444'
        }}
      >
        {config.label}
      </span>
    </motion.div>
  );
}
