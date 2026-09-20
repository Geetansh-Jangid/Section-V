import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  RotateCcw, 
  Check,
  Table as TableIcon,
  ListFilter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import timetableDataRaw from '../../data/timetable.json';
import { TimetableData, ScheduleItem } from '../../lib/schemas.ts';
import { useSectionVStore, SectionFilter } from '../../lib/store.ts';

const timetable = timetableDataRaw as TimetableData;

interface TimetableSectionProps {
  initialDay?: string;
  showMasterTableToggle?: boolean;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({ 
  initialDay = 'Monday',
  showMasterTableToggle = true 
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    if (todayIndex >= 1 && todayIndex <= 6) {
      return days[todayIndex - 1];
    }
    return initialDay;
  });

  const [viewMode, setViewMode] = useState<'schedule' | 'weekly_grid'>('schedule');

  const { 
    selectedSectionFilter, 
    setSelectedSectionFilter, 
    slotOverrides, 
    setSlotOverride, 
    clearAllOverrides 
  } = useSectionVStore();

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [proxyFacultyInput, setProxyFacultyInput] = useState('');
  const [roomChangeInput, setRoomChangeInput] = useState('');
  const [isCancelledInput, setIsCancelledInput] = useState(false);

  const timeSlots = timetable.timeSlots;
  const currentDaySchedule = timetable.schedule[selectedDay] || [];

  // Filter schedule items based on V1 / V2 / All
  const getFilteredItemsForSlot = (items: ScheduleItem[]) => {
    return items.filter((item) => {
      if (selectedSectionFilter === 'All') return true;
      if (!item.section || item.section === 'Both') return true;
      return item.section === selectedSectionFilter;
    });
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingItem(null);
    };
    if (editingItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingItem]);

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSlotOverride(editingItem.id, {
      isCancelled: isCancelledInput,
      proxyFaculty: proxyFacultyInput.trim() || undefined,
      roomChange: roomChangeInput.trim() || undefined
    });

    setEditingItem(null);
  };

  const openOverrideModal = (item: ScheduleItem) => {
    const existing = slotOverrides[item.id];
    setEditingItem(item);
    setIsCancelledInput(existing?.isCancelled || false);
    setProxyFacultyInput(existing?.proxyFaculty || '');
    setRoomChangeInput(existing?.roomChange || '');
  };

  const hasAnyOverrides = Object.keys(slotOverrides).length > 0;

  return (
    <section className="rounded-xl border border-[#222222] bg-[#0a0a0a] p-5 sm:p-6 space-y-6">
      {/* Top Header & Section Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Class Timetable
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[#171717] border border-[#262626] text-neutral-300 font-mono">
              B.Tech AI & DS
            </span>
          </div>
        </div>

        {/* Section V1 / V2 / All Filter (Replacing Theory/Practical) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-[#121212] border border-[#222222]">
            {(['All', 'V1', 'V2'] as SectionFilter[]).map((sec) => {
              const isSelected = selectedSectionFilter === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSectionFilter(sec)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-white text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sec === 'All' ? 'All (V1 & V2)' : `Section ${sec}`}
                </button>
              );
            })}
          </div>

          {/* View mode toggle: Interactive Day View vs Weekly Master Table */}
          {showMasterTableToggle && (
            <div className="flex items-center p-1 rounded-lg bg-[#121212] border border-[#222222]">
              <button
                onClick={() => setViewMode('schedule')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
                  viewMode === 'schedule'
                    ? 'bg-[#222222] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Day</span>
              </button>
              <button
                onClick={() => setViewMode('weekly_grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
                  viewMode === 'weekly_grid'
                    ? 'bg-[#222222] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Week Table</span>
              </button>
            </div>
          )}

          {hasAnyOverrides && (
            <button
              onClick={clearAllOverrides}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-[#1a1a1a] border border-[#333333] text-neutral-300 hover:text-white"
              title="Reset all proxy changes"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Proxies</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'schedule' ? (
        <div className="space-y-4">
          {/* Day Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {days.map((day) => {
              const isSelected = selectedDay === day;
              const isSat = day === 'Saturday';
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-white text-black font-semibold'
                      : isSat
                      ? 'bg-[#0f0f0f] border border-[#1e1e1e] text-neutral-500 hover:text-neutral-300'
                      : 'bg-[#121212] border border-[#1e1e1e] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {day}
                  {isSat && <span className="ml-1 text-[10px] text-neutral-500">(Off)</span>}
                </button>
              );
            })}
          </div>

          {/* Saturday notice */}
          {selectedDay === 'Saturday' ? (
            <div className="py-12 px-4 text-center rounded-lg border border-[#1f1f1f] bg-[#0c0c0c]">
              <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-neutral-300">Saturday & Sunday: Academic Recess</div>
              <div className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No formal lectures scheduled according to the official timetable. Labs and study halls remain accessible.
              </div>
            </div>
          ) : (
            /* Slots list */
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between py-2 px-3.5 rounded-lg bg-[#0e0e0e] border border-dashed border-[#222222] text-xs text-neutral-400 font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{slot.startTime} – {slot.endTime}</span>
                      </div>
                      <span className="text-neutral-300 font-sans font-medium text-[11px] tracking-wide uppercase">
                        {slot.label} · Recess
                      </span>
                    </div>
                  );
                }

                const allItemsInSlot = currentDaySchedule.filter((c) => c.slotId === slot.id);
                const filteredItems = getFilteredItemsForSlot(allItemsInSlot);

                return (
                  <div
                    key={slot.id}
                    className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#2a2a2a] transition-colors"
                  >
                    {/* Time slot metadata */}
                    <div className="flex items-center gap-3 shrink-0 md:w-44">
                      <div className="w-16 text-center font-mono py-1 px-1.5 rounded bg-[#141414] border border-[#222222]">
                        <span className="block text-xs font-semibold text-neutral-200">{slot.startTime}</span>
                        <span className="block text-[10px] text-neutral-500">{slot.endTime}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-neutral-300 block">Period {slot.label}</span>
                        <span className="text-[10px] text-neutral-500">60 mins</span>
                      </div>
                    </div>

                    {/* Classes in this slot */}
                    {filteredItems.length > 0 ? (
                      <div className="flex-1 space-y-2">
                        {filteredItems.map((item) => {
                          const override = slotOverrides[item.id];
                          const isCancelled = override?.isCancelled || item.isCancelled;
                          const faculty = override?.proxyFaculty || item.faculty;
                          const room = override?.roomChange || item.room;

                          return (
                            <div
                              key={item.id}
                              className={`p-2.5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                isCancelled
                                  ? 'bg-red-950/20 border-red-900/40 text-neutral-400'
                                  : 'bg-[#121212] border-[#222222]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {/* Subject Code badge */}
                                  <span className="px-1.5 py-0.2 text-[11px] font-mono font-bold text-white bg-black border border-neutral-700 rounded">
                                    {item.subjectCode}
                                  </span>

                                  {/* Section badge */}
                                  <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded ${
                                    item.section === 'V1'
                                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                                      : item.section === 'V2'
                                      ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                                      : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                  }`}>
                                    {item.section ? `Section ${item.section}` : 'V1 & V2'}
                                  </span>

                                  <span className="px-1.5 py-0.2 text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
                                    {item.type}
                                  </span>

                                  {isCancelled && (
                                    <span className="px-1.5 py-0.2 text-[10px] font-medium text-red-300 bg-red-950/80 border border-red-800 rounded">
                                      Cancelled
                                    </span>
                                  )}

                                  {override?.proxyFaculty && (
                                    <span className="px-1.5 py-0.2 text-[10px] font-medium text-amber-300 bg-amber-950/80 border border-amber-800 rounded">
                                      Proxy Active
                                    </span>
                                  )}
                                </div>

                                <div className={`text-sm font-medium ${isCancelled ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
                                  {item.subjectName}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-400">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-neutral-500" />
                                    <span>Faculty: <strong className="font-medium text-neutral-300">{faculty}</strong></span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-neutral-500" />
                                    <span>Room: <strong className="font-mono text-neutral-300">{room}</strong></span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 py-2 text-xs text-neutral-500 italic">
                        No scheduled class for {selectedSectionFilter === 'All' ? 'Section V' : `Section ${selectedSectionFilter}`} in this slot.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Weekly Grid View (matching image.png) */
        <div className="overflow-x-auto rounded-lg border border-[#1f1f1f]">
          <table className="w-full text-left text-xs border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222] text-neutral-300">
                <th className="p-2.5 font-semibold text-center border-r border-[#222222] w-24">
                  Day / Period
                </th>
                <th className="p-2 font-medium border-r border-[#222222]">
                  <div className="text-[11px] font-bold text-neutral-200">1</div>
                  <div className="text-[10px] text-neutral-400 font-mono">8:30 - 9:30</div>
                </th>
                <th className="p-2 font-medium border-r border-[#222222]">
                  <div className="text-[11px] font-bold text-neutral-200">2</div>
                  <div className="text-[10px] text-neutral-400 font-mono">9:30 - 10:30</div>
                </th>
                <th className="p-2 font-medium border-r border-[#222222]">
                  <div className="text-[11px] font-bold text-neutral-200">3</div>
                  <div className="text-[10px] text-neutral-400 font-mono">10:30 - 11:30</div>
                </th>
                <th className="p-2 font-medium border-r border-[#222222]">
                  <div className="text-[11px] font-bold text-neutral-200">4</div>
                  <div className="text-[10px] text-neutral-400 font-mono">11:30 - 12:30</div>
                </th>
                <th className="p-2 font-medium border-r border-[#222222] bg-[#0a0a0a] text-center w-20">
                  <div className="text-[11px] font-bold text-neutral-400">5</div>
                  <div className="text-[10px] text-neutral-500 font-mono">BREAK</div>
                </th>
                <th className="p-2 font-medium border-r border-[#222222]">
                  <div className="text-[11px] font-bold text-neutral-200">6</div>
                  <div className="text-[10px] text-neutral-400 font-mono">1:30 - 2:30</div>
                </th>
                <th className="p-2 font-medium">
                  <div className="text-[11px] font-bold text-neutral-200">7</div>
                  <div className="text-[10px] text-neutral-400 font-mono">2:30 - 3:30</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {days.map((day) => {
                const isSaturday = day === 'Saturday';
                const daySchedule = timetable.schedule[day] || [];

                if (isSaturday) {
                  return (
                    <tr key={day} className="bg-[#0a0a0a]/50">
                      <td className="p-2.5 font-medium text-neutral-500 border-r border-[#1f1f1f] text-center">
                        Sat
                      </td>
                      <td colSpan={7} className="p-3 text-center text-xs text-neutral-600 italic">
                        Weekend / Recess (No lectures scheduled)
                      </td>
                    </tr>
                  );
                }

                // Helper to render cell content for each slot
                const renderCell = (slotId: string) => {
                  const itemsInSlot = daySchedule.filter(item => item.slotId === slotId);
                  const filtered = getFilteredItemsForSlot(itemsInSlot);

                  if (!filtered.length) {
                    return (
                      <div className="h-full min-h-[50px] flex items-center justify-center text-[11px] text-neutral-600">
                        —
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1 py-1">
                      {filtered.map(item => {
                        const override = slotOverrides[item.id];
                        const faculty = override?.proxyFaculty || item.faculty;
                        const room = override?.roomChange || item.room;
                        const isCancelled = override?.isCancelled || item.isCancelled;

                        return (
                          <div 
                            key={item.id} 
                            className={`p-1.5 rounded text-[11px] border leading-tight ${
                              isCancelled 
                                ? 'bg-red-950/30 border-red-900/40 text-neutral-500 line-through'
                                : 'bg-[#141414] border-[#262626] text-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-white font-mono">{item.subjectCode}</span>
                              {item.section && item.section !== 'Both' && (
                                <span className={`text-[9px] px-1 rounded font-medium ${
                                  item.section === 'V1' 
                                    ? 'bg-blue-900/40 text-blue-300' 
                                    : 'bg-purple-900/40 text-purple-300'
                                }`}>
                                  {item.section}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              {faculty} · <span className="font-mono text-neutral-300">{room}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <tr key={day} className="hover:bg-[#0f0f0f] transition-colors">
                    <td className="p-2.5 font-medium text-neutral-200 border-r border-[#1f1f1f] text-center font-mono">
                      {day.substring(0, 3)}
                    </td>
                    <td className="p-1.5 border-r border-[#1f1f1f] align-top">{renderCell('slot-1')}</td>
                    <td className="p-1.5 border-r border-[#1f1f1f] align-top">{renderCell('slot-2')}</td>
                    <td className="p-1.5 border-r border-[#1f1f1f] align-top">{renderCell('slot-3')}</td>
                    <td className="p-1.5 border-r border-[#1f1f1f] align-top">{renderCell('slot-4')}</td>
                    <td className="p-1.5 border-r border-[#1f1f1f] bg-[#070707] text-center text-[10px] text-neutral-600 font-mono align-middle">
                      Recess
                    </td>
                    <td className="p-1.5 border-r border-[#1f1f1f] align-top">{renderCell('slot-6')}</td>
                    <td className="p-1.5 align-top">{renderCell('slot-7')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Override / Proxy Modal */}
      <AnimatePresence>
        {editingItem && (
          createPortal(
          <motion.div
            key="timetable-override-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            style={{ minHeight: '100dvh' }}
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              key="timetable-override-content"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#0f0f0f] border border-[#262626] rounded-2xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Schedule Override: {editingItem.subjectCode}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    Set proxy faculty or announce cancellation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOverride} className="space-y-4 pt-4 text-xs sm:text-sm">
                <div>
                  <label className="text-neutral-300 block mb-1.5 font-medium">Subject</label>
                  <div className="p-3 rounded-lg bg-[#161616] border border-[#262626] text-neutral-200 font-medium">
                    {editingItem.subjectName} ({editingItem.subjectCode})
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-medium">Proxy Faculty</label>
                  <input
                    type="text"
                    value={proxyFacultyInput}
                    onChange={(e) => setProxyFacultyInput(e.target.value)}
                    placeholder={`Default: ${editingItem.faculty}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1.5 font-medium">Room Change</label>
                  <input
                    type="text"
                    value={roomChangeInput}
                    onChange={(e) => setRoomChangeInput(e.target.value)}
                    placeholder={`Default: ${editingItem.room}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 font-mono text-xs sm:text-sm"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="cancelled-checkbox"
                    checked={isCancelledInput}
                    onChange={(e) => setIsCancelledInput(e.target.checked)}
                    className="rounded bg-[#161616] border-[#333333] text-white w-4 h-4"
                  />
                  <label htmlFor="cancelled-checkbox" className="text-neutral-200 font-medium cursor-pointer">
                    Mark this session as Cancelled
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#222222]">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-lg bg-[#161616] border border-[#262626] text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    Save Override
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>,
          document.body
          )
        )}
      </AnimatePresence>
    </section>
  );
};
