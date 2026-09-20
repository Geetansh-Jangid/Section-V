import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitPullRequest, 
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Bell,
  Link2,
  FileCode,
  Github,
  MessageSquarePlus,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContributeModalProps {
  open: boolean;
  onClose: () => void;
}

type UpdateCategoryKey = 'timetable' | 'faculty' | 'notes-json' | 'notes-md' | 'announcements' | 'links';

interface UpdateCategoryConfig {
  id: UpdateCategoryKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  targetFile: string;
  directUrl: string;
  description: string;
  placeholderTitle: string;
  placeholderDesc: string;
}

const CATEGORIES: UpdateCategoryConfig[] = [
  {
    id: 'timetable',
    label: 'Timetable & Class Schedule',
    shortLabel: 'Timetable',
    icon: Calendar,
    targetFile: 'src/data/timetable.json',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/src/data/timetable.json',
    description: 'Update lecture timings, room changes (LH-302, CS-Labs), or proxy faculty.',
    placeholderTitle: 'e.g. Wednesday DBMS Lab room changed to Lab 4',
    placeholderDesc: 'Batch V1 DBMS practical is moved to CS-Lab-4 from 10:00 AM.'
  },
  {
    id: 'faculty',
    label: 'Faculty Directory & Cabins',
    shortLabel: 'Faculty',
    icon: Users,
    targetFile: 'src/data/faculty.json',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/src/data/faculty.json',
    description: 'Update professor cabins, consultation hours, emails, or subjects.',
    placeholderTitle: 'e.g. Dr. Verma cabin updated to Block-3 Room 214',
    placeholderDesc: 'Consultation hours changed to 3:00 PM – 4:00 PM on Tuesday.'
  },
  {
    id: 'notes-json',
    label: 'Notes & Drive Links Catalog',
    shortLabel: 'Drive Notes',
    icon: BookOpen,
    targetFile: 'src/data/notes.json',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/src/data/notes.json',
    description: 'Add Google Drive folders, question papers (PYQs), or unit topics.',
    placeholderTitle: 'e.g. Added Unit 3 PPS Linked List slides and Drive folder',
    placeholderDesc: 'Link: https://drive.google.com/... with past 3-year mid-term questions.'
  },
  {
    id: 'notes-md',
    label: 'New Markdown Notes Document',
    shortLabel: 'Markdown Note',
    icon: FileCode,
    targetFile: 'content/notes/[subject].md',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/new/main/content/notes',
    description: 'Create a comprehensive subject guide or cheat sheet in Markdown.',
    placeholderTitle: 'e.g. Operating Systems Process Synchronization Study Guide',
    placeholderDesc: 'Detailed notes on Semaphores, Peterson algorithm, and Dining Philosophers.'
  },
  {
    id: 'announcements',
    label: 'Class Announcement',
    shortLabel: 'Notice',
    icon: Bell,
    targetFile: 'content/announcements/[slug].md',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/new/main/content/announcements',
    description: 'Publish official circulars, exam dates, fee deadlines, or hackathons.',
    placeholderTitle: 'e.g. Mid-term examination schedule for Section V',
    placeholderDesc: 'Exam commencement date and subject-wise venue allocations.'
  },
  {
    id: 'links',
    label: 'Campus Portals & WhatsApp Links',
    shortLabel: 'Links',
    icon: Link2,
    targetFile: 'src/data/links.json',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/src/data/links.json',
    description: 'Update ERP, LMS, WiFi authentication, or WhatsApp community links.',
    placeholderTitle: 'e.g. New Section V WhatsApp discussion group invite',
    placeholderDesc: 'Updated invite link for newly admitted Section V students.'
  }
];

export const ContributeModal: React.FC<ContributeModalProps> = ({ open, onClose }) => {
  const [selectedCatId, setSelectedCatId] = useState<UpdateCategoryKey>('timetable');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];

  const generatedPrBody = `### Section V Contribution Request

#### 1. Category
- [x] ${currentCategory.label}

#### 2. Target File
- \`${currentCategory.targetFile}\`

#### 3. Proposed Summary
${title || 'Proposed update for Section V'}

#### 4. Details
${description || currentCategory.placeholderDesc}

#### 5. Contributor
- Student: ${authorName || 'Section V Student'}
- Date: ${new Date().toISOString().split('T')[0]}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate GitHub Issue URL for zero-friction submission without editing JSON
  const githubIssueUrl = `https://github.com/Geetansh-Jangid/Section-V/issues/new?title=${encodeURIComponent(
    `[${currentCategory.shortLabel}] ${title || 'Update Request'}`
  )}&body=${encodeURIComponent(generatedPrBody)}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="contribute-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div 
            key="contribute-modal-content"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            data-modal-card="true"
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-[#0c0c0c] border border-[#262626] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-[#1f1f1f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white text-black flex items-center justify-center font-mono font-bold text-sm sm:text-base shadow-sm shrink-0">
                  V
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Contribute to Section V
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    Direct browser edit or 1-click issue ticket. No command line required.
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6 space-y-5 text-xs sm:text-sm">
              {/* Step 1: Select Category */}
              <div>
                <label className="text-neutral-200 font-semibold block mb-2 text-xs sm:text-sm">
                  1. What would you like to update?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl text-left transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-white text-black font-semibold shadow-sm'
                            : 'bg-[#141414] border border-[#222222] text-neutral-400 hover:text-white hover:border-[#333333]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-colors ${isSelected ? 'text-current' : 'text-neutral-400'}`} />
                        <span className="text-xs sm:text-sm truncate font-medium">{cat.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target File Info Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="font-mono text-xs sm:text-sm text-neutral-200 font-semibold truncate">
                      {currentCategory.targetFile}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {currentCategory.description}
                  </p>
                </div>
                <a
                  href={currentCategory.directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors shrink-0 text-xs sm:text-sm shadow-sm"
                  title="Directly opens this specific file in GitHub web editor"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Edit File on GitHub</span>
                </a>
              </div>

              {/* Step 2: Optional Details */}
              <div className="space-y-2.5 pt-1">
                <label className="text-neutral-200 font-semibold block text-xs sm:text-sm">
                  2. Brief details (for GitHub Issue or PR description)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={currentCategory.placeholderTitle}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your Name & Roll No (e.g. Yash - 24CSE042)"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm"
                  />
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your change (e.g., room number, drive link, or rescheduled slot)..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Two simple submission options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Direct File Edit on GitHub */}
                <a
                  href={currentCategory.directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                        <Code className="w-4 h-4 text-neutral-300" />
                        <span>Direct Web Editor</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      Opens <code className="text-neutral-200 font-mono text-[11px] px-1 py-0.5 rounded bg-[#1a1a1a]">{currentCategory.targetFile}</code> directly in GitHub. Edit in your browser & propose changes.
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-mono text-neutral-400 group-hover:text-neutral-200 font-medium transition-colors">
                    Recommended for quick edits →
                  </span>
                </a>

                {/* Option 2: Pre-filled Issue Ticket (Zero Git/JSON knowledge) */}
                <a
                  href={githubIssueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                        <MessageSquarePlus className="w-4 h-4 text-neutral-300" />
                        <span>Submit Issue Ticket</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      Opens a pre-filled ticket with your details. No JSON knowledge needed—the CR team will review & merge.
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-mono text-neutral-400 group-hover:text-neutral-200 font-medium transition-colors">
                    Easiest for beginners →
                  </span>
                </a>
              </div>
            </div>

            {/* Footer action tools */}
            <div className="px-5 py-3.5 sm:px-7 sm:py-4 border-t border-[#1f1f1f] bg-[#0c0c0c] shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-neutral-400">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-[#1a1a1a]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="font-medium">{copied ? 'Copied Markdown!' : 'Copy Formatted Text'}</span>
                </button>
                <span>·</span>
                <a
                  href="https://github.dev/Geetansh-Jangid/Section-V"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors py-1 px-1.5"
                  title="Open full web VS Code editor"
                >
                  Web VS Code
                </a>
                <span>·</span>
                <a
                  href="https://github.com/Geetansh-Jangid/Section-V/pulls"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors py-1 px-1.5"
                >
                  Active PRs
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#161616] border border-[#262626] text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm font-medium"
                >
                  Close
                </button>
                <a
                  href="https://github.com/Geetansh-Jangid/Section-V"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161616] border border-[#262626] text-neutral-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repo</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

