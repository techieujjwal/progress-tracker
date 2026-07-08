import { useEffect } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { getPreviousDay, getNextDay } from '../utils/dateHelpers';

interface ShortcutOptions {
  onExport: () => void;
  onImportClick: () => void;
  onResetClick: () => void;
  onHelpClick: () => void;
  onCmdKClick: () => void;
}

export function useKeyboardShortcuts({ onExport, onImportClick, onResetClick, onHelpClick, onCmdKClick }: ShortcutOptions) {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const setSelectedDate = useTrackerStore(state => state.setSelectedDate);
  const activeTaskId = useTrackerStore(state => state.activeTaskId);
  const setActiveTaskId = useTrackerStore(state => state.setActiveTaskId);
  const toggleTask = useTrackerStore(state => state.toggleTask);
  const logs = useTrackerStore(state => state.logs);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onCmdKClick();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onExport();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        onImportClick();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onResetClick();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        onHelpClick();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = getPreviousDay(selectedDate);
        if (prev) {
          setSelectedDate(prev);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = getNextDay(selectedDate);
        if (next) {
          setSelectedDate(next);
        }
        return;
      }

      const tasks = logs[selectedDate] || [];

      if (tasks.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!activeTaskId) {
          setActiveTaskId(tasks[tasks.length - 1].id);
        } else {
          const idx = tasks.findIndex(t => t.id === activeTaskId);
          if (idx !== -1) {
            const prevIdx = (idx - 1 + tasks.length) % tasks.length;
            setActiveTaskId(tasks[prevIdx].id);
          } else {
            setActiveTaskId(tasks[tasks.length - 1].id);
          }
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!activeTaskId) {
          setActiveTaskId(tasks[0].id);
        } else {
          const idx = tasks.findIndex(t => t.id === activeTaskId);
          if (idx !== -1) {
            const nextIdx = (idx + 1) % tasks.length;
            setActiveTaskId(tasks[nextIdx].id);
          } else {
            setActiveTaskId(tasks[0].id);
          }
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (activeTaskId) {
          toggleTask(selectedDate, activeTaskId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, activeTaskId, logs, setSelectedDate, setActiveTaskId, toggleTask, onExport, onImportClick, onResetClick, onHelpClick, onCmdKClick]);
}
