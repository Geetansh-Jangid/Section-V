import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  FileText, 
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
      {/* Header */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-300" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Subject Notes & Google Drive Links
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Centralized Google Drive folders, lecture slides, unit notes, and solved past-year question papers (PYQs) for Section V.
          </p>
        </div>

        <button
          onClick={onOpenContributeModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors self-start md:self-auto shadow-sm cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-black" />
          <span>Add Notes to Drive</span>
        </button>
      </div>

      {/* Subject Dropdown & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Subject Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="subject-select" className="text-xs text-neutral-400 font-medium shrink-0">
            Subject:
          </label>
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <select
              id="subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 pr-8 rounded-md bg-[#121212] border border-[#222222] text-xs font-medium text-white hover:border-[#333333] focus:outline-none focus:border-neutral-400 cursor-pointer transition-colors"
            >
              {notesCatalog.map((subj) => (
                <option key={subj.id} value={subj.id} className="bg-[#121212] text-white py-1">
                  {subj.subjectCode} — {subj.subjectName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
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
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#121212] border border-[#222222] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Selected Subject Main View */}
      {activeSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Units & Topic Breakdown (Span 8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Subject Meta Card */}
            <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white text-black">
                      {activeSubject.subjectCode}
                    </span>
                    <span className="text-xs text-neutral-400">{activeSubject.credits} Credits · Semester 1</span>
                    {activeSubject.contentFile && (
                      <a
                        href={`https://github.com/Geetansh-Jangid/Section-V/blob/main/${activeSubject.contentFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="View source plain text content file"
                      >
                        <FileCode className="w-3 h-3" />
                        <span>{activeSubject.contentFile}</span>
                      </a>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">{activeSubject.subjectName}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Faculty: {activeSubject.faculty}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={activeSubject.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141414] border border-[#262626] text-xs font-medium text-neutral-200 hover:text-white transition-colors"
                    title="Open Google Drive folder for this subject"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Drive Folder</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>

                  <button
                    onClick={onOpenContributeModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181818] border border-[#2a2a2a] text-xs font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer"
                    title="Add a new Google Drive link or lecture notes"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Add Notes</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {activeSubject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141414] border border-[#222222] text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Updated: {activeSubject.lastUpdated}
                </span>
              </div>
            </div>

            {/* Units Accordion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-medium text-neutral-400 tracking-wider">
                  Syllabus Units & Lecture Drive Handouts
                </h4>
                <span className="text-[11px] text-neutral-500">
                  {activeSubject.units.length} Units Available
                </span>
              </div>

              {activeSubject.units.map((unit) => {
                const isExpanded = expandedUnit === unit.unitNumber;
                return (
                  <div
                    key={unit.unitNumber}
                    className="rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedUnit(isExpanded ? null : unit.unitNumber)}
                      className="flex items-center justify-between p-3.5 cursor-pointer select-none bg-[#111111] hover:bg-[#161616] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-[#1c1c1c] border border-[#2c2c2c] text-neutral-200 font-mono text-xs font-bold flex items-center justify-center">
                          U{unit.unitNumber}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-white">{unit.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {unit.slidesUrl && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Drive Slides Available
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 bg-[#0a0a0a] border-t border-[#1a1a1a] space-y-3">
                        <div>
                          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1.5">
                            Core Topics Covered
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {unit.topics.map((t, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs text-neutral-300 p-1.5 rounded bg-[#111111] border border-[#1f1f1f]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 shrink-0" />
                                <span className="truncate">{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {unit.slidesUrl && (
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#161616]">
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Lecture slides & handouts hosted on Google Drive
                            </span>
                            <a
                              href={unit.slidesUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2.5 py-1 rounded bg-[#161616] border border-[#262626] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Slides in Drive</span>
                            </a>
                          </div>
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
            <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase font-medium text-neutral-400 tracking-wider">
                  Previous Exam Papers (PYQs)
                </h4>
                <span className="text-[11px] text-neutral-500 font-mono">Drive</span>
              </div>

              <div className="space-y-2">
                {activeSubject.pyqs && activeSubject.pyqs.length > 0 ? (
                  activeSubject.pyqs.map((pyq, idx) => (
                    <a
                      key={idx}
                      href={pyq.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-[#333333] hover:bg-[#161616] transition-colors group"
                      title="Open paper on Google Drive"
                    >
                      <div>
                        <div className="text-xs font-medium text-neutral-200 group-hover:text-white transition-colors">
                          {pyq.year}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {pyq.examType} · {pyq.fileSize}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 py-2">No PYQs uploaded yet for this subject.</p>
                )}
              </div>

              {activeSubject.pyqDriveUrl && (
                <div className="mt-4 pt-3 border-t border-[#1a1a1a]">
                  <a
                    href={activeSubject.pyqDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#141414] border border-[#262626] text-xs text-neutral-300 hover:text-white transition-colors"
                  >
                    <span>Browse All Solved Papers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Content File Source Info Card */}
            <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Plain Text (.txt) Data Source</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                This subject's data is maintained in <code className="text-neutral-200 font-mono bg-[#161616] px-1 py-0.5 rounded">{activeSubject.contentFile || 'content/notes/'}</code>. No JSON editing is needed!
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href={`https://github.com/Geetansh-Jangid/Section-V/blob/main/${activeSubject.contentFile || 'content/notes/'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  <span>View Source File</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={onOpenContributeModal}
                  className="text-[11px] text-neutral-300 hover:text-white cursor-pointer font-medium"
                >
                  Add Drive Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
