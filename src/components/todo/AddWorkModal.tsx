import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  GitPullRequest,
  Plus,
  MessageSquarePlus,
  ArrowRight,
  ExternalLink,
  Calendar,
  Check,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { useSectionVStore } from '../../lib/store.ts';

interface AddWorkModalProps {
  open: boolean;
  onClose: () => void;
  defaultSection?: 'All' | 'V1' | 'V2';
}

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
  open,
  onClose,
  defaultSection = 'All'
}) => {
  const { addTask } = useSectionVStore();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('PPS');
  const [section, setSection] = useState<'All' | 'V1' | 'V2'>(defaultSection);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'medium' | 'low'>('medium');
  const [assignedBy, setAssignedBy] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setSection(defaultSection);
    }
  }, [open, defaultSection]);

  // Lock body scroll while modal open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  const resetForm = () => {
    setTitle('');
    setSubject('PPS');
    setSection('All');
    setDueDate('');
    setPriority('medium');
    setAssignedBy('');
    setDescription('');
  };

  const formattedSnippet = `[TASK]
ID: task-${Date.now().toString().slice(-6)}
Title: ${title.trim() || 'New Lab Assignment / Academic Task'}
Subject: ${subject}
Section: ${section}
Due Date: ${dueDate || new Date().toISOString().split('T')[0]}
Priority: ${priority}
Assigned By: ${assignedBy.trim() || 'Course Faculty'}
Description: ${description.trim() || 'Task requirements and instructions.'}`;

  const issueTitle = encodeURIComponent(`[Task]: [${section}] ${subject} - ${title.trim() || 'New Academic Task'}`);
  const issueBody = encodeURIComponent(
    `### Section V Task Submission\n\n` +
    `**Title**: ${title.trim() || 'Untitled'}\n` +
    `**Subject**: ${subject}\n` +
    `**Batch / Section**: ${section}\n` +
    `**Due Date**: ${dueDate || 'Not specified'}\n` +
    `**Priority**: ${priority}\n` +
    `**Assigned By**: ${assignedBy || 'Faculty'}\n\n` +
    `#### Task Details:\n\`\`\`text\n${formattedSnippet}\n\`\`\`\n\n` +
    `---\n*Submitted for Section V peer review.*`
  );

  const githubIssueUrl = `https://github.com/Geetansh-Jangid/Section-V/issues/new?title=${issueTitle}&body=${issueBody}`;

  const handlePersonalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subjectCode: subject,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      priority,
      notes: description.trim()
    });

    resetForm();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="add-work-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          style={{ minHeight: '100dvh' }}
          onClick={onClose}
        >
          <div className="h-full overflow-y-auto overscroll-contain flex p-3 sm:p-4">
            <motion.div
              key="add-work-modal-content"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl bg-[#0d0d0d] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] m-auto"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#1f1f1f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Add Todo / Work Item</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Propose assignments for Section V review or track locally.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form & Actions */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-neutral-200 font-medium block mb-1.5">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PPS Lab Assignment 4: Structs and Linked Lists"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-200 font-medium block mb-1.5">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none"
                  >
                    <option value="M">M (Mathematics)</option>
                    <option value="DE">DE (Digital Electronics)</option>
                    <option value="PPS">PPS (Programming)</option>
                    <option value="FCSEH">FCSEH (Ethics)</option>
                    <option value="CH">CH (Chemistry)</option>
                    <option value="CSK">CSK (Communication)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-200 font-medium block mb-1.5">Section Filter</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-lg border border-[#262626]">
                    {(['All', 'V1', 'V2'] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                          section === sec
                            ? 'bg-white text-black'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-neutral-200 font-medium block mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-200 font-medium block mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-200 font-medium block mb-1.5">Assigned By</label>
                  <input
                    type="text"
                    value={assignedBy}
                    onChange={(e) => setAssignedBy(e.target.value)}
                    placeholder="e.g. Prof. G.S. Rathore"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-200 font-medium block mb-1.5">Description & Guidelines</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Questions to solve, submission format, lab notebook dry-run requirements..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#262626] text-white focus:outline-none resize-none"
                />
              </div>

              {/* Submission Options */}
              <div className="pt-2">
                <label className="text-neutral-200 font-semibold block mb-2 text-xs">
                  Choose Submission Mode:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Propose to Section via PR/Issue */}
                  <a
                    href={githubIssueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 sm:p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                          <GitPullRequest className="w-4 h-4 text-emerald-400" />
                          <span>Submit for Section Review</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        Creates an issue or PR to add this task to official Section V todos.
                      </p>
                    </div>
                    <span className="mt-2.5 text-[11px] font-mono text-emerald-400 group-hover:text-emerald-300 font-medium flex items-center gap-1">
                      <span>Section-wide PR</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>

                  {/* Option 2: Add Locally to My Checklist */}
                  <button
                    type="button"
                    onClick={handlePersonalAdd}
                    className="p-3.5 sm:p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group text-left cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                          <Plus className="w-4 h-4 text-neutral-300" />
                          <span>Add to Personal List</span>
                        </span>
                        <CheckSquare className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        Saves immediately to your local browser checklist.
                      </p>
                    </div>
                    <span className="mt-2.5 text-[11px] font-mono text-neutral-300 group-hover:text-white font-medium flex items-center gap-1">
                      <span>Save locally</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-[#1f1f1f] bg-[#0c0c0c] shrink-0 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formattedSnippet);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
                <span>{copied ? 'Payload Copied' : 'Copy Payload'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#181818] border border-[#282828] text-neutral-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
