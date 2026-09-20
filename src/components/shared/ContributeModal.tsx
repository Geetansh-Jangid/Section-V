import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Bell, 
  Link2, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  MessageSquarePlus, 
  Github, 
  FileText,
  FolderPlus,
  ArrowRight,
  Info,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface ContributeModalProps {
  open: boolean;
  onClose: () => void;
  initialCategory?: 'notes' | 'timetable' | 'faculty' | 'announcements' | 'links';
  initialSubject?: string;
}

type UpdateCategoryKey = 'notes' | 'timetable' | 'faculty' | 'announcements' | 'links';

interface UpdateCategoryConfig {
  id: UpdateCategoryKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  targetFile: string;
  templateFile: string;
  directUrl: string;
  templateUrl: string;
  description: string;
  placeholderTitle: string;
  placeholderDesc: string;
}

const CATEGORIES: UpdateCategoryConfig[] = [
  {
    id: 'notes',
    label: 'Add Notes to Drive (Google Drive Links)',
    shortLabel: 'Add Notes to Drive',
    icon: FolderPlus,
    targetFile: 'content/notes/[subject].txt',
    templateFile: 'content/templates/notes_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/tree/main/content/notes',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/notes_template.txt',
    description: 'Add Google Drive links for lecture notes, unit slides, or solved exam papers.',
    placeholderTitle: 'e.g. Unit 2 Differential Calculus Notes & Question Solutions',
    placeholderDesc: 'https://drive.google.com/file/d/...'
  },
  {
    id: 'timetable',
    label: 'Timetable & Class Schedule',
    shortLabel: 'Timetable',
    icon: Calendar,
    targetFile: 'content/timetable/timetable.txt',
    templateFile: 'content/templates/timetable_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/content/timetable/timetable.txt',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/timetable_template.txt',
    description: 'Update lecture timings, room changes, or proxy faculty assignments.',
    placeholderTitle: 'e.g. Wednesday PPS Tutorial moved to CS-Lab-4',
    placeholderDesc: 'Slot 1: Room changed from CT-12 to CS-Lab-4 with Prof. GS.'
  },
  {
    id: 'faculty',
    label: 'Faculty Directory & Cabins',
    shortLabel: 'Faculty',
    icon: Users,
    targetFile: 'content/faculty/faculty.txt',
    templateFile: 'content/templates/faculty_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/content/faculty/faculty.txt',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/faculty_template.txt',
    description: 'Update professor cabins, consultation hours, or contact information.',
    placeholderTitle: 'e.g. Dr. Khan office hours updated for Friday',
    placeholderDesc: 'Office hours updated to 02:30 PM – 04:00 PM at Chemistry Block Room 210.'
  },
  {
    id: 'announcements',
    label: 'Class Announcements & Circulars',
    shortLabel: 'Announcements',
    icon: Bell,
    targetFile: 'content/announcements/announcements.txt',
    templateFile: 'content/templates/announcements_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/content/announcements/announcements.txt',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/announcements_template.txt',
    description: 'Post examination notices, lab viva deadlines, official circulars, or hackathon team calls.',
    placeholderTitle: 'e.g. Mid-term examination schedule for Section V',
    placeholderDesc: 'Exam commencement date and subject-wise venue allocations.'
  },
  {
    id: 'links',
    label: 'Campus Portals & WhatsApp Links',
    shortLabel: 'Important Links',
    icon: Link2,
    targetFile: 'content/links/links.txt',
    templateFile: 'content/templates/links_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/content/links/links.txt',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/links_template.txt',
    description: 'Update ERP, LMS, WiFi authentication, or WhatsApp community invite links.',
    placeholderTitle: 'e.g. New Section V WhatsApp discussion group invite',
    placeholderDesc: 'Updated invite link for newly admitted Section V students.'
  }
];

const SUBJECT_OPTIONS = [
  { code: 'M', name: 'Mathematics' },
  { code: 'DE', name: 'Digital Electronics' },
  { code: 'PPS', name: 'Programming for Problem Solving' },
  { code: 'CH', name: 'Chemistry' },
  { code: 'CSK', name: 'Communication Skills' },
  { code: 'FCSEH', name: 'Science, Ethics & Human Values' }
];

const TEMPLATE_PREVIEWS: Record<UpdateCategoryKey, string> = {
  notes: `# Section V Subject Notes & Google Drive Links
# File: content/notes/[subject].txt

Subject Code: M
Subject Name: Mathematics
Faculty: Prof. G.C. Sharma (GC)
Drive Folder URL: https://drive.google.com/drive/folders/your-folder-id
PYQ Drive URL: https://drive.google.com/drive/folders/your-pyq-folder-id

[UNIT]
Unit Number: 1
Title: Differential & Integral Calculus
Topics: Mean Value Theorems, Taylor's Series, Definite Integrals
Drive Link: https://drive.google.com/file/d/your-lecture-slides.pdf

[PYQ]
Year: 2025 Mid-Sem
Exam Type: Mid-Sem
File Size: 1.5 MB
Drive Link: https://drive.google.com/file/d/your-pyq-paper.pdf`,

  timetable: `# Section V Timetable Data
# File: content/timetable/timetable.txt

[Monday]
Slot: 1 | Code: M | Name: Mathematics | Faculty: GC | Room: CT-12 | Type: Theory | Batch: Both
Slot: 2 | Code: DE | Name: Digital Electronics | Faculty: RSE | Room: CT-12 | Type: Theory | Batch: Both
Slot: 6 | Code: CSK LAB | Name: Communication Skills Lab | Faculty: RR | Room: CS-22 | Type: Lab | Batch: V1`,

  faculty: `# Section V Faculty Directory
# File: content/faculty/faculty.txt

[FACULTY]
ID: fac-gc
Name: Prof. G.C. Sharma (GC)
Designation: Professor & Mathematics Coordinator
Department: Applied Sciences & Mathematics
Cabin: Science Block Room 102
Email: gc.sharma@college.edu
Office Hours: Mon, Wed & Fri: 01:30 PM – 02:30 PM`,

  announcements: `# Section V Announcements
# File: content/announcements/announcements.txt

[ANNOUNCEMENT]
ID: notice-2026-new
Title: Mid-Term Examination Schedule Released
Author: Academic Cell & CR
Date: 2026-09-20
Priority: urgent
Category: Exam
Tags: Mid-Sem, Mandatory
Summary: Review allocated exam halls and reporting timings.`,

  links: `# Section V Links & Portals
# File: content/links/links.txt

GitHub Repo URL: https://github.com/Geetansh-Jangid/Section-V
WhatsApp Community URL: https://chat.whatsapp.com/section-v-announcements

[PORTAL]
ID: erp
Title: Student ERP
Description: Grades & Official Records
URL: https://erp.college.edu
Icon: GraduationCap`
};

export const ContributeModal: React.FC<ContributeModalProps> = ({ 
  open, 
  onClose,
  initialCategory = 'notes',
  initialSubject
}) => {
  const [selectedCatId, setSelectedCatId] = useState<UpdateCategoryKey>(initialCategory);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'M');
  const [driveLink, setDriveLink] = useState('');
  const [noteResourceType, setNoteResourceType] = useState<'unit' | 'folder' | 'pyq'>('unit');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  // Sync initialCategory
  useEffect(() => {
    if (open) {
      if (initialCategory) setSelectedCatId(initialCategory);
      if (initialSubject) setSelectedSubject(initialSubject);
    }
  }, [open, initialCategory, initialSubject]);

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
  const activeSubjectObj = SUBJECT_OPTIONS.find(s => s.code === selectedSubject) || SUBJECT_OPTIONS[0];

  // Generate plain text payload
  const generateSnippet = () => {
    if (selectedCatId === 'notes') {
      const driveUrlSafe = driveLink.trim() || 'https://drive.google.com/file/d/your-notes-link';
      const titleSafe = title.trim() || `${activeSubjectObj.name} Lecture Notes`;
      const authorSafe = authorName.trim() || 'Section V Student';

      if (noteResourceType === 'pyq') {
        return `# Add to content/notes/${activeSubjectObj.code.toLowerCase()}.txt
[PYQ]
Subject: ${activeSubjectObj.code} (${activeSubjectObj.name})
Year: ${titleSafe}
Exam Type: Mid-Sem
Drive Link: ${driveUrlSafe}
Contributor: ${authorSafe}
Notes: ${description || 'Verified clean PDF scan'}`;
      } else if (noteResourceType === 'folder') {
        return `# Add to content/notes/${activeSubjectObj.code.toLowerCase()}.txt
Subject Code: ${activeSubjectObj.code}
Subject Name: ${activeSubjectObj.name}
Drive Folder URL: ${driveUrlSafe}
Contributor: ${authorSafe}
Notes: ${description || 'Complete subject semester folder'}`;
      } else {
        return `# Add to content/notes/${activeSubjectObj.code.toLowerCase()}.txt
[UNIT]
Subject: ${activeSubjectObj.code} (${activeSubjectObj.name})
Title: ${titleSafe}
Drive Link: ${driveUrlSafe}
Topics: ${description || 'Key topics and solved problems'}
Contributor: ${authorSafe}`;
      }
    }

    return `# Content Update for: ${currentCategory.targetFile}
Category: ${currentCategory.label}
Title: ${title || currentCategory.placeholderTitle}
Description: ${description || currentCategory.placeholderDesc}
Contributor: ${authorName || 'Section V Contributor'}`;
  };

  const snippetText = generateSnippet();

  // Create GitHub Issue Link
  const issueTitle = encodeURIComponent(
    selectedCatId === 'notes'
      ? `[Drive Notes]: ${activeSubjectObj.code} - ${title || 'New Google Drive Notes Link'}`
      : `[${currentCategory.shortLabel}]: ${title || currentCategory.placeholderTitle}`
  );

  const issueBody = encodeURIComponent(
    `### Section V Contribution Request\n\n` +
    `**Category**: ${currentCategory.label}\n` +
    `**Target Content File**: \`${currentCategory.targetFile}\`\n` +
    `**Contributor**: ${authorName || 'Section V Student'}\n\n` +
    (selectedCatId === 'notes' ? `**Subject**: ${activeSubjectObj.code} — ${activeSubjectObj.name}\n**Google Drive URL**: ${driveLink || 'Not provided'}\n**Resource Type**: ${noteResourceType}\n\n` : '') +
    `#### Contribution Details:\n\`\`\`text\n${snippetText}\n\`\`\`\n\n` +
    `---\n*Submitted for Section V review.*`
  );

  const githubIssueUrl = `https://github.com/Geetansh-Jangid/Section-V/issues/new?title=${issueTitle}&body=${issueBody}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="contribute-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          style={{ minHeight: '100dvh' }}
          onClick={onClose}
        >
          <div className="h-full overflow-y-auto overscroll-contain flex p-3 sm:p-4">
            <motion.div
              key="contribute-modal-content"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-[#0c0c0c] border border-[#262626] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden m-auto"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-[#1f1f1f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#141414] border border-[#262626] text-white flex items-center justify-center shrink-0">
                  <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Contribute to Section V
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    Submit content updates for peer review.
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
              {/* Category Selector */}
              <div>
                <label className="text-neutral-200 font-semibold block mb-2 text-xs sm:text-sm">
                  1. What would you like to contribute?
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

              {/* Dedicated "Add Notes to Drive" Form */}
              {selectedCatId === 'notes' ? (
                <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white text-xs sm:text-sm">
                        Add Notes to Google Drive
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Subject Selector */}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Select Subject
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#282828] text-white text-xs focus:outline-none focus:border-neutral-400 cursor-pointer"
                      >
                        {SUBJECT_OPTIONS.map((sub) => (
                          <option key={sub.code} value={sub.code}>
                            {sub.code} — {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resource Type */}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Resource Type
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNoteResourceType('unit')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors text-center ${
                            noteResourceType === 'unit'
                              ? 'bg-neutral-200 text-black font-semibold'
                              : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                          }`}
                        >
                          Lecture Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteResourceType('folder')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors text-center ${
                            noteResourceType === 'folder'
                              ? 'bg-neutral-200 text-black font-semibold'
                              : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                          }`}
                        >
                          Drive Folder
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteResourceType('pyq')}
                          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors text-center ${
                            noteResourceType === 'pyq'
                              ? 'bg-neutral-200 text-black font-semibold'
                              : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#282828]'
                          }`}
                        >
                          PYQ Paper
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive Link Input */}
                  <div>
                    <label className="text-[11px] font-medium text-neutral-300 block mb-1">
                      Google Drive Link (Sharing set to "Anyone with link can view")
                    </label>
                    <input
                      type="url"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/your-lecture-notes..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#282828] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 font-mono text-xs"
                    />
                  </div>

                  {/* Notes Title & Contributor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Topic or Unit Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Unit 2 Differential Calculus Notes"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#161616] border border-[#282828] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Your Name / Roll No (optional)
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Yash (24AIDS042)"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#161616] border border-[#282828] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Topics covered or extra details
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Rolle's Theorem, Taylor Series, Solved 2024 examples"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#161616] border border-[#282828] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* General Form for Other Sections */
                <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1c1c1c]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <span className="font-semibold text-white text-xs sm:text-sm">
                        {currentCategory.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400">
                    {currentCategory.description}
                  </p>

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
                      placeholder="Your Name & Roll No (e.g. Yash - 24AIDS042)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your change (e.g., room change, slot timing, or contact update)..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              )}

              {/* Systematic TXT Preview Box */}
              <div className="rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                    Formatted Submission Payload
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplate(!showTemplate)}
                      className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                    >
                      {showTemplate ? 'Hide Template' : 'View Full Template'}
                    </button>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#181818] border border-[#282828] text-neutral-300 hover:text-white text-[11px] cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-[#121212] border border-[#222222] text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed max-h-32">
                  {showTemplate ? TEMPLATE_PREVIEWS[selectedCatId] : snippetText}
                </pre>
              </div>

              {/* Two simple submission options */}
              <div>
                <label className="text-neutral-200 font-semibold block mb-2 text-xs sm:text-sm">
                  2. Choose how to submit:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: 1-Click GitHub Issue Ticket */}
                  <a
                    href={githubIssueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                          <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                          <span>1-Click Issue Ticket</span>
                        </span>
                        <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                        Pre-fills an issue with your details. The CR team reviews and merges it.
                      </p>
                    </div>
                    <span className="mt-3 text-xs font-mono text-emerald-400 group-hover:text-emerald-300 font-medium transition-colors flex items-center gap-1">
                      <span>Easiest for students</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>

                  {/* Option 2: Direct File Edit on GitHub */}
                  <a
                    href={currentCategory.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#444444] transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                          <FileText className="w-4 h-4 text-neutral-300" />
                          <span>Edit Directly on GitHub</span>
                        </span>
                        <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                        Open GitHub to modify or add files directly and create a Pull Request.
                      </p>
                    </div>
                    <span className="mt-3 text-xs font-mono text-neutral-400 group-hover:text-neutral-200 font-medium transition-colors flex items-center gap-1">
                      <span>Direct Pull Request</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 sm:px-7 sm:py-4 border-t border-[#1f1f1f] bg-[#0c0c0c] shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-neutral-400">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/Geetansh-Jangid/Section-V"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors py-1 px-1.5 flex items-center gap-1 text-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
                <span>·</span>
                <a
                  href="https://github.com/Geetansh-Jangid/Section-V/pulls"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors py-1 px-1.5 text-xs"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
