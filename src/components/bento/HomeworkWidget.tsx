import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSectionVStore } from '../../lib/store.ts';
import tasksDataRaw from '../../data/tasks.json';

interface HomeworkWidgetProps {
  onNavigateToTodo?: () => void;
}

interface RawOfficialTask {
  id: string;
  title: string;
  subjectCode: string;
  section: 'All' | 'V1' | 'V2';
  dueDate: string;
  priority: 'urgent' | 'medium' | 'low';
  assignedBy: string;
  description: string;
}

export const HomeworkWidget: React.FC<HomeworkWidgetProps> = ({ onNavigateToTodo }) => {
  const { tasks: localTasks, addTask, toggleTask, deleteTask, userSection } = useSectionVStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'urgent' | 'medium' | 'low'>('medium');

  // Track completed official tasks in local storage
  const [completedOfficialIds, setCompletedOfficialIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('section-v-completed-official-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleOfficialTask = (id: string) => {
    setCompletedOfficialIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('section-v-completed-official-tasks', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save completed tasks', err);
      }
      return next;
    });
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    if (showAddModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  // Merge official and custom tasks
  const allTasks = useMemo(() => {
    const official = (tasksDataRaw as RawOfficialTask[])
      .filter((t) => t.section === 'All' || t.section === userSection)
      .map((t) => ({
        id: t.id,
        title: t.title,
        subjectCode: t.subjectCode,
        dueDate: t.dueDate,
        priority: t.priority,
        completed: completedOfficialIds.includes(t.id),
        isOfficial: true
      }));

    const custom = localTasks.map((t) => ({
      id: t.id,
      title: t.title,
      subjectCode: t.subjectCode || 'General',
      dueDate: t.dueDate,
      priority: t.priority,
      completed: t.completed,
      isOfficial: false
    }));

    // Prioritize pending tasks, then sort by deadline
    return [...official, ...custom].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    });
  }, [localTasks, completedOfficialIds, userSection]);

  const pendingCount = allTasks.filter((t) => !t.completed).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      subjectCode: newSubject,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      priority: newPriority,
      notes: ''
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-500 font-medium">Overdue ({Math.abs(diffDays)}d)</span>;
    if (diffDays === 0) return <span className="text-red-500 font-medium">Due Today</span>;
    if (diffDays === 1) return <span className="text-amber-500 font-medium">Due Tomorrow</span>;
    return <span>Due: {dateStr}</span>;
  };

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-muted" />
            <h3 className="text-[13px] font-medium text-secondary uppercase tracking-wide">
              Tasks
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToTodo ? (
              <button
                onClick={onNavigateToTodo}
                className="text-[12px] font-mono text-secondary hover:text-foreground transition-colors cursor-pointer select-none"
                title="Open Todo Page"
              >
                {pendingCount} Pending →
              </button>
            ) : (
              <span className="text-[12px] font-mono text-secondary">
                {pendingCount} Pending
              </span>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 rounded-md text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task List - clean list with subtle dividers */}
        <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {allTasks.length === 0 ? (
            <div className="py-8 text-center text-secondary space-y-1">
              <p className="text-foreground font-medium text-[15px]">No pending tasks</p>
              <p className="text-muted text-[13px]">All caught up. Hit + to track a new task.</p>
            </div>
          ) : (
            allTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-3 py-2.5 px-2 rounded-md border-b border-divider-subtle last:border-b-0 hover:bg-surface-hover/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      if (task.isOfficial) {
                        toggleOfficialTask(task.id);
                      } else {
                        toggleTask(task.id);
                      }
                    }}
                    className="text-muted hover:text-foreground shrink-0 cursor-pointer"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!task.completed && task.priority === 'urgent' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Urgent
                        </span>
                      )}
                      {!task.completed && task.priority === 'medium' && (
                        <span className="inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                          Medium
                        </span>
                      )}
                      <p className={`text-[14px] leading-snug truncate ${task.completed ? 'line-through text-muted' : 'text-foreground font-medium'}`}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-muted font-mono">
                      {task.subjectCode && task.subjectCode !== 'General' && (
                        <>
                          <span className="text-secondary font-medium">{task.subjectCode}</span>
                          <span>·</span>
                        </>
                      )}
                      {formatDeadline(task.dueDate)}
                    </div>
                  </div>
                </div>

                {!task.isOfficial && (
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground p-1 rounded transition-all shrink-0 cursor-pointer"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            key="homework-add-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              key="homework-add-content"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md md:max-w-lg bg-surface border border-border-subtle rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle">
                <h3 className="text-[17px] font-semibold text-foreground tracking-tight">Add Task</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-secondary hover:text-foreground rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-[14px]">
                <div>
                  <label className="text-secondary block mb-1.5 font-medium">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Complete presentation, review lab code..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-border-strong text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-secondary block mb-1.5 font-medium">Category / Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-foreground focus:outline-none focus:border-border-strong text-[14px]"
                    >
                      <option value="General">General / Personal</option>
                      <option value="M">M (Maths)</option>
                      <option value="DE">DE (Digital Electronics)</option>
                      <option value="PPS">PPS (Programming)</option>
                      <option value="FCSEH">FCSEH (Ethics)</option>
                      <option value="CH">CH (Chemistry)</option>
                      <option value="CSK">CSK (Communication)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-secondary block mb-1.5 font-medium">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-foreground focus:outline-none focus:border-border-strong text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-secondary block mb-1.5 font-medium">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['urgent', 'medium', 'low'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`py-2 rounded-lg text-xs font-mono font-medium capitalize border transition-colors cursor-pointer ${
                          newPriority === p
                            ? p === 'urgent'
                              ? 'bg-red-500/10 border-red-500/30 text-red-500 font-semibold'
                              : p === 'medium'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold'
                              : 'bg-surface-elevated border-border text-foreground font-semibold'
                            : 'bg-surface-elevated/40 border-border-subtle text-secondary hover:text-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer text-[14px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition-opacity cursor-pointer text-[14px]"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
