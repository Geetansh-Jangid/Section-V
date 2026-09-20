import { TimetableData, ScheduleItem, TimeSlot } from './schemas.ts';

export interface ActiveClassStatus {
  currentSlot: TimeSlot | null;
  currentClass: ScheduleItem | null;
  nextSlot: TimeSlot | null;
  nextClass: ScheduleItem | null;
  status: 'in_progress' | 'break' | 'before_college' | 'after_college' | 'weekend';
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

  if (currentMinutes < firstSlotMinutes) {
    const firstClassSlot = slots[0];
    const firstClass = daySchedule.find(c => c.slotId === firstClassSlot.id) || null;
    return {
      currentSlot: null,
      currentClass: null,
      nextSlot: firstClassSlot,
      nextClass: firstClass,
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

  let nextSlot: TimeSlot | null = null;
  let nextClass: ScheduleItem | null = null;

  if (activeSlotIndex >= 0 && activeSlotIndex + 1 < slots.length) {
    nextSlot = slots[activeSlotIndex + 1];
    nextClass = daySchedule.find(c => c.slotId === nextSlot?.id) || null;
  }

  if (activeSlot) {
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
        nextSlot,
        nextClass,
        status: 'break',
        timeRemainingMinutes: remaining,
        timeUntilNextMinutes: remaining,
        progressPercent: progress,
        day: currentDayName,
        formattedTime: currentTimeHHMM
      };
    }

    const currentClass = daySchedule.find(c => c.slotId === activeSlot.id) || null;

    return {
      currentSlot: activeSlot,
      currentClass,
      nextSlot,
      nextClass,
      status: 'in_progress',
      timeRemainingMinutes: remaining,
      timeUntilNextMinutes: 0,
      progressPercent: progress,
      day: currentDayName,
      formattedTime: currentTimeHHMM
    };
  }

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
