import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  Calendar,
  BookOpen,
  Users,
  ShieldCheck,
  Clock,
  Home,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import facultyDataRaw from '../../data/faculty.json';
import notesDataRaw from '../../data/notes.json';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  onOpenContributeModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onNavigate
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div 
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm"
          style={{ minHeight: '100dvh' }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div 
            key="command-palette-content"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            data-modal-card="true"
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command 
              label="Command Menu"
              className="rounded-2xl bg-[#0c0c0c] border border-[#262626] shadow-2xl overflow-hidden text-neutral-200"
            >
          <div className="p-2.5 sm:p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-[#161616] border border-[#262626] px-3 sm:px-4 py-2.5 transition-colors focus-within:border-neutral-400">
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-neutral-500 shrink-0" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search sections, subjects, faculty cabins, or tabs…"
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center shrink-0 px-2 py-1 rounded-md text-[11px] font-mono font-medium text-neutral-500 bg-[#121212] border border-[#2a2a2a] leading-none">
                ESC
              </kbd>
            </div>
          </div>

          <Command.List className="max-h-80 sm:max-h-96 overflow-y-auto p-2 sm:p-2.5">
            <Command.Empty className="py-8 text-center text-xs sm:text-sm text-neutral-500">
              No matching results.
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1">
              <Command.Item
                onSelect={() => {
                  onNavigate('dashboard');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Home className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Overview & Timetable</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('timetable');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Timetable (V1 & V2 Filters)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('todo');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Todo & Academic Works (V1 & V2)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('attendance');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>75% Attendance Calculator</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('notes');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Subject Notes & Google Drive Links</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('faculty');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>Faculty Directory & Class Representatives</span>
              </Command.Item>
            </Command.Group>

            {/* Subject Notes Group */}
            <Command.Group heading="Subjects" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1 mt-2">
              {notesDataRaw.map((note: any) => (
                <Command.Item
                  key={note.id}
                  onSelect={() => {
                    onNavigate('notes');
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-neutral-400">{note.subjectCode}</span>
                    <span>{note.subjectName}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">{note.faculty}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Faculty Cabins */}
            <Command.Group heading="Faculty Cabins" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1 mt-2">
              {facultyDataRaw.map((fac: any) => (
                <Command.Item
                  key={fac.id}
                  onSelect={() => {
                    onNavigate('faculty');
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
                >
                  <span>{fac.name}</span>
                  <span className="text-[11px] text-neutral-400 font-mono">{fac.cabin}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
