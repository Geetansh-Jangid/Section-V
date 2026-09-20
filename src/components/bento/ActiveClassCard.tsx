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
    <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 flex flex-col justify-between hover:border-[#333333] transition-colors">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.status === 'in_progress' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
            <span className="text-xs font-medium text-neutral-400">
              {status.status === 'in_progress' ? 'Live Lecture' : status.status === 'break' ? 'Recess' : 'Current Status'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-[#141414] border border-[#222222]">
              {status.formattedTime} · {status.day.substring(0, 3)}
            </span>
          </div>
        </div>

        {/* Content based on status */}
        {status.status === 'in_progress' && status.currentClass && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white text-black">
                {status.currentClass.subjectCode}
              </span>
              {status.currentClass.section && status.currentClass.section !== 'Both' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#1a1a1a] border border-[#2a2a2a] text-neutral-300">
                  Section {status.currentClass.section}
                </span>
              )}
              {isCancelled && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950/80 border border-red-800 text-red-300">
                  Cancelled
                </span>
              )}
            </div>

            <div>
              <h3 className={`text-base sm:text-lg font-semibold tracking-tight ${isCancelled ? 'line-through text-neutral-500' : 'text-white'}`}>
                {status.currentClass.subjectName}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-2">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{displayFaculty}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono text-neutral-300">{displayRoom}</span>
                </span>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono mb-1">
                <span>{status.currentSlot?.startTime}</span>
                <span>{status.timeRemainingMinutes}m left</span>
                <span>{status.currentSlot?.endTime}</span>
              </div>
              <div className="w-full bg-[#161616] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${status.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {status.status === 'break' && (
          <div className="py-4 text-center space-y-1">
            <Clock className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-white">{status.currentSlot?.label || 'Recess'}</div>
            <div className="text-xs text-neutral-400">{status.timeRemainingMinutes} minutes until next lecture</div>
          </div>
        )}

        {(status.status === 'before_college' || status.status === 'after_college') && (
          <div className="py-3 space-y-1">
            <div className="text-xs text-neutral-400">
              {status.status === 'before_college' ? 'Classes begin at 8:30 AM' : 'Lectures completed for today'}
            </div>
            {status.nextClass ? (
              <div className="text-sm font-medium text-white">
                Upcoming: {status.nextClass.subjectName} ({status.nextClass.subjectCode}) at {status.nextSlot?.startTime}
              </div>
            ) : (
              <div className="text-sm font-medium text-neutral-300">
                No upcoming classes scheduled today
              </div>
            )}
          </div>
        )}

        {status.status === 'weekend' && (
          <div className="py-4 text-center space-y-1">
            <Calendar className="w-6 h-6 text-neutral-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-white">Weekend</div>
            <div className="text-xs text-neutral-400">No scheduled classes today</div>
          </div>
        )}
      </div>

      {/* Footer Next Up link */}
      {status.nextClass && status.status === 'in_progress' && (
        <div className="mt-4 pt-3 border-t border-[#1c1c1c] flex items-center justify-between text-xs text-neutral-400">
          <span className="text-[11px]">Next: {status.nextClass.subjectCode} ({status.nextSlot?.startTime})</span>
          <span className="font-mono text-[11px] text-neutral-400">{status.nextClass.room}</span>
        </div>
      )}
    </div>
  );
};
