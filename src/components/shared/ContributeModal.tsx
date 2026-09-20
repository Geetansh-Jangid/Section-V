import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitPullRequest, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import linksDataRaw from '../../data/links.json';
import { LinksConfig } from '../../lib/schemas.ts';

const linksData = linksDataRaw as LinksConfig;

interface ContributeModalProps {
  open: boolean;
  onClose: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({ open, onClose }) => {
  const [category, setCategory] = useState<'notes' | 'timetable' | 'announcement' | 'faculty'>('notes');
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

  const targetPath = {
    notes: 'content/notes/[subject].md',
    timetable: 'src/data/timetable.json',
    announcement: 'content/announcements/[slug].md',
    faculty: 'src/data/faculty.json'
  }[category];

  const generatedPrBody = `### Section V Update Request

#### 1. Type of Change
- [x] ${category.toUpperCase()} Update (${title || 'Proposed update'})

#### 2. Modified Files Checklist
- [x] Target file: \`${targetPath}\`
- [x] Adheres to Section V data schema validation
- [x] Verified by student author: ${authorName || 'Section V Student'}

#### 3. Brief Summary of Changes
${description || 'Updated notes and schedule details for Section V students.'}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="contribute-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            key="contribute-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            data-modal-card="true"
            className="w-full max-w-lg bg-[#0c0c0c] border border-[#262626] rounded-xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-white">Contribute via Pull Request</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Select Update Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['notes', 'timetable', 'announcement', 'faculty'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-2 rounded text-center capitalize transition-colors ${
                        category === cat
                          ? 'bg-white text-black font-semibold'
                          : 'bg-[#141414] border border-[#222222] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Target Git File Path</label>
                <div className="p-2 rounded bg-[#141414] border border-[#222222] font-mono text-[11px] text-neutral-300">
                  {targetPath}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Title / Subject</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3 PPS Linked List Handouts"
                  className="w-full px-3 py-1.5 rounded bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Author / Roll No.</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Yash Vardhan (Roll 24CSE042)"
                  className="w-full px-3 py-1.5 rounded bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Summary of Proposed Edits</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the notes, links, or schedule corrections..."
                  className="w-full px-3 py-1.5 rounded bg-[#141414] border border-[#222222] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div className="p-2.5 rounded bg-[#111111] border border-[#1f1f1f] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Pull Request Template Markdown</span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-white hover:underline font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy PR Body'}</span>
                  </button>
                </div>
                <pre className="text-[10px] text-neutral-500 font-mono overflow-x-auto max-h-20 whitespace-pre-wrap">
                  {generatedPrBody}
                </pre>
              </div>

              <div className="pt-2 border-t border-[#1f1f1f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded bg-[#141414] border border-[#222222] text-neutral-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <a
                  href={linksData.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Open GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
