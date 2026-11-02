import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  GitPullRequest,
  FolderArchive,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles
} from 'lucide-react';
import notesDataRaw from '../../data/notes.json';
import { SubjectNote } from '../../lib/schemas.ts';

const notesCatalog = notesDataRaw as SubjectNote[];

interface NotesPageProps {
  onOpenContributeModal: () => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ onOpenContributeModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => notesCatalog[0]?.id || 'sub-m');
  const [expandedUnit, setExpandedUnit] = useState<number | null>(1);

  const activeSubject = notesCatalog.find((n) => n.id === selectedSubjectId) || notesCatalog[0];

  const filteredCatalog = notesCatalog.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchName = s.subjectName.toLowerCase().includes(term) || s.subjectCode.toLowerCase().includes(term);
    const matchTopic = s.units.some((u) => u.topics.some((t) => t.toLowerCase().includes(term)));
    return matchName || matchTopic;
  });

  return (
    <div className="space-y-6">
      {/* Page Heading Outside Container */}
      <h1 className="text-2xl sm:text-[26px] font-semibold text-foreground tracking-tight">
        Notes & Syllabus
      </h1>

      {/* Subject Dropdown & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Subject Dropdown */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="subject-select" className="text-[13px] text-secondary font-medium shrink-0">
            Subject:
          </label>
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <select
              id="subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full appearance-none px-3.5 py-2 pr-9 rounded-lg bg-surface border border-border-subtle text-[13.5px] font-medium text-foreground hover:border-border focus:outline-none focus:border-border-strong cursor-pointer transition-colors"
            >
              {notesCatalog.map((subj) => (
                <option key={subj.id} value={subj.id} className="bg-surface text-foreground py-1">
                  {subj.subjectCode} — {subj.subjectName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics or subjects..."
            value={searchTerm}
            onChange={(e) => {
              const term = e.target.value;
              setSearchTerm(term);
              if (term) {
                const match = notesCatalog.find((s) => {
                  const t = term.toLowerCase();
                  return s.subjectName.toLowerCase().includes(t) || 
                         s.subjectCode.toLowerCase().includes(t) || 
                         s.units.some(u => u.topics.some(tp => tp.toLowerCase().includes(t)));
                });
                if (match) setSelectedSubjectId(match.id);
              }
            }}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-surface border border-border-subtle text-[13.5px] text-foreground placeholder-muted focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
      </div>

      {/* Selected Subject Main View */}
      {activeSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Units & Topic Breakdown (Span 8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Subject Meta Card */}
            <div className="rounded-xl bg-surface border border-border-subtle p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[12px] font-mono font-semibold bg-surface-elevated border border-border-subtle text-foreground">
                      {activeSubject.subjectCode}
                    </span>
                    <span className="text-[13px] text-muted">{activeSubject.credits} Credits · Semester 1</span>
                    {activeSubject.contentFile && (
                      <a
                        href={`https://github.com/Geetansh-Jangid/Section-V/blob/main/${activeSubject.contentFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-mono text-muted hover:text-foreground transition-colors"
                        title="View source plain text content file"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{activeSubject.contentFile}</span>
                      </a>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mt-2">{activeSubject.subjectName}</h3>
                  <p className="text-[14px] text-secondary mt-0.5">Faculty: {activeSubject.faculty}</p>
                </div>

                {activeSubject.driveUrl && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={activeSubject.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-[13.5px] font-medium text-foreground transition-colors group"
                      title="Open Google Drive folder for this subject"
                    >
                      <FolderArchive className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span>Drive Folder</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-colors" />
                    </a>
                  </div>
                )}
              </div>

              {((activeSubject.tags && activeSubject.tags.length > 0) || activeSubject.lastUpdated) && (
                <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-divider-subtle">
                  <div className="flex flex-wrap gap-1.5">
                    {activeSubject.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[12px] font-mono text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {activeSubject.lastUpdated && (
                    <span className="text-[12px] font-mono text-muted">
                      Updated: {activeSubject.lastUpdated}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Units Accordion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] uppercase font-medium text-secondary tracking-wider">
                  Syllabus Units & Topics Covered
                </h4>
                <span className="text-[12px] text-muted">
                  {activeSubject.units.length} Units Available
                </span>
              </div>

              {activeSubject.units.map((unit) => {
                const isExpanded = expandedUnit === unit.unitNumber;
                const hasTopics = Boolean(unit.topics && unit.topics.length > 0);
                const hasUnitResources = Boolean(unit.slidesUrl || unit.notesUrl || unit.notebookLmUrl);

                return (
                  <div
                    key={unit.unitNumber}
                    className="rounded-lg bg-surface border border-border-subtle overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedUnit(isExpanded ? null : unit.unitNumber)}
                      className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-surface-elevated/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded bg-surface-elevated border border-border-subtle text-foreground font-mono text-xs font-semibold flex items-center justify-center">
                          U{unit.unitNumber}
                        </span>
                        <span className="text-[15px] font-medium text-foreground">{unit.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-surface border-t border-divider-subtle space-y-4">
                        {hasTopics && (
                          <div>
                            <span className="text-[12px] font-medium text-muted uppercase tracking-wider block mb-2.5">
                              Core Topics Covered
                            </span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                              {unit.topics.map((t, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-[13.5px] text-secondary leading-relaxed"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted/60 shrink-0 mt-2" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {hasUnitResources && (
                          <div className={`flex flex-wrap items-center justify-between gap-2.5 ${hasTopics ? 'pt-3' : ''}`}>
                            <span className="text-[12px] text-muted font-mono">
                              Unit Resources
                            </span>
                            <div className="flex items-center gap-2">
                              {unit.slidesUrl && (
                                <a
                                  href={unit.slidesUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[13px] text-secondary hover:text-foreground font-medium px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-hover border border-border-subtle transition-colors"
                                >
                                  <FolderArchive className="w-3.5 h-3.5 text-muted" />
                                  <span>Drive Link</span>
                                  <ExternalLink className="w-3 h-3 text-muted" />
                                </a>
                              )}
                              {unit.notesUrl && (
                                <a
                                  href={unit.notesUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[13px] text-secondary hover:text-foreground font-medium px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-hover border border-border-subtle transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                  <span>Notes</span>
                                  <ExternalLink className="w-3 h-3 text-muted" />
                                </a>
                              )}
                              {unit.notebookLmUrl && (
                                <a
                                  href={unit.notebookLmUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[13px] text-secondary hover:text-foreground font-medium px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-hover border border-border-subtle transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                  <span>NotebookLM</span>
                                  <ExternalLink className="w-3 h-3 text-muted" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {!hasTopics && !hasUnitResources && (
                          <p className="text-[13px] text-muted">No syllabus topics or resources uploaded yet for this unit.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: PYQs (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl bg-surface border border-border-subtle p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] uppercase font-medium text-secondary tracking-wider">
                  Previous Exam Papers (PYQs)
                </h4>
                <span className="text-[12px] text-muted font-mono">Archive</span>
              </div>

              <div className="space-y-1">
                {activeSubject.pyqs && activeSubject.pyqs.length > 0 ? (
                  activeSubject.pyqs.map((pyq, idx) => (
                    pyq.url ? (
                      <a
                        key={idx}
                        href={pyq.url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-2 flex items-center justify-between hover:bg-surface-elevated/40 rounded-lg transition-colors group"
                        title="Open paper on Google Drive"
                      >
                        <div>
                          <div className="text-[14px] font-medium text-foreground transition-colors group-hover:text-foreground">
                            {pyq.year}
                          </div>
                          <div className="text-[12px] text-muted font-mono mt-0.5">
                            {pyq.examType}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                      </a>
                    ) : (
                      <div
                        key={idx}
                        className="py-2.5 px-2 flex items-center justify-between rounded-lg"
                      >
                        <div>
                          <div className="text-[14px] font-medium text-foreground">
                            {pyq.year}
                          </div>
                          <div className="text-[12px] text-muted font-mono mt-0.5">
                            {pyq.examType}
                          </div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <p className="text-[13px] text-muted py-3">No PYQs uploaded yet for this subject.</p>
                )}
              </div>

              {activeSubject.pyqDriveUrl && (
                <div className="mt-4 pt-3 border-t border-border-subtle/50">
                  <a
                    href={activeSubject.pyqDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-[13px] font-medium text-secondary hover:text-foreground transition-colors"
                  >
                    <span>Browse All Solved Papers</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted" />
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Contribute Box at End of Page */}
      <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <GitPullRequest className="w-4 h-4 text-muted" />
            <h3 className="text-[16px] font-semibold text-foreground">Contribute Academic Materials</h3>
          </div>
          <p className="text-[14px] text-secondary mt-1 max-w-2xl leading-relaxed">
            Have lecture slides, handwritten notes, NotebookLM study guides, or past papers? Share them with Section V.
          </p>
        </div>

        <button
          onClick={onOpenContributeModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-[13.5px] font-semibold hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-xs"
        >
          <FolderPlus className="w-4 h-4 text-background" />
          <span>Contribute Content</span>
        </button>
      </div>
    </div>
  );
};
