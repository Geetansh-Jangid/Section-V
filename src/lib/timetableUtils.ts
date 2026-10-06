import { TimetableData, ScheduleItem, TimeSlot } from './schemas.ts';

export interface ActiveClassStatus {
  currentSlot: TimeSlot | null;
  currentClass: ScheduleItem | null;
  nextSlot: TimeSlot | null;
  nextClass: ScheduleItem | null;
  status: 'in_progress' | 'break' | 'no_class' | 'before_college' | 'after_college' | 'weekend';
  timeRemainingMinutes: number;
  timeUntilNextMinutes: number;
  progressPercent: number;
  day: string;
  formattedTime: string;
}

// Convert HH:MM string to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getActiveClassStatus(
  timetable: TimetableData,
  currentDayName: string,
  currentTimeHHMM: string,
  sectionFilter: 'All' | 'V1' | 'V2' = 'All'
): ActiveClassStatus {
  const currentMinutes = timeToMinutes(currentTimeHHMM);
  const rawDaySchedule = timetable.schedule[currentDayName] || [];
  const daySchedule = rawDaySchedule.filter(c => 
    sectionFilter === 'All' || !c.section || c.section === 'Both' || c.section === sectionFilter
  );
  const slots = timetable.timeSlots;

  if (!daySchedule.length || currentDayName === 'Sunday') {
    return {
      currentSlot: null,
      currentClass: null,
      nextSlot: null,
      nextClass: null,
      status: 'weekend',
      timeRemainingMinutes: 0,
      timeUntilNextMinutes: 0,
      progressPercent: 0,
      day: currentDayName,
      formattedTime: currentTimeHHMM
    };
  }

  const firstSlotMinutes = timeToMinutes(slots[0].startTime);
  const lastSlotMinutes = timeToMinutes(slots[slots.length - 1].endTime);

  // Helper to find next scheduled class starting from slot index
  const findNextClass = (fromSlotIndex: number) => {
    for (let i = Math.max(0, fromSlotIndex); i < slots.length; i++) {
      const slot = slots[i];
      const cls = daySchedule.find(c => c.slotId === slot.id);
      if (cls) {
        return { slot, cls };
      }
    }
    return { slot: null, cls: null };
  };

  if (currentMinutes < firstSlotMinutes) {
    const next = findNextClass(0);
    return {
      currentSlot: null,
      currentClass: null,
      nextSlot: next.slot,
      nextClass: next.cls,
      status: 'before_college',
      timeRemainingMinutes: 0,
      timeUntilNextMinutes: Math.max(0, firstSlotMinutes - currentMinutes),
      progressPercent: 0,
      day: currentDayName,
      formattedTime: currentTimeHHMM
    };
  }

  if (currentMinutes >= lastSlotMinutes) {
    return {
      currentSlot: null,
      currentClass: null,
      nextSlot: null,
      nextClass: null,
      status: 'after_college',
      timeRemainingMinutes: 0,
      timeUntilNextMinutes: 0,
      progressPercent: 100,
      day: currentDayName,
      formattedTime: currentTimeHHMM
    };
  }

  // Find active slot
  let activeSlot: TimeSlot | null = null;
  let activeSlotIndex = -1;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const startM = timeToMinutes(slot.startTime);
    const endM = timeToMinutes(slot.endTime);

    if (currentMinutes >= startM && currentMinutes < endM) {
      activeSlot = slot;
      activeSlotIndex = i;
      break;
    }
  }

  if (activeSlot) {
    const next = findNextClass(activeSlotIndex + 1);
    const startM = timeToMinutes(activeSlot.startTime);
    const endM = timeToMinutes(activeSlot.endTime);
    const totalSlotDuration = endM - startM;
    const elapsed = currentMinutes - startM;
    const remaining = endM - currentMinutes;
    const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalSlotDuration) * 100)));

    if (activeSlot.isBreak) {
      return {
        currentSlot: activeSlot,
        currentClass: null,
        nextSlot: next.slot,
        nextClass: next.cls,
        status: 'break',
        timeRemainingMinutes: remaining,
        timeUntilNextMinutes: remaining,
        progressPercent: progress,
        day: currentDayName,
        formattedTime: currentTimeHHMM
      };
    }

    const currentClass = daySchedule.find(c => c.slotId === activeSlot.id) || null;

    if (!currentClass) {
      return {
        currentSlot: activeSlot,
        currentClass: null,
        nextSlot: next.slot,
        nextClass: next.cls,
        status: 'no_class',
        timeRemainingMinutes: remaining,
        timeUntilNextMinutes: remaining,
        progressPercent: progress,
        day: currentDayName,
        formattedTime: currentTimeHHMM
      };
    }

    return {
      currentSlot: activeSlot,
      currentClass,
      nextSlot: next.slot,
      nextClass: next.cls,
      status: 'in_progress',
      timeRemainingMinutes: remaining,
      timeUntilNextMinutes: 0,
      progressPercent: progress,
      day: currentDayName,
      formattedTime: currentTimeHHMM
    };
  }

  // If between slots during day
  const next = findNextClass(0);

  return {
    currentSlot: null,
    currentClass: null,
    nextSlot: slots[0],
    nextClass: daySchedule[0] || null,
    status: 'after_college',
    timeRemainingMinutes: 0,
    timeUntilNextMinutes: 0,
    progressPercent: 100,
    day: currentDayName,
    formattedTime: currentTimeHHMM
  };
}
