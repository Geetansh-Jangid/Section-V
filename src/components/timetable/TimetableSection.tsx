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
    <section className="rounded-xl border border-border-subtle bg-surface p-6 space-y-6">
      {/* Top Controls: Section Filter & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle/50">
        {/* Section V1 / V2 / All Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-secondary">Batch:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-border-subtle">
            {(['All', 'V1', 'V2'] as SectionFilter[]).map((sec) => {
              const isSelected = selectedSectionFilter === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSectionFilter(sec)}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-surface text-foreground shadow-xs'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {sec === 'All' ? 'All (V1 & V2)' : `Section ${sec}`}
                </button>
              );
            })}
          </div>

          {/* View mode toggle: Interactive Day View vs Weekly Master Table */}
          {showMasterTableToggle && (
            <div className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-border-subtle">
              <button
                onClick={() => setViewMode('schedule')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${
                  viewMode === 'schedule'
                    ? 'bg-surface text-foreground font-semibold shadow-xs'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Day</span>
              </button>
              <button
                onClick={() => setViewMode('weekly_grid')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${
                  viewMode === 'weekly_grid'
                    ? 'bg-surface text-foreground font-semibold shadow-xs'
                    : 'text-secondary hover:text-foreground'
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
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] bg-surface-elevated text-secondary hover:text-foreground transition-colors cursor-pointer"
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
                  className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-surface-elevated text-foreground font-semibold shadow-xs'
                      : isSat
                      ? 'text-muted hover:text-secondary'
                      : 'text-secondary hover:text-foreground hover:bg-surface-elevated/50'
                  }`}
                >
                  {day}
                  {isSat && <span className="ml-1 text-[11px] text-muted">(Off)</span>}
                </button>
              );
            })}
          </div>

          {/* Saturday notice */}
          {selectedDay === 'Saturday' ? (
            <div className="py-14 px-4 text-center rounded-lg border border-border-subtle bg-surface-elevated/20">
              <Calendar className="w-8 h-8 text-muted mx-auto mb-2" />
              <div className="text-[16px] font-semibold text-foreground">Saturday & Sunday: Academic Recess</div>
              <div className="text-[13px] text-secondary mt-1 max-w-sm mx-auto">
                No formal lectures scheduled according to the official timetable. Labs and study halls remain accessible.
              </div>
            </div>
          ) : (
            /* Slots list with subtle horizontal separators */
            <div className="divide-y divide-border-subtle">
              {timeSlots.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 py-3 px-3 text-[12px] text-muted font-mono"
                    >
                      <span className="w-24 shrink-0">{slot.startTime} – {slot.endTime}</span>
                      <span className="text-[12px] tracking-wider uppercase text-muted">
                        Break · Recess
                      </span>
                    </div>
                  );
                }

                const allItemsInSlot = currentDaySchedule.filter((c) => c.slotId === slot.id);
                const filteredItems = getFilteredItemsForSlot(allItemsInSlot);

                return (
                  <div
                    key={slot.id}
                    className="py-3 px-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 hover:bg-surface-elevated/20 transition-colors"
                  >
                    {/* Time & Period (Clean, unboxed typography) */}
                    <div className="shrink-0 sm:w-28 pt-0.5">
                      <div className="font-mono text-[13.5px] font-semibold text-foreground">
                        {slot.startTime}
                      </div>
                      <div className="text-[11.5px] text-muted font-mono">
                        {slot.endTime} · P{slot.label}
                      </div>
                    </div>

                    {/* Classes in this slot */}
                    {filteredItems.length > 0 ? (
                      <div className="flex-1 space-y-2.5">
                        {filteredItems.map((item) => {
                          const override = slotOverrides[item.id];
                          const isCancelled = override?.isCancelled || item.isCancelled;
                          const faculty = override?.proxyFaculty || item.faculty;
                          const room = override?.roomChange || item.room;

                          return (
                            <div key={item.id} className="min-w-0">
                              {/* Subject title as primary visual element */}
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className={`text-[15.5px] font-semibold tracking-tight ${isCancelled ? 'line-through text-muted' : 'text-foreground'}`}>
                                  {item.subjectName}
                                </span>
                                <span className="text-[12px] font-mono text-muted">
                                  ({item.subjectCode})
                                </span>
                                {item.section && item.section !== 'Both' && (
                                  <span className="text-[11px] font-mono text-secondary">
                                    [{item.section}]
                                  </span>
                                )}
                                {isCancelled && (
                                  <span className="text-[11px] font-mono font-medium text-red-500 dark:text-red-400">
                                    · Cancelled
                                  </span>
                                )}
                                {override?.proxyFaculty && (
                                  <span className="text-[11px] font-mono font-medium text-blue-500 dark:text-blue-400">
                                    · Proxy
                                  </span>
                                )}
                              </div>

                              {/* Faculty and Room as secondary metadata */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[13px] text-secondary">
                                <span>{faculty}</span>
                                <span className="text-muted">·</span>
                                <span className="font-mono text-foreground">{room}</span>
                                <span className="text-muted">·</span>
                                <span className="text-muted text-[12px]">{item.type}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex-1 py-1 text-[13px] text-muted italic">
                        No scheduled class
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Weekly Grid View */
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
          <table className="w-full text-left text-xs border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-surface-elevated/70 border-b border-divider-subtle text-secondary">
                <th className="p-3 font-semibold text-center border-r border-divider-subtle w-24 text-[13px]">
                  Day
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle">
                  <div className="text-[13px] font-bold text-foreground font-mono">1</div>
                  <div className="text-[11px] text-muted font-mono">8:30 - 9:30</div>
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle">
                  <div className="text-[13px] font-bold text-foreground font-mono">2</div>
                  <div className="text-[11px] text-muted font-mono">9:30 - 10:30</div>
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle">
                  <div className="text-[13px] font-bold text-foreground font-mono">3</div>
                  <div className="text-[11px] text-muted font-mono">10:30 - 11:30</div>
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle">
                  <div className="text-[13px] font-bold text-foreground font-mono">4</div>
                  <div className="text-[11px] text-muted font-mono">11:30 - 12:30</div>
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle bg-surface-elevated/30 text-center w-20">
                  <div className="text-[12px] font-bold text-muted font-mono">5</div>
                  <div className="text-[10px] text-muted font-mono tracking-wider">RECESS</div>
                </th>
                <th className="p-2.5 font-medium border-r border-divider-subtle">
                  <div className="text-[13px] font-bold text-foreground font-mono">6</div>
                  <div className="text-[11px] text-muted font-mono">1:30 - 2:30</div>
                </th>
                <th className="p-2.5 font-medium">
                  <div className="text-[13px] font-bold text-foreground font-mono">7</div>
                  <div className="text-[11px] text-muted font-mono">2:30 - 3:30</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider-subtle">
              {days.map((day) => {
                const isSaturday = day === 'Saturday';
                const daySchedule = timetable.schedule[day] || [];

                if (isSaturday) {
                  return (
                    <tr key={day} className="bg-surface-elevated/20">
                      <td className="p-3 font-mono font-medium text-muted border-r border-divider-subtle text-center text-[13px]">
                        Sat
                      </td>
                      <td colSpan={7} className="p-3 text-center text-[12px] text-muted italic">
                        Weekend (No lectures scheduled)
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
                      <div className="h-full min-h-[50px] flex items-center justify-center text-[11px] text-muted font-mono">
                        —
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1.5 py-1">
                      {filtered.map(item => {
                        const override = slotOverrides[item.id];
                        const faculty = override?.proxyFaculty || item.faculty;
                        const room = override?.roomChange || item.room;
                        const isCancelled = override?.isCancelled || item.isCancelled;

                        return (
                          <div 
                            key={item.id} 
                            className={`p-1.5 rounded text-[12px] leading-tight ${
                              isCancelled 
                                ? 'opacity-60 line-through text-muted' 
                                : 'text-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-foreground font-mono text-[12.5px]">{item.subjectCode}</span>
                              {item.section && item.section !== 'Both' && (
                                <span className={`text-[10px] px-1 rounded font-mono font-medium ${
                                  item.section === 'V1' 
                                    ? 'text-foreground bg-surface-elevated' 
                                    : 'text-secondary bg-surface-secondary'
                                }`}>
                                  {item.section}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-secondary mt-0.5 truncate">
                              {override?.proxyFaculty ? (
                                <span className="text-blue-500 dark:text-blue-400 font-medium">Proxy: {faculty}</span>
                              ) : (
                                faculty
                              )} · <span className="font-mono text-muted">{room}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <tr key={day} className="bg-surface hover:bg-surface-elevated/30 transition-colors">
                    <td className="p-3 font-medium text-foreground border-r border-divider-subtle text-center font-mono text-[13px]">
                      {day.substring(0, 3)}
                    </td>
                    <td className="p-1.5 border-r border-divider-subtle align-top">{renderCell('slot-1')}</td>
                    <td className="p-1.5 border-r border-divider-subtle align-top">{renderCell('slot-2')}</td>
                    <td className="p-1.5 border-r border-divider-subtle align-top">{renderCell('slot-3')}</td>
                    <td className="p-1.5 border-r border-divider-subtle align-top">{renderCell('slot-4')}</td>
                    <td className="p-1.5 border-r border-divider-subtle bg-surface-elevated/20 text-center text-[10px] text-muted font-mono align-middle">
                      Recess
                    </td>
                    <td className="p-1.5 border-r border-divider-subtle align-top">{renderCell('slot-6')}</td>
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
            className="fixed inset-0 z-[70] modal-backdrop backdrop-blur-md"
            style={{ minHeight: '100dvh' }}
            onClick={() => setEditingItem(null)}
          >
            <div className="h-full overflow-y-auto overscroll-contain flex p-3 sm:p-4">
              <motion.div
                key="timetable-override-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                data-modal-card="true"
                className="w-full max-w-[calc(100dvw-1.5rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh] m-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 sm:p-7 pb-3.5 border-b border-border-subtle shrink-0">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Schedule Override: {editingItem.subjectCode}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mt-0.5">
                    Set proxy faculty or announce cancellation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 text-secondary hover:text-foreground rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOverride} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-secondary block mb-1.5 font-medium">Subject</label>
                  <div className="p-3 rounded-lg bg-surface-secondary border border-border-subtle text-foreground font-medium">
                    {editingItem.subjectName} ({editingItem.subjectCode})
                  </div>
                </div>

                <div>
                  <label className="text-secondary block mb-1.5 font-medium">Proxy Faculty</label>
                  <input
                    type="text"
                    value={proxyFacultyInput}
                    onChange={(e) => setProxyFacultyInput(e.target.value)}
                    placeholder={`Default: ${editingItem.faculty}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-accent text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-secondary block mb-1.5 font-medium">Room Change</label>
                  <input
                    type="text"
                    value={roomChangeInput}
                    onChange={(e) => setRoomChangeInput(e.target.value)}
                    placeholder={`Default: ${editingItem.room}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-subtle text-foreground placeholder:text-muted focus:outline-none focus:border-accent font-mono text-xs sm:text-sm"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="cancelled-checkbox"
                    checked={isCancelledInput}
                    onChange={(e) => setIsCancelledInput(e.target.checked)}
                    className="rounded bg-surface border-border-subtle text-foreground focus:ring-foreground w-4 h-4"
                  />
                  <label htmlFor="cancelled-checkbox" className="text-foreground font-medium cursor-pointer">
                    Mark this session as Cancelled
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 mt-4 border-t border-border-subtle shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-lg bg-surface-secondary border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer text-xs sm:text-sm mt-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition-opacity cursor-pointer text-xs sm:text-sm mt-3"
                  >
                    Save Override
                  </button>
                </div>
              </form>
              </motion.div>
            </div>
          </motion.div>,
          document.body
          )
        )}
      </AnimatePresence>
    </section>
  );
};
