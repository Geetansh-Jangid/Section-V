import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Clock, 
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div 
            key="command-palette-content"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            data-modal-card="true"
            className="w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command 
              label="Command Menu"
              className="rounded-xl bg-[#0c0c0c] border border-[#262626] shadow-2xl overflow-hidden text-neutral-200"
            >
          <div className="flex items-center gap-3 px-4 border-b border-[#1f1f1f]">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search sections, subjects, faculty cabins, or tabs..."
              className="w-full py-3.5 bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 bg-[#141414] border border-[#222222] rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-neutral-500">
              No matching results.
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1">
              <Command.Item
                onSelect={() => {
                  onNavigate('dashboard');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-neutral-400" />
                <span>Overview & Timetable</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('timetable');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Timetable (V1 & V2 Filters)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('attendance');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>75% Attendance Calculator</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('notes');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                <span>Subject Notes & Question Papers</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onNavigate('faculty');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-neutral-400" />
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
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400">{note.subjectCode}</span>
                    <span>{note.subjectName}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">{note.faculty}</span>
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
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer hover:bg-[#181818] hover:text-white transition-colors"
                >
                  <span>{fac.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{fac.cabin}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
