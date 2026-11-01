import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import timetableDataRaw from '../../data/timetable.json';
import { TimetableData } from '../../lib/schemas.ts';
import { getActiveClassStatus } from '../../lib/timetableUtils.ts';
import { useSectionVStore } from '../../lib/store.ts';

const timetable = timetableDataRaw as TimetableData;

export const ActiveClassCard: React.FC = () => {
  const { 
    selectedSectionFilter, 
    slotOverrides 
  } = useSectionVStore();
  const [currentRealTime, setCurrentRealTime] = useState<string>('09:15');
  const [currentDayName, setCurrentDayName] = useState<string>('Monday');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setCurrentDayName(days[now.getDay()]);
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentRealTime(`${hours}:${mins}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const status = getActiveClassStatus(timetable, currentDayName, currentRealTime, selectedSectionFilter);

  // Apply any active local overrides
  const currentSlotId = status.currentSlot?.id;
  const activeOverride = currentSlotId ? slotOverrides[currentSlotId] : null;

  const isCancelled = activeOverride?.isCancelled ?? status.currentClass?.isCancelled ?? false;
  const displayFaculty = activeOverride?.proxyFaculty || status.currentClass?.faculty;
  const displayRoom = activeOverride?.roomChange || status.currentClass?.room || timetable.defaultRoom;

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border transition-colors">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-muted'}`} />
            <span className={`text-[13px] font-medium tracking-wide uppercase ${
              status.status === 'in_progress' ? 'text-blue-500 dark:text-blue-400' : 'text-secondary'
            }`}>
              {status.status === 'in_progress' ? 'Live Lecture' : status.status === 'break' ? 'Recess' : 'Current Status'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-secondary">
              {status.formattedTime} · {status.day.substring(0, 3)}
            </span>
          </div>
        </div>

        {/* Content based on status */}
        {status.status === 'in_progress' && status.currentClass && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-surface-elevated text-foreground">
                {status.currentClass.subjectCode}
              </span>
              {status.currentClass.section && status.currentClass.section !== 'Both' && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                  status.currentClass.section === 'V1'
                    ? 'text-foreground bg-surface-elevated'
                    : 'text-secondary bg-surface-elevated'
                }`}>
                  Section {status.currentClass.section}
                </span>
              )}
              {isCancelled && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20">
                  Cancelled
                </span>
              )}
            </div>

            <div>
              <h3 className={`text-xl sm:text-2xl font-semibold tracking-tight ${isCancelled ? 'line-through text-muted' : 'text-foreground'}`}>
                {status.currentClass.subjectName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-[14px] text-secondary mt-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-muted" />
                  <span>{displayFaculty}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span className="font-mono text-foreground">{displayRoom}</span>
                </span>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-[12px] text-muted font-mono mb-1.5">
                <span>{status.currentSlot?.startTime}</span>
                <span className="text-secondary font-medium">{status.timeRemainingMinutes}m left</span>
                <span>{status.currentSlot?.endTime}</span>
              </div>
              <div className="w-full bg-surface-elevated h-1 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1 transition-all duration-500"
                  style={{ width: `${status.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {(status.status === 'break' || status.status === 'no_class') && (
          <div className="py-2 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <span className="text-[17px] font-semibold text-foreground">
                  {status.status === 'break' ? 'Recess / Lunch Break' : 'No Class Right Now'}
                </span>
              </div>
              <p className="text-[14px] text-secondary">
                {status.timeRemainingMinutes}m remaining in current slot · {status.currentSlot?.startTime} - {status.currentSlot?.endTime}
              </p>
            </div>

            {status.nextClass ? (
              <div className="pt-3 border-t border-divider-subtle space-y-2">
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">
                  Next Class
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[15px] font-medium text-foreground truncate">
                    {status.nextClass.subjectName}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-elevated text-secondary shrink-0">
                    {status.nextClass.subjectCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-secondary">
                  <span className="flex items-center gap-1 font-mono text-secondary">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                    <span>{status.nextSlot?.startTime}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-muted" />
                    <span className="text-foreground">{status.nextClass.room}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[14px] text-secondary">No further classes scheduled today.</div>
            )}
          </div>
        )}

        {(status.status === 'before_college' || status.status === 'after_college') && (
          <div className="py-2 space-y-4">
            <div className="text-[14px] text-secondary">
              {status.status === 'before_college' ? 'Classes begin at 8:30 AM · Still time for chai or extra snooze.' : "Lectures wrapped up · Well done on completing today's classes!"}
            </div>

            {status.nextClass ? (
              <div className="pt-3 border-t border-divider-subtle space-y-2">
                <div className="text-[12px] font-medium text-muted uppercase tracking-wider">
                  First Class Today
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[15px] font-medium text-foreground truncate">
                    {status.nextClass.subjectName}
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-elevated text-secondary shrink-0">
                    {status.nextClass.subjectCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-secondary">
                  <span className="flex items-center gap-1 font-mono text-secondary">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                    <span>{status.nextSlot?.startTime}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-muted" />
                    <span className="text-foreground">{status.nextClass.room}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[14px] font-medium text-foreground">
                No classes scheduled today.
              </div>
            )}
          </div>
        )}

        {status.status === 'weekend' && (
          <div className="py-6 text-center space-y-1">
            <Calendar className="w-7 h-7 text-muted mx-auto mb-2" />
            <div className="text-[16px] font-semibold text-foreground">Weekend Mode</div>
            <div className="text-[14px] text-secondary">No scheduled classes today · Time to recharge or catch up at your own pace.</div>
          </div>
        )}
      </div>

      {/* Footer Next Up link for in_progress status */}
      {status.nextClass && status.status === 'in_progress' && (
        <div className="mt-4 pt-3 border-t border-divider-subtle flex items-center justify-between text-[13px] text-secondary">
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="text-muted shrink-0">Next:</span>
            <span className="font-medium text-foreground truncate">{status.nextClass.subjectName}</span>
            <span className="font-mono text-muted shrink-0 text-xs">at {status.nextSlot?.startTime}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-secondary shrink-0">
            <MapPin className="w-3 h-3 text-muted" />
            <span>{status.nextClass.room}</span>
          </div>
        </div>
      )}
    </div>
  );
};
