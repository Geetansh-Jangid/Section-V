import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
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
const userSection = useSectionVStore((s) => s.userSection);

  const [selectedSection, setSelectedSection] = useState<'All' | 'V1' | 'V2'>(userSection);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'medium' | 'low'>('all');

  // Global batch toggle overrides the local section filter
  useEffect(() => {
    setSelectedSection(userSection);
  }, [userSection]);
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

  // Tasks matching the section filter only (drives the quick-stats metrics)
  const sectionTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (selectedSection !== 'All' && task.section !== 'All' && task.section !== selectedSection) {
        return false;
      }
      return true;
    });
  }, [allTasks, selectedSection]);

  // Metrics (scoped to the selected section)
  const totalCount = sectionTasks.length;
  const completedCount = sectionTasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const urgentPendingCount = sectionTasks.filter((t) => !t.completed && t.priority === 'urgent').length;

  const getPriorityBadge = (priority: 'urgent' | 'medium' | 'low') => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Urgent
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-muted bg-surface-elevated border border-border-subtle">
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
      return <span className="text-red-500 dark:text-red-400 font-mono text-[12px] font-semibold">Overdue ({Math.abs(diffDays)}d ago)</span>;
    }
    if (diffDays === 0) {
      return <span className="text-red-500 dark:text-red-400 font-mono text-[12px] font-semibold">Due Today</span>;
    }
    if (diffDays === 1) {
      return <span className="text-amber-500 dark:text-amber-400 font-mono text-[12px] font-medium">Due Tomorrow</span>;
    }
    return <span className="text-muted font-mono text-[12px]">Due in {diffDays} days</span>;
  };

  return (
    <div className="space-y-6">
      {/* Add Work Modal */}
      <AddWorkModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSection={selectedSection}
      />

      {/* Page Title & Add Action Outside Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[26px] font-semibold text-foreground tracking-tight">
          Tasks
        </h1>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer select-none shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="rounded-xl bg-surface border border-border-subtle p-6 sm:p-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">Total Tasks</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-foreground font-mono">{totalCount}</span>
              <span className="text-[13px] text-muted">items</span>
            </div>
          </div>

          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">Pending</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-foreground font-mono">{pendingCount}</span>
              <span className="text-[13px] text-muted">to complete</span>
            </div>
          </div>

          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">Completed</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-muted font-mono">{completedCount}</span>
              <span className="text-[13px] text-muted">checked off</span>
            </div>
          </div>

          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">Urgent Action</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className={`text-3xl sm:text-4xl font-semibold font-mono ${urgentPendingCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-muted'}`}>
                {urgentPendingCount}
              </span>
              <span className="text-[13px] text-muted">urgent pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-xl bg-surface border border-border-subtle p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Section Filter Tabs: All, V1, V2 */}
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-medium text-secondary shrink-0">
              Section:
            </span>
            <div className="inline-flex bg-surface-secondary p-0.5 border border-border">
              {(['All', 'V1', 'V2'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 text-xs font-mono font-bold transition-colors cursor-pointer select-none border ${
                    selectedSection === sec
                      ? 'bg-selected-bg text-selected-text border-selected-border shadow-xs'
                      : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
                  }`}
                >
                  {sec === 'All' ? 'All (V1 + V2)' : `Batch ${sec}`}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-surface-secondary p-0.5 border border-border">
              {(['all', 'pending', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs capitalize font-medium transition-colors cursor-pointer select-none border ${
                    statusFilter === st
                      ? 'bg-selected-bg text-selected-text font-bold border-selected-border shadow-xs'
                      : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
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
              className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-foreground focus:outline-none focus:border-border-strong cursor-pointer"
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
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by assignment title, subject (PPS, DE, M...), or faculty name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-foreground text-[14px] placeholder-muted focus:outline-none focus:border-border-strong"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl bg-surface border border-border-subtle p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-elevated text-muted flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-semibold text-foreground">
              {searchQuery || statusFilter !== 'all' || selectedSection !== 'All'
                ? 'No matching tasks found'
                : 'All caught up · Great job!'}
            </h3>
            <p className="text-[14px] text-secondary max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || selectedSection !== 'All'
                ? 'No tasks match the selected filters or search terms.'
                : 'Inbox zero! No pending tasks on your radar.'}
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
                  className="px-3.5 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-secondary hover:text-foreground cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.completed;
            return (
              <div
                key={task.id}
                className={`rounded-xl bg-surface border p-5 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isDone
                    ? 'border-border-subtle opacity-60 bg-surface-elevated/20'
                    : 'border-border-subtle hover:border-border'
                }`}
              >
                {/* Left checkbox & details */}
                <div className="flex items-start gap-4 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (task.isOfficial) {
                        toggleOfficialTask(task.id);
                      } else {
                        toggleTask(task.id);
                      }
                    }}
                    className={`mt-1 p-1 rounded transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-muted hover:text-foreground'
                    }`}
                    title={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-muted hover:text-foreground" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated text-foreground">
                        {task.subjectCode}
                      </span>

                      <span className={`font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-surface-elevated ${
                        task.section === 'V1'
                          ? 'text-foreground'
                          : task.section === 'V2'
                          ? 'text-secondary'
                          : 'text-muted'
                      }`}>
                        {task.section === 'All' ? 'V1 & V2' : `Batch ${task.section}`}
                      </span>

                      {getPriorityBadge(task.priority)}

                      {task.isOfficial ? (
                        <span className="text-[11px] font-mono text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                          Official
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-secondary bg-surface-elevated px-2 py-0.5 rounded font-medium">
                          Personal
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h3
                      className={`text-[15px] sm:text-[16px] font-semibold tracking-tight transition-colors ${
                        isDone ? 'line-through text-muted' : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-[13.5px] text-secondary leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    {/* Assigned By & Due Date Meta */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1.5 text-[13px] text-muted">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-muted" />
                        <span>Assigned by: <strong className="text-secondary font-normal">{task.assignedBy}</strong></span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>Due: <strong className="text-secondary font-mono font-normal">{task.dueDate || 'No set deadline'}</strong></span>
                      </span>

                      {getDaysRemainingText(task.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                  {!task.isOfficial && (
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
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
    </div>
  );
};
