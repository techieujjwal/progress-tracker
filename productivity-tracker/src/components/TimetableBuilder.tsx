import { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import type { TimetableTemplate, TaskTemplate } from '../types';
import { Reorder, motion } from 'framer-motion';
import { Plus, Trash2, Copy, Sparkles, Terminal, Activity, Coffee, Heart, Moon, Compass, Utensils, Smartphone, Check, HelpCircle, Save, Download, Upload, AlertCircle, Clock } from 'lucide-react';

const PRESET_ICONS = [
  { name: 'Sparkles', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
  { name: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { name: 'Heart', icon: <Heart className="w-4 h-4" /> },
  { name: 'Moon', icon: <Moon className="w-4 h-4" /> },
  { name: 'Compass', icon: <Compass className="w-4 h-4" /> },
  { name: 'Utensils', icon: <Utensils className="w-4 h-4" /> },
  { name: 'Smartphone', icon: <Smartphone className="w-4 h-4" /> }
];

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#ef4444', // red
  '#6b7280'  // gray
];

const CATEGORIES = ['wake', 'coding', 'exercise', 'temple', 'revision', 'sleep', 'rest'];

export default function TimetableBuilder() {
  const templates = useTrackerStore(state => state.templates);
  const activeTemplateId = useTrackerStore(state => state.activeTemplateId);
  const createTemplate = useTrackerStore(state => state.createTemplate);
  const updateTemplate = useTrackerStore(state => state.updateTemplate);
  const deleteTemplate = useTrackerStore(state => state.deleteTemplate);
  const duplicateTemplate = useTrackerStore(state => state.duplicateTemplate);
  const applyTemplateToDate = useTrackerStore(state => state.applyTemplateToDate);
  const selectedDate = useTrackerStore(state => state.selectedDate);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(activeTemplateId || 'default');
  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const [templateName, setTemplateName] = useState<string>(currentTemplate ? currentTemplate.name : '');
  const [tasks, setTasks] = useState<TaskTemplate[]>(currentTemplate ? currentTemplate.tasks.map(t => ({ ...t })) : []);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find(temp => temp.id === id);
    if (t) {
      setTemplateName(t.name);
      setTasks(t.tasks.map(tsk => ({ ...tsk })));
      setEditingTaskId(null);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  const handleCreateNewTemplate = () => {
    const newId = `template_${Date.now()}`;
    const newTemplate: TimetableTemplate = {
      id: newId,
      name: 'Untitled Template',
      tasks: [
        { id: `task_${Date.now()}`, time: '08:00', label: 'New Task', category: 'rest', color: '#3b82f6', icon: 'Sparkles', xp: 5, duration: 60, reminder: false }
      ]
    };
    createTemplate(newTemplate);
    setSelectedTemplateId(newId);
    setTemplateName(newTemplate.name);
    setTasks([...newTemplate.tasks]);
    setEditingTaskId(null);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setErrorMessage('Template name cannot be empty');
      return;
    }
    updateTemplate(selectedTemplateId, { name: templateName, tasks });
    setErrorMessage('');
    setSuccessMessage('Template saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDuplicateTemplate = () => {
    duplicateTemplate(selectedTemplateId);
    setSuccessMessage('Template duplicated');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteTemplate = () => {
    if (templates.length <= 1) {
      setErrorMessage('Cannot delete the last remaining template');
      return;
    }
    deleteTemplate(selectedTemplateId);
    const remaining = templates.filter(t => t.id !== selectedTemplateId);
    if (remaining.length > 0) {
      handleSelectTemplate(remaining[0].id);
    }
  };

  const handleSetDefault = () => {
    useTrackerStore.setState({ activeTemplateId: selectedTemplateId });
    setSuccessMessage('Default template updated');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleApplyToDate = () => {
    applyTemplateToDate(selectedDate, selectedTemplateId);
    setSuccessMessage(`Applied template to ${selectedDate}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddTask = () => {
    const newTask: TaskTemplate = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: '09:00',
      label: 'New Study/Work block',
      category: 'coding',
      color: '#3b82f6',
      icon: 'Terminal',
      xp: 10,
      duration: 60,
      reminder: false
    };
    setTasks([...tasks, newTask]);
    setEditingTaskId(newTask.id);
  };

  const handleDuplicateTask = (id: string) => {
    const original = tasks.find(t => t.id === id);
    if (original) {
      const dup: TaskTemplate = {
        ...original,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: `${original.label} (Copy)`
      };
      const idx = tasks.findIndex(t => t.id === id);
      const newTasks = [...tasks];
      newTasks.splice(idx + 1, 0, dup);
      setTasks(newTasks);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (tasks.length <= 1) {
      setErrorMessage('Template must contain at least one task');
      return;
    }
    setTasks(tasks.filter(t => t.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
  };

  const handleUpdateTaskField = (id: string, updates: Partial<TaskTemplate>) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && parsed.name && Array.isArray(parsed.tasks)) {
          const newId = `template_${Date.now()}`;
          const newTemplate: TimetableTemplate = {
            id: newId,
            name: parsed.name,
            tasks: (parsed.tasks as { id?: string; time?: string; label?: string; category?: string; color?: string; icon?: string; xp?: number; duration?: number; reminder?: boolean }[]).map(t => ({
              id: t.id || `task_${Date.now()}`,
              time: t.time || '08:00',
              label: t.label || 'Task',
              category: t.category || 'rest',
              color: t.color || '#3b82f6',
              icon: t.icon || 'Sparkles',
              xp: typeof t.xp === 'number' ? t.xp : 10,
              duration: typeof t.duration === 'number' ? t.duration : 60,
              reminder: !!t.reminder
            }))
          };
          createTemplate(newTemplate);
          handleSelectTemplate(newId);
          setSuccessMessage('Template imported successfully');
        } else {
          setErrorMessage('Invalid template structure');
        }
      } catch {
        setErrorMessage('Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTemplate));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentTemplate.name.toLowerCase().replace(/\s+/g, '_')}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalXP = tasks.reduce((sum, t) => sum + t.xp, 0);
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-[#111827]/40 border border-white/5 p-5 rounded-[24px] backdrop-blur-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-semibold text-white">Your Templates</h3>
          <button
            onClick={handleCreateNewTemplate}
            className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {templates.map(t => {
            const isSelected = t.id === selectedTemplateId;
            const isDefault = t.id === activeTemplateId;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/20 text-white shadow-[0_0_12px_rgba(59,130,246,0.08)]'
                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${isDefault ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  <span className="text-xs font-semibold truncate">{t.name}</span>
                </div>
                {isDefault && (
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-white/5 pt-4 mt-auto flex flex-col gap-3">
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/80 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import JSON Template</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex-1">
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template Name"
                className="bg-transparent border-none outline-none text-lg font-bold text-white w-full placeholder-white/30 border-b border-transparent focus:border-white/10 pb-1"
              />
              <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1.5">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" /> {totalDuration} Min Total</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> {totalXP} XP Pool</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleApplyToDate}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
              >
                Apply to Day
              </button>
              <button
                onClick={handleSetDefault}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
              >
                Set Default
              </button>
              <button
                onClick={handleDuplicateTemplate}
                className="p-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 cursor-pointer transition-all"
                title="Duplicate Template"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 cursor-pointer transition-all"
                title="Export Template JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all"
                title="Delete Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-500/10"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-white/40 border-b border-white/5 pb-2 font-semibold">
              <span>Task Order & Config</span>
              <button onClick={handleAddTask} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-colors">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="flex flex-col gap-2.5">
              {tasks.map(task => {
                const isEditing = editingTaskId === task.id;
                const taskIconObj = PRESET_ICONS.find(pi => pi.name === task.icon);
                
                return (
                  <Reorder.Item
                    key={task.id}
                    value={task}
                    className={`bg-white/5 border border-white/5 rounded-2xl transition-all duration-200 overflow-hidden ${
                      isEditing ? 'border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)] bg-[#111827]/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between p-4 gap-4">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div
                          className="w-1.5 h-8 rounded-full shrink-0 cursor-grab active:cursor-grabbing"
                          style={{ backgroundColor: task.color }}
                          title="Drag to reorder"
                        />

                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                          style={{ backgroundColor: `${task.color}20`, border: `1px solid ${task.color}30`, color: task.color }}
                        >
                          {taskIconObj ? taskIconObj.icon : <HelpCircle className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={task.label}
                            onChange={e => handleUpdateTaskField(task.id, { label: e.target.value })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder-white/30"
                          />
                          <div className="flex items-center gap-2.5 text-[9px] text-white/40 mt-1">
                            <span className="bg-white/5 border border-white/10 rounded px-1">{task.time}</span>
                            <span>•</span>
                            <span>{task.duration} Min</span>
                            <span>•</span>
                            <span>{task.category}</span>
                            <span>•</span>
                            <span className="text-purple-400 font-semibold">+{task.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingTaskId(isEditing ? null : task.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] text-white/70 hover:text-white font-semibold cursor-pointer transition-colors"
                        >
                          {isEditing ? 'Close' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDuplicateTask(task.id)}
                          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white cursor-pointer transition-colors"
                          title="Duplicate Task"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400/70 hover:text-rose-400 cursor-pointer transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 p-4 bg-[#111827]/40 flex flex-col gap-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-white/40">Start Time</label>
                            <input
                              type="time"
                              value={task.time}
                              onChange={e => handleUpdateTaskField(task.id, { time: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500/40"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-white/40">Category</label>
                            <select
                              value={task.category}
                              onChange={e => handleUpdateTaskField(task.id, { category: e.target.value })}
                              className="w-full bg-[#111827] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500/40"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-white/40">Duration (Minutes)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="5"
                                max="480"
                                step="5"
                                value={task.duration}
                                onChange={e => handleUpdateTaskField(task.id, { duration: parseInt(e.target.value) })}
                                className="flex-1 accent-blue-500"
                              />
                              <span className="text-xs font-mono text-white/80 min-w-[45px] text-right">{task.duration}m</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-semibold text-white/40">Color Customization</label>
                            <div className="flex flex-wrap gap-2">
                              {PRESET_COLORS.map(c => (
                                <button
                                  key={c}
                                  onClick={() => handleUpdateTaskField(task.id, { color: c })}
                                  className="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all border border-black/20 hover:scale-110"
                                  style={{ backgroundColor: c }}
                                >
                                  {task.color === c && <Check className="w-3.5 h-3.5 text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-semibold text-white/40">Icon Picker</label>
                            <div className="flex flex-wrap gap-2">
                              {PRESET_ICONS.map(pi => (
                                <button
                                  key={pi.name}
                                  onClick={() => handleUpdateTaskField(task.id, { icon: pi.name })}
                                  className={`p-2 rounded-lg cursor-pointer transition-all border ${
                                    task.icon === pi.name
                                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                      : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'
                                  }`}
                                  title={pi.name}
                                >
                                  {pi.icon}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-white/40">Reward Points (XP Pool)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={task.xp}
                                onChange={e => handleUpdateTaskField(task.id, { xp: parseInt(e.target.value) })}
                                className="flex-1 accent-purple-500"
                              />
                              <span className="text-xs font-mono text-purple-400 min-w-[45px] text-right font-bold">+{task.xp} XP</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3.5 mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-white">Push Reminder Alert</span>
                              <span className="text-[9px] text-white/40 mt-0.5">Toggle notification trigger for task start</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!task.reminder}
                              onChange={e => handleUpdateTaskField(task.id, { reminder: e.target.checked })}
                              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        </div>

        <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl">
          <h4 className="text-xs font-semibold text-white border-b border-white/5 pb-2 mb-4">Template Timeline Preview</h4>
          <div className="relative flex items-center justify-start h-20 bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-2.5">
            {tasks.map((t, idx) => {
              const flexShare = Math.max(15, t.duration);
              return (
                <div
                  key={`preview_${t.id}_${idx}`}
                  style={{ flex: flexShare, backgroundColor: `${t.color}20`, borderLeft: `2.5px solid ${t.color}` }}
                  className="h-full flex flex-col justify-center px-2.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-[40px] transition-all hover:flex-[2_2_0%]"
                  title={`${t.label} (${t.duration}m | ${t.time})`}
                >
                  <span className="text-[9px] font-bold text-white/90 truncate">{t.label}</span>
                  <span className="text-[8px] text-white/40 font-mono mt-0.5 truncate">{t.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
