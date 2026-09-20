import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSectionVStore } from '../../lib/store.ts';

export const HomeworkWidget: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useSectionVStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('PPS');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'urgent' | 'medium' | 'low'>('medium');

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

  const pendingCount = tasks.filter((t) => !t.completed).length;

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

  return (
    <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 flex flex-col justify-between hover:border-[#333333] transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Lab Work & Homework
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-[#141414] border border-[#222222]">
              {pendingCount} Pending
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 rounded bg-[#141414] border border-[#222222] text-neutral-300 hover:text-white"
              title="Add task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              No pending assignments. Click + to add one.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start justify-between gap-2 p-2 rounded border text-xs transition-colors ${
                  task.completed
                    ? 'bg-[#0d0d0d] border-[#1a1a1a] text-neutral-500'
                    : 'bg-[#111111] border-[#222222] text-neutral-200'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-white shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-xs leading-snug ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                      <span className="text-neutral-400 font-bold">{task.subjectCode}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              key="homework-add-content"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md md:max-w-lg lg:max-w-xl bg-[#0f0f0f] border border-[#262626] rounded-2xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Add Lab / Assignment Task</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs sm:text-sm">
                <div>
                  <label className="text-neutral-300 block mb-1.5 font-medium">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. PPS Lab 3 File Printout"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white focus:outline-none focus:border-neutral-400 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-300 block mb-1.5 font-medium">Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white focus:outline-none text-xs sm:text-sm"
                    >
                      <option value="M">M (Maths)</option>
                      <option value="DE">DE (Digital Electronics)</option>
                      <option value="PPS">PPS (Programming)</option>
                      <option value="FCSEH">FCSEH (Ethics)</option>
                      <option value="CH">CH (Chemistry)</option>
                      <option value="CSK">CSK (Communication)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-300 block mb-1.5 font-medium">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white focus:outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#222222]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#161616] border border-[#262626] text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-xs sm:text-sm"
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
