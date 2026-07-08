import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts = [
    { keys: ['Space'], action: 'Toggle highlighted task' },
    { keys: ['↑', '↓'], action: 'Navigate tasks in daily timetable' },
    { keys: ['←', '→'], action: 'Navigate between days' },
    { keys: ['?'], action: 'Show/hide this shortcuts panel' },
    { keys: ['Ctrl', 'E'], action: 'Export backup data as JSON' },
    { keys: ['Ctrl', 'I'], action: 'Import backup data from JSON' },
    { keys: ['Ctrl', 'R'], action: 'Reset all tracker data' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden bg-[#111827] border border-white/10 rounded-[24px] p-6 shadow-2xl z-10 text-white"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {shortcuts.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/70 text-sm">{shortcut.action}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <span
                        key={keyIdx}
                        className="px-2 py-1 text-xs font-mono font-bold bg-white/10 border border-white/15 rounded-md shadow-inner text-blue-300"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
