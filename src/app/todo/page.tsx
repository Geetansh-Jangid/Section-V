import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  GitPullRequest,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  UserCheck,
  Tag,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useSectionVStore, HomeworkTask } from '../../lib/store.ts';
import tasksDataRaw from '../../data/tasks.json';
import { AddWorkModal } from '../../components/todo/AddWorkModal.tsx';

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

export const TodoPage: React.FC = () => {
  const {
    tasks: localTasks,
    toggleTask,
    deleteTask,
    addTask
  } = useSectionVStore();

  const [selectedSection, setSelectedSection] = useState<'All' | 'V1' | 'V2'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Track completed IDs for official tasks in local storage via simple set
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

  const officialTasks: (RawOfficialTask & { isOfficial: true; completed: boolean })[] = useMemo(() => {
    return (tasksDataRaw as RawOfficialTask[]).map((task) => ({
      ...task,
      isOfficial: true,
      completed: completedOfficialIds.includes(task.id)
    }));
  }, [completedOfficialIds]);

  const customTasks: (HomeworkTask & { section: 'All' | 'V1' | 'V2'; assignedBy: string; isOfficial: false; description: string })[] = useMemo(() => {
    return localTasks.map((task) => ({
      id: task.id,
      title: task.title,
      subjectCode: task.subjectCode,
      section: 'All',
      dueDate: task.dueDate,
      priority: task.priority,
      assignedBy: 'Personal / Self',
      description: task.notes || '',
      completed: task.completed,
      createdAt: task.createdAt,
      isOfficial: false
    }));
  }, [localTasks]);

  // Combined tasks
  const allTasks = useMemo(() => {
    return [...officialTasks, ...customTasks];
  }, [officialTasks, customTasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Section filter
      if (selectedSection !== 'All') {
        if (task.section !== 'All' && task.section !== selectedSection) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesSubject = task.subjectCode.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesFaculty = task.assignedBy.toLowerCase().includes(query);
        return matchesTitle || matchesSubject || matchesDesc || matchesFaculty;
      }

      return true;
    });
  }, [allTasks, selectedSection, statusFilter, priorityFilter, searchQuery]);

  // Metrics
  const totalCount = allTasks.length;
  const completedCount = allTasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const urgentPendingCount = allTasks.filter((t) => !t.completed && t.priority === 'urgent').length;

  const getPriorityBadge = (priority: 'urgent' | 'medium' | 'low') => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
            Low
          </span>
        );
    }
  };

  const getDaysRemainingText = (dueDateStr: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-rose-400 font-mono text-[11px] font-semibold">Overdue ({Math.abs(diffDays)}d ago)</span>;
    }
    if (diffDays === 0) {
      return <span className="text-rose-400 font-mono text-[11px] font-semibold">Due Today</span>;
    }
    if (diffDays === 1) {
      return <span className="text-amber-400 font-mono text-[11px] font-semibold">Due Tomorrow</span>;
    }
    return <span className="text-neutral-400 font-mono text-[11px]">Due in {diffDays} days</span>;
  };

  return (
    <div className="space-y-6">
      {/* Add Work Modal */}
      <AddWorkModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSection={selectedSection}
      />

      {/* Header Overview Banner */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1c1c1c]">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                Academic Tasks & Lab Work
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Lab sheets, assignments, tutorial sets, and academic deadlines for Section V.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>Add Work / Todo</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Total Work Items</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{totalCount}</span>
              <span className="text-xs text-neutral-500">assignments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400 font-mono">{pendingCount}</span>
              <span className="text-xs text-neutral-500">to complete</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Completed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{completedCount}</span>
              <span className="text-xs text-neutral-500">checked off</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Urgent Action</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${urgentPendingCount > 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
                {urgentPendingCount}
              </span>
              <span className="text-xs text-neutral-500">urgent pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Section Filter Tabs: All, V1, V2 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-400 shrink-0 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Section:</span>
            </span>
            <div className="inline-flex bg-[#121212] p-1 rounded-lg border border-[#222222]">
              {(['All', 'V1', 'V2'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer select-none ${
                    selectedSection === sec
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sec === 'All' ? 'All (V1 + V2)' : `Batch ${sec}`}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-[#121212] p-1 rounded-lg border border-[#222222]">
              {(['all', 'pending', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs capitalize font-medium transition-colors cursor-pointer select-none ${
                    statusFilter === st
                      ? 'bg-[#222222] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#222222] text-xs text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Only</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by assignment title, subject (PPS, DE, M...), or faculty name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#121212] border border-[#222222] text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#161616] text-neutral-400 flex items-center justify-center mx-auto">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No tasks found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || selectedSection !== 'All'
                ? 'No assignments match the selected filters or search terms.'
                : 'All caught up! No active tasks right now.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || selectedSection !== 'All') && (
                <button
                  onClick={() => {
                    setSelectedSection('All');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs text-neutral-300 hover:text-white cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 cursor-pointer"
              >
                Add Work Item
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.completed;
            return (
              <div
                key={task.id}
                className={`rounded-xl bg-[#0d0d0d] border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isDone
                    ? 'border-[#1a1a1a] opacity-60 bg-[#090909]'
                    : 'border-[#222222] hover:border-[#333333]'
                }`}
              >
                {/* Left checkbox & details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (task.isOfficial) {
                        toggleOfficialTask(task.id);
                      } else {
                        toggleTask(task.id);
                      }
                    }}
                    className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-neutral-500 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                    title={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-black border border-neutral-700 text-white">
                        {task.subjectCode}
                      </span>

                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#161616] border border-[#2a2a2a] text-neutral-300">
                        {task.section === 'All' ? 'V1 & V2' : `Batch ${task.section}`}
                      </span>

                      {getPriorityBadge(task.priority)}

                      {task.isOfficial ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Official Section V
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400 bg-[#161616] border border-[#262626] px-1.5 py-0.5 rounded">
                          Personal
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h3
                      className={`text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                        isDone ? 'line-through text-neutral-400' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    {/* Assigned By & Due Date Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Assigned by: <strong className="text-neutral-300 font-normal">{task.assignedBy}</strong></span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Due: <strong className="text-neutral-300 font-mono font-normal">{task.dueDate || 'No set deadline'}</strong></span>
                      </span>

                      {getDaysRemainingText(task.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a1a1a]">
                  {!task.isOfficial && (
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      title="Delete personal task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Peer Review Contribution Note */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0a0a0a] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">Have an assignment or lab question sheet?</h4>
            <p className="text-xs text-neutral-400">
              Submit assignments for Section V peer review or add to your local checklist.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs font-semibold text-neutral-200 hover:text-white hover:border-[#383838] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-neutral-400" />
          <span>Propose Work Item</span>
        </button>
      </div>
    </div>
  );
};
