import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { getDatesRange, formatDateShort } from '../utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, LayoutDashboard, BarChart3, Trophy, Settings, Terminal, Sparkles, FolderLock, Download, X } from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Templates' | 'Actions' | 'Search Results';
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenAdminLogin: () => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, onOpenAdminLogin }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const logs = useTrackerStore(state => state.logs);
  const templates = useTrackerStore(state => state.templates);
  const applyTemplateToDate = useTrackerStore(state => state.applyTemplateToDate);
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const triggerManualSync = useTrackerStore(state => state.triggerManualSync);
  const profile = useTrackerStore(state => state.profile);
  const updateUserProfile = useTrackerStore(state => state.updateUserProfile);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const defaultCommands = useMemo<CommandItem[]>(() => [
    { id: 'nav_timetable', category: 'Navigation', label: 'Go to Timetable Tracker', sublabel: 'View and log your daily schedule', icon: <Calendar className="w-4 h-4" />, shortcut: '⌥ 1', action: () => { onNavigate('timetable'); onClose(); } },
    { id: 'nav_dashboard', category: 'Navigation', label: 'Go to Performance Dashboard', sublabel: 'Check streaks, levels and goals progress', icon: <LayoutDashboard className="w-4 h-4" />, shortcut: '⌥ 2', action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'nav_analytics', category: 'Navigation', label: 'Go to Analytics Center', sublabel: 'Curated charts and workload breakdown', icon: <BarChart3 className="w-4 h-4" />, shortcut: '⌥ 3', action: () => { onNavigate('analytics'); onClose(); } },
    { id: 'nav_reviews', category: 'Navigation', label: 'Go to Periodic Reviews', sublabel: 'Weekly consistency grades & diagnostic insights', icon: <Terminal className="w-4 h-4" />, shortcut: '⌥ 4', action: () => { onNavigate('reviews'); onClose(); } },
    { id: 'nav_achievements', category: 'Navigation', label: 'Go to Achievements Badges', sublabel: 'View unlocked consistency rewards', icon: <Trophy className="w-4 h-4" />, shortcut: '⌥ 5', action: () => { onNavigate('achievements'); onClose(); } },
    { id: 'nav_settings', category: 'Navigation', label: 'Go to Settings Panel', sublabel: 'Manage custom profile and local backups', icon: <Settings className="w-4 h-4" />, shortcut: '⌥ 6', action: () => { onNavigate('settings'); onClose(); } },
    { id: 'nav_admin', category: 'Navigation', label: 'Open Hidden Admin Dashboard', sublabel: 'Manage users, view logs and database state', icon: <FolderLock className="w-4 h-4" />, shortcut: '⌥ A', action: () => { onOpenAdminLogin(); onClose(); } },
    
    ...templates.map(t => ({
      id: `tpl_${t.id}`,
      category: 'Templates' as const,
      label: `Apply "${t.name}" Template`,
      sublabel: `Replace selected date (${formatDateShort(selectedDate)}) with template tasks`,
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => {
        applyTemplateToDate(selectedDate, t.id);
        onClose();
      }
    })),

    { id: 'action_theme', category: 'Actions', label: 'Toggle Dark / Cyberpunk Theme', sublabel: 'Cycle between system display visual presets', icon: <Sparkles className="w-4 h-4" />, shortcut: '⌥ T', action: () => { updateUserProfile({ theme: profile.theme === 'dark' ? 'cyberpunk' : profile.theme === 'cyberpunk' ? 'nord' : profile.theme === 'nord' ? 'light' : 'dark' }); onClose(); } },
    { id: 'action_backup', category: 'Actions', label: 'Trigger Sync & Local Backup', sublabel: 'Serializes state in database repository', icon: <Download className="w-4 h-4" />, shortcut: '⌥ B', action: () => { triggerManualSync(); onClose(); } }
  ], [templates, selectedDate, profile.theme, onNavigate, onClose, applyTemplateToDate, triggerManualSync, updateUserProfile, onOpenAdminLogin]);

  const searchResults = useMemo(() => {
    if (!query) return [];
    
    const results: CommandItem[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(logs).forEach(([dateStr, tasks]) => {
      tasks.forEach(t => {
        if (t.label.toLowerCase().includes(lowerQuery) || t.notes.toLowerCase().includes(lowerQuery) || t.category.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: `task_res_${t.id}_${dateStr}`,
            category: 'Search Results',
            label: `${t.label} (${formatDateShort(dateStr)})`,
            sublabel: t.notes ? `Notes: ${t.notes}` : `Category: ${t.category} | ${t.time}`,
            icon: <Search className="w-4 h-4 text-blue-400" />,
            action: () => {
              useTrackerStore.setState({ selectedDate: dateStr });
              onNavigate('timetable');
              onClose();
            }
          });
        }
      });
    });

    const dates = getDatesRange();
    dates.forEach(d => {
      if (formatDateShort(d).toLowerCase().includes(lowerQuery) || d.includes(lowerQuery)) {
        results.push({
          id: `date_res_${d}`,
          category: 'Search Results',
          label: `Jump to Date: ${formatDateShort(d)}`,
          sublabel: `Go to logs for ${d}`,
          icon: <Calendar className="w-4 h-4 text-emerald-400" />,
          action: () => {
            useTrackerStore.setState({ selectedDate: d });
            onNavigate('timetable');
            onClose();
          }
        });
      }
    });

    return results.slice(0, 10);
  }, [query, logs, onNavigate, onClose]);

  const items = useMemo(() => {
    if (query) {
      const filteredDefaults = defaultCommands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      );
      return [...searchResults, ...filteredDefaults];
    }
    return defaultCommands;
  }, [query, defaultCommands, searchResults]);

  const scrollHighlightedIntoView = useCallback(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const highlightedElement = listElement.children[selectedIndex] as HTMLElement;
    if (!highlightedElement) return;

    const listHeight = listElement.clientHeight;
    const scrollOffset = listElement.scrollTop;
    const elementTop = highlightedElement.offsetTop;
    const elementHeight = highlightedElement.clientHeight;

    if (elementTop < scrollOffset) {
      listElement.scrollTop = elementTop;
    } else if (elementTop + elementHeight > scrollOffset + listHeight) {
      listElement.scrollTop = elementTop + elementHeight - listHeight;
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
        scrollHighlightedIntoView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
        scrollHighlightedIntoView();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose, scrollHighlightedIntoView]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="w-5 h-5 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search actions, tasks, templates, dates..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-white/30"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/40 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-[380px] overflow-y-auto p-2 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {items.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                No matching results found
              </div>
            ) : (
              items.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition-all duration-150 cursor-pointer outline-none ${
                      isSelected
                        ? 'bg-blue-500/10 border border-blue-500/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'border border-transparent text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/5'}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold">{item.label}</div>
                        {item.sublabel && (
                          <div className="text-[10px] text-white/40 mt-0.5 truncate">{item.sublabel}</div>
                        )}
                      </div>
                    </div>
                    {item.shortcut && (
                      <kbd className="text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/50 font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] text-white/40 font-medium bg-[#111827]/60">
            <div className="flex items-center gap-4">
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded border border-white/5 mr-1">↑↓</kbd> Navigate</span>
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded border border-white/5 mr-1">Enter</kbd> Select</span>
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded border border-white/5 mr-1">Esc</kbd> Close</span>
            </div>
            <span>Global Shortcuts Enabled</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
