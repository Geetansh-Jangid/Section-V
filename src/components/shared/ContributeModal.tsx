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
  FileCode,
  GitPullRequest,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { formatContributionBlock, ContributionPayload, ContributionResult } from '../../api/contributeHandler.ts';

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
}

const CATEGORIES: UpdateCategoryConfig[] = [
  {
    id: 'notes',
    label: 'Add Notes to Drive (Google Drive Links)',
    shortLabel: 'Notes',
    icon: FolderPlus,
    targetFile: 'content/notes/[subject].txt',
    templateFile: 'content/templates/notes_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/tree/main/content/notes',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/notes_template.txt',
    description: 'Add Google Drive links for lecture notes, unit slides, or solved exam papers.'
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
    description: 'Propose permanent schedule changes, room updates, or proxy lecture allocations.'
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
    description: 'Update professor cabins, consultation hours, or department contact information.'
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
    description: 'Post examination notices, lab viva deadlines, official circulars, or hackathon team calls.'
  },
  {
    id: 'links',
    label: 'Campus Portals & Community Links',
    shortLabel: 'Links',
    icon: Link2,
    targetFile: 'content/links/links.txt',
    templateFile: 'content/templates/links_template.txt',
    directUrl: 'https://github.com/Geetansh-Jangid/Section-V/edit/main/content/links/links.txt',
    templateUrl: 'https://github.com/Geetansh-Jangid/Section-V/blob/main/content/templates/links_template.txt',
    description: 'Update ERP, LMS, WiFi authentication, or WhatsApp community invite links.'
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

[UNIT]
Unit Number: 1
Title: Differential & Integral Calculus
Topics: Mean Value Theorems, Taylor's Series, Definite Integrals
Drive Link: https://drive.google.com/file/d/your-lecture-slides.pdf
Contributor: Section V Student

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

[PORTAL]
ID: portal-erp
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
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ContributionResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Category 1: Notes State
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'M');
  const [noteResourceType, setNoteResourceType] = useState<'unit' | 'folder' | 'pyq'>('unit');
  const [driveLink, setDriveLink] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [unitNumber, setUnitNumber] = useState('1');
  const [pyqYear, setPyqYear] = useState('2025 Mid-Sem');
  const [noteDescription, setNoteDescription] = useState('');

  // Category 2: Timetable State
  const [timetableDay, setTimetableDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [timetableSlot, setTimetableSlot] = useState('1');
  const [timetableSubjectCode, setTimetableSubjectCode] = useState('M');
  const [timetableSubjectName, setTimetableSubjectName] = useState('Mathematics');
  const [timetableFaculty, setTimetableFaculty] = useState('Prof. GC');
  const [timetableRoom, setTimetableRoom] = useState('CT-12');
  const [timetableType, setTimetableType] = useState<'Theory' | 'Lab' | 'Tutorial'>('Theory');
  const [timetableBatch, setTimetableBatch] = useState<'Both' | 'V1' | 'V2'>('Both');
  const [timetableNote, setTimetableNote] = useState('');

  // Category 3: Faculty State
  const [facultyName, setFacultyName] = useState('');
  const [facultyDesignation, setFacultyDesignation] = useState('Assistant Professor');
  const [facultyDepartment, setFacultyDepartment] = useState('Computer Science & Engineering');
  const [facultyCabin, setFacultyCabin] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyOfficeHours, setFacultyOfficeHours] = useState('Mon, Wed: 02:00 PM – 03:30 PM');
  const [facultyNote, setFacultyNote] = useState('');

  // Category 4: Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<'Academic' | 'Exam' | 'Placement' | 'Event' | 'Circular' | 'General'>('Academic');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [announcementAuthority, setAnnouncementAuthority] = useState('Section V CR');
  const [announcementSummary, setAnnouncementSummary] = useState('');

  // Category 5: Links State
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkType, setLinkType] = useState<'Portal' | 'Community' | 'Academic' | 'Document'>('Portal');

  // Sync initial props
  useEffect(() => {
    if (open) {
      if (initialCategory) setSelectedCatId(initialCategory);
      if (initialSubject) setSelectedSubject(initialSubject);
      setSubmitResult(null);
      setSubmissionError(null);
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
  const activeSubjectObj = SUBJECT_OPTIONS.find((s) => s.code === selectedSubject) || SUBJECT_OPTIONS[0];

  // Build payload object based on active category
  const buildCurrentPayload = (): ContributionPayload => {
    const author = authorName.trim() || 'Section V Student';
    switch (selectedCatId) {
      case 'notes':
        return {
          category: 'notes',
          subjectCode: activeSubjectObj.code,
          resourceType: noteResourceType,
          title: noteTitle.trim() || (noteResourceType === 'pyq' ? `${activeSubjectObj.name} PYQ Paper` : `${activeSubjectObj.name} Notes`),
          driveUrl: driveLink.trim() || 'https://drive.google.com/file/d/example',
          author,
          description: noteDescription.trim() || undefined,
          unitNumber: noteResourceType === 'unit' ? unitNumber : undefined,
          year: noteResourceType === 'pyq' ? pyqYear : undefined
        };

      case 'timetable':
        return {
          category: 'timetable',
          day: timetableDay,
          slotPeriod: timetableSlot,
          subjectCode: timetableSubjectCode.trim() || activeSubjectObj.code,
          subjectName: timetableSubjectName.trim() || activeSubjectObj.name,
          faculty: timetableFaculty.trim() || 'Faculty',
          room: timetableRoom.trim() || 'CT-12',
          type: timetableType,
          batch: timetableBatch,
          author,
          description: timetableNote.trim() || undefined
        };

      case 'faculty':
        return {
          category: 'faculty',
          name: facultyName.trim() || 'Dr. Professor Name',
          designation: facultyDesignation.trim() || 'Assistant Professor',
          department: facultyDepartment.trim() || 'Applied Sciences',
          cabin: facultyCabin.trim() || 'Cabin 101',
          email: facultyEmail.trim() || 'faculty@college.edu',
          officeHours: facultyOfficeHours.trim() || 'Mon, Wed: 02:00 PM - 03:30 PM',
          author,
          description: facultyNote.trim() || undefined
        };

      case 'announcements':
        return {
          category: 'announcements',
          title: announcementTitle.trim() || 'Section V Circular',
          announcementCategory,
          priority: announcementPriority,
          authority: announcementAuthority.trim() || 'Academic Cell',
          summary: announcementSummary.trim() || 'Announcement details and instructions.',
          author
        };

      case 'links':
        return {
          category: 'links',
          title: linkTitle.trim() || 'Campus Resource Portal',
          url: linkUrl.trim() || 'https://college.edu',
          description: linkDescription.trim() || 'Official college web portal',
          linkType,
          author
        };
    }
  };

  const currentPayload = buildCurrentPayload();
  const { targetFile, block: snippetText } = formatContributionBlock(currentPayload);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitContribution = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentPayload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit contribution.');
      }

      setSubmitResult(data);
    } catch (err: any) {
      setSubmissionError(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click fallback Issue URL
  const fallbackIssueUrl = `https://github.com/Geetansh-Jangid/Section-V/issues/new?title=${encodeURIComponent(
    `[${currentCategory.shortLabel}]: Contribution proposal`
  )}&body=${encodeURIComponent(
    `### Contribution Proposal\n\n- **Category**: ${currentCategory.label}\n- **Target File**: \`${targetFile}\`\n- **Contributor**: ${authorName || 'Section V Student'}\n\n\`\`\`text\n${snippetText}\n\`\`\``
  )}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="contribute-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] modal-backdrop backdrop-blur-md"
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
              className="w-full max-w-[calc(100dvw-1.5rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-surface border border-border-subtle rounded-none shadow-xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden m-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 sm:px-7 sm:py-4 border-b border-border-subtle shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-elevated border border-border-subtle text-foreground flex items-center justify-center shrink-0">
                    <GitPullRequest className="w-4 h-4 text-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Contribute to Section V
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6 space-y-6 text-xs sm:text-sm">
                {/* Submission Success Screen */}
                {submitResult ? (
                  <div className="py-8 px-4 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center text-foreground">
                      <CheckCircle2 className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground tracking-tight">
                        {submitResult.prUrl ? 'Pull Request Submitted Successfully!' : 'Contribution Formatted & Verified!'}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto mt-1 leading-relaxed">
                        {submitResult.message}
                      </p>
                    </div>

                    {submitResult.prUrl && (
                      <div className="pt-2">
                        <a
                          href={submitResult.prUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                        >
                          <GitPullRequest className="w-4 h-4" />
                          <span>View Pull Request #{submitResult.prNumber} on GitHub</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border-subtle max-w-lg mx-auto text-left space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                        Target File: {submitResult.targetFile}
                      </span>
                      <pre className="p-3 bg-surface-elevated border border-border-subtle font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre">
                        {submitResult.formattedSnippet}
                      </pre>
                    </div>

                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitResult(null);
                          setSubmissionError(null);
                        }}
                        className="px-4 py-2 bg-surface-elevated border border-border-subtle text-secondary hover:text-foreground text-xs font-medium cursor-pointer"
                      >
                        Submit Another Update
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-foreground text-background font-semibold text-xs cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. Category Selection */}
                    <div>
                      <label className="text-foreground font-semibold block mb-2 text-xs sm:text-sm">
                        1. Select Contribution Category
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = selectedCatId === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCatId(cat.id);
                                setSubmissionError(null);
                              }}
                              className={`flex flex-col items-start justify-between gap-2.5 p-3 text-left cursor-pointer select-none border border-border-subtle min-h-[68px] sm:min-h-[72px] focus:outline-none focus-visible:ring-1 focus-visible:ring-border ${
                                isSelected
                                  ? 'bg-surface-elevated'
                                  : 'bg-surface hover:bg-surface-secondary/60'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0 text-secondary" />
                              <span className="text-xs truncate w-full font-medium text-foreground">
                                {cat.shortLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contributor Name Banner */}
                    <div className="p-3 bg-surface-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">Contributor Attribution:</span>
                        <span className="text-secondary ml-1.5">Credited in commit history and peer-review PR.</span>
                      </div>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Your Name / Roll No (e.g. Yash - 24AIDS042)"
                        className="px-3 py-1.5 bg-surface border border-border text-foreground placeholder:text-muted text-xs focus:outline-none focus:border-border-strong sm:w-64"
                      />
                    </div>

                    {/* 2. Category-Specific Adaptive Inline Form */}
                    <div className="p-4 sm:p-5 bg-surface-secondary border border-border space-y-4">
                      {/* Category: Notes */}
                      {selectedCatId === 'notes' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <FolderPlus className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              Google Drive Notes & PYQs
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">
                                Subject
                              </label>
                              <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-border-strong cursor-pointer"
                              >
                                {SUBJECT_OPTIONS.map((sub) => (
                                  <option key={sub.code} value={sub.code}>
                                    {sub.code} — {sub.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">
                                Resource Type
                              </label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { id: 'unit', label: 'Unit Notes' },
                                  { id: 'folder', label: 'Drive Folder' },
                                  { id: 'pyq', label: 'PYQ Paper' }
                                ].map((type) => (
                                  <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setNoteResourceType(type.id as any)}
                                    className={`py-1.5 px-2 text-[11px] font-medium transition-colors text-center cursor-pointer border ${
                                      noteResourceType === type.id
                                        ? 'bg-selected-bg text-selected-text font-bold border-selected-border shadow-xs'
                                        : 'bg-surface text-secondary hover:text-foreground border-border hover:bg-hover-bg'
                                    }`}
                                  >
                                    {type.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">
                              Google Drive Link (Sharing: "Anyone with the link can view")
                            </label>
                            <input
                              type="url"
                              value={driveLink}
                              onChange={(e) => setDriveLink(e.target.value)}
                              placeholder="https://drive.google.com/file/d/your-lecture-notes..."
                              className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground font-mono text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-medium text-secondary block mb-1">
                                Title / Unit Name
                              </label>
                              <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="e.g. Unit 2 Differential Calculus Notes & Problem Set"
                                className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">
                                {noteResourceType === 'pyq' ? 'Exam Year / Type' : 'Unit Number'}
                              </label>
                              {noteResourceType === 'pyq' ? (
                                <input
                                  type="text"
                                  value={pyqYear}
                                  onChange={(e) => setPyqYear(e.target.value)}
                                  placeholder="e.g. 2025 Mid-Sem"
                                  className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground text-xs"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={unitNumber}
                                  onChange={(e) => setUnitNumber(e.target.value)}
                                  placeholder="e.g. 1"
                                  className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground text-xs font-mono"
                                />
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">
                              Topics Covered or Notes
                            </label>
                            <input
                              type="text"
                              value={noteDescription}
                              onChange={(e) => setNoteDescription(e.target.value)}
                              placeholder="e.g. Rolle's Theorem, Cauchy MVT, Taylor Series derivations"
                              className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Category: Timetable */}
                      {selectedCatId === 'timetable' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                            <Calendar className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              Timetable & Schedule Change Proposal
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Day</label>
                              <select
                                value={timetableDay}
                                onChange={(e) => setTimetableDay(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Period Slot</label>
                              <select
                                value={timetableSlot}
                                onChange={(e) => setTimetableSlot(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer font-mono"
                              >
                                <option value="1">Slot 1 (8:30 – 9:30)</option>
                                <option value="2">Slot 2 (9:30 – 10:30)</option>
                                <option value="3">Slot 3 (10:30 – 11:30)</option>
                                <option value="4">Slot 4 (11:30 – 12:30)</option>
                                <option value="6">Slot 6 (1:30 – 2:30)</option>
                                <option value="7">Slot 7 (2:30 – 3:30)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Batch</label>
                              <select
                                value={timetableBatch}
                                onChange={(e) => setTimetableBatch(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                <option value="Both">Both Batches (V1 & V2)</option>
                                <option value="V1">Section V1 Only</option>
                                <option value="V2">Section V2 Only</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Lecture Type</label>
                              <select
                                value={timetableType}
                                onChange={(e) => setTimetableType(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                <option value="Theory">Theory Lecture</option>
                                <option value="Lab">Practical Lab</option>
                                <option value="Tutorial">Tutorial Session</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Subject Code</label>
                              <input
                                type="text"
                                value={timetableSubjectCode}
                                onChange={(e) => setTimetableSubjectCode(e.target.value)}
                                placeholder="e.g. PPS"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs font-mono focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-medium text-secondary block mb-1">Subject Name</label>
                              <input
                                type="text"
                                value={timetableSubjectName}
                                onChange={(e) => setTimetableSubjectName(e.target.value)}
                                placeholder="e.g. Programming for Problem Solving"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Room</label>
                              <input
                                type="text"
                                value={timetableRoom}
                                onChange={(e) => setTimetableRoom(e.target.value)}
                                placeholder="e.g. CS-Lab-4"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs font-mono focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Faculty Name / Initials</label>
                              <input
                                type="text"
                                value={timetableFaculty}
                                onChange={(e) => setTimetableFaculty(e.target.value)}
                                placeholder="e.g. Prof. GS (Girish Sharma)"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Reason / Description</label>
                              <input
                                type="text"
                                value={timetableNote}
                                onChange={(e) => setTimetableNote(e.target.value)}
                                placeholder="e.g. Permanent room relocation by department"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category: Faculty */}
                      {selectedCatId === 'faculty' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                            <Users className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              Faculty Directory & Cabin Updates
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Professor Full Name</label>
                              <input
                                type="text"
                                value={facultyName}
                                onChange={(e) => setFacultyName(e.target.value)}
                                placeholder="e.g. Dr. A. K. Verma (AKV)"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Designation</label>
                              <input
                                type="text"
                                value={facultyDesignation}
                                onChange={(e) => setFacultyDesignation(e.target.value)}
                                placeholder="e.g. Associate Professor & HOD"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Department</label>
                              <input
                                type="text"
                                value={facultyDepartment}
                                onChange={(e) => setFacultyDepartment(e.target.value)}
                                placeholder="e.g. Computer Science & Engg."
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Cabin Location</label>
                              <input
                                type="text"
                                value={facultyCabin}
                                onChange={(e) => setFacultyCabin(e.target.value)}
                                placeholder="e.g. CS Block Room 304"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Email Address</label>
                              <input
                                type="email"
                                value={facultyEmail}
                                onChange={(e) => setFacultyEmail(e.target.value)}
                                placeholder="e.g. ak.verma@college.edu"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs font-mono focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">Office / Consultation Hours</label>
                            <input
                              type="text"
                              value={facultyOfficeHours}
                              onChange={(e) => setFacultyOfficeHours(e.target.value)}
                              placeholder="e.g. Mon, Wed, Fri: 02:00 PM – 03:30 PM"
                              className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                            />
                          </div>
                        </div>
                      )}

                      {/* Category: Announcements */}
                      {selectedCatId === 'announcements' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                            <Bell className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              Class Announcement or Circular
                            </span>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">Notice Title</label>
                            <input
                              type="text"
                              value={announcementTitle}
                              onChange={(e) => setAnnouncementTitle(e.target.value)}
                              placeholder="e.g. Mid-Term Examination Venue Allocations Released"
                              className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Category</label>
                              <select
                                value={announcementCategory}
                                onChange={(e) => setAnnouncementCategory(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                {['Academic', 'Exam', 'Placement', 'Event', 'Circular', 'General'].map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Priority</label>
                              <select
                                value={announcementPriority}
                                onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Issuing Authority</label>
                              <input
                                type="text"
                                value={announcementAuthority}
                                onChange={(e) => setAnnouncementAuthority(e.target.value)}
                                placeholder="e.g. Academic Cell & CR"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">Notice Summary & Instructions</label>
                            <textarea
                              rows={3}
                              value={announcementSummary}
                              onChange={(e) => setAnnouncementSummary(e.target.value)}
                              placeholder="Provide the key information, deadlines, and requirements..."
                              className="w-full px-3.5 py-2 bg-surface border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-foreground text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      {/* Category: Links */}
                      {selectedCatId === 'links' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                            <Link2 className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground text-xs sm:text-sm">
                              Campus Portal or Community Link
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Portal Name</label>
                              <input
                                type="text"
                                value={linkTitle}
                                onChange={(e) => setLinkTitle(e.target.value)}
                                placeholder="e.g. Campus Wi-Fi Authentication"
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-secondary block mb-1">Link Type</label>
                              <select
                                value={linkType}
                                onChange={(e) => setLinkType(e.target.value as any)}
                                className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground cursor-pointer"
                              >
                                <option value="Portal">Campus Portal</option>
                                <option value="Community">Community / WhatsApp</option>
                                <option value="Academic">Academic Resource</option>
                                <option value="Document">Official Document</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">Destination URL</label>
                            <input
                              type="url"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="https://wifi.college.edu or https://chat.whatsapp.com/..."
                              className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs font-mono focus:outline-none focus:border-foreground"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-secondary block mb-1">Description</label>
                            <input
                              type="text"
                              value={linkDescription}
                              onChange={(e) => setLinkDescription(e.target.value)}
                              placeholder="e.g. Captive login page for college high-speed campus WiFi"
                              className="w-full px-3 py-2 bg-surface border border-border-subtle text-foreground text-xs focus:outline-none focus:border-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Live Systematic Formatted Preview */}
                    <div className="border border-border-subtle bg-surface p-3.5 sm:p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5 font-mono">
                          <FileCode className="w-3.5 h-3.5 text-muted" />
                          Live Content Patch Preview ({targetFile})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowTemplate(!showTemplate)}
                            className="text-[11px] text-secondary hover:text-foreground underline cursor-pointer"
                          >
                            {showTemplate ? 'Show My Changes' : 'Show File Template'}
                          </button>
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 px-2.5 py-1 bg-surface-elevated border border-border-subtle text-secondary hover:text-foreground text-[11px] cursor-pointer"
                          >
                            {copied ? <Check className="w-3 h-3 text-foreground" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
                          </button>
                        </div>
                      </div>

                      <pre className="p-3 bg-surface-elevated border border-border-subtle text-foreground font-mono text-[11px] sm:text-[11.5px] overflow-x-auto whitespace-pre leading-relaxed max-h-36">
                        {showTemplate ? TEMPLATE_PREVIEWS[selectedCatId] : snippetText}
                      </pre>
                    </div>

                    {/* Error Display if any */}
                    {submissionError && (
                      <div className="p-3 bg-surface-elevated border border-border-strong text-xs flex items-start gap-2 text-foreground">
                        <AlertCircle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Submission Error:</span> {submissionError}
                        </div>
                      </div>
                    )}

                    {/* Bottom Info Note */}
                    <div className="pt-1 text-[11px] text-muted">
                      <span>Submitted changes are committed to a temporary branch and opened as a PR for review.</span>
                    </div>
                  </>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3 sm:px-7 sm:py-3.5 border-t border-border-subtle bg-surface shrink-0 space-y-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {submissionError && (
                  <div className="p-2.5 bg-surface-elevated border border-border-strong text-xs flex items-center justify-between gap-2 text-foreground">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 text-muted shrink-0" />
                      <span className="truncate">
                        <strong className="font-semibold">Submission Error:</strong> {submissionError}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmissionError(null)}
                      className="text-secondary hover:text-foreground text-[11px] shrink-0 cursor-pointer underline underline-offset-2 ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-secondary">
                  {/* Left: GitHub Repository & PR Links */}
                  <div className="flex items-center gap-3">
                    <a
                      href="https://github.com/Geetansh-Jangid/Section-V"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Repo</span>
                    </a>
                    <span className="text-border-strong">·</span>
                    <a
                      href="https://github.com/Geetansh-Jangid/Section-V/pulls"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      Review PRs
                    </a>
                    <span className="text-border-strong hidden sm:inline">·</span>
                    <a
                      href={fallbackIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors hidden sm:inline"
                    >
                      Manual Issue
                    </a>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-surface-elevated border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer text-xs font-medium"
                    >
                      Close
                    </button>

                    {!submitResult && (
                      <button
                        type="button"
                        onClick={handleSubmitContribution}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm select-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Opening PR...</span>
                          </>
                        ) : (
                          <>
                            <GitPullRequest className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Submit Contribution</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
