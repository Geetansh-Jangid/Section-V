import { CalendarEvent, TimetableData, ScheduleItem } from './schemas.ts';

export interface EffectiveScheduleResult {
  dayName: string;
  effectiveDayName: string;
  isHoliday: boolean;
  holidayEvent: CalendarEvent | null;
  isExam: boolean;
  examEvent: CalendarEvent | null;
  isSpecialWorkingDay: boolean;
  specialDayEvent: CalendarEvent | null;
  isSuspended: boolean;
  schedule: ScheduleItem[];
  notice: string | null;
}

/**
 * Checks whether a given target date (YYYY-MM-DD) falls within a date or date range.
 */
export function isDateInRange(targetDate: string, startDate: string, endDate?: string): boolean {
  if (!endDate) {
    return targetDate === startDate;
  }
  return targetDate >= startDate && targetDate <= endDate;
}

/**
 * Retrieves calendar events matching a specific date string and applicable batch.
 */
export function getEventsForDate(
  events: CalendarEvent[],
  dateStr: string,
  batch: 'All' | 'V1' | 'V2' = 'All'
): CalendarEvent[] {
  return events.filter((event) => {
    const dateMatches = isDateInRange(dateStr, event.date, event.endDate);
    if (!dateMatches) return false;

    // Batch applicability check
    if (batch === 'All') return true;
    return event.applicableBatch === 'All' || event.applicableBatch === batch;
  });
}

/**
 * Determines if a specific date is a holiday where regular lectures are suspended.
 */
export function isDateHoliday(
  events: CalendarEvent[],
  dateStr: string,
  batch: 'All' | 'V1' | 'V2' = 'All'
): boolean {
  const matched = getEventsForDate(events, dateStr, batch);
  // Special working days override holidays
  const hasSpecialWorkingDay = matched.some((e) => e.type === 'special_working_day');
  if (hasSpecialWorkingDay) return false;

  return matched.some(
    (e) => (e.type === 'public_holiday' || e.type === 'college_holiday') && e.isSuspended !== false
  );
}

/**
 * Formats a Date object to YYYY-MM-DD string in local time.
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the effective schedule for a given date and day, factoring in holidays,
 * special working days, exam days, and batch-specific timetable exceptions.
 */
export function getEffectiveDaySchedule(
  timetable: TimetableData,
  events: CalendarEvent[],
  dateOrDateStr: Date | string,
  dayName: string,
  batch: 'All' | 'V1' | 'V2' = 'All'
): EffectiveScheduleResult {
  const dateStr = typeof dateOrDateStr === 'string' ? dateOrDateStr : formatDateToYYYYMMDD(dateOrDateStr);
  const matchedEvents = getEventsForDate(events, dateStr, batch);

  // 1. Priority: Special Working Day (overrides holidays or regular weekend)
  const specialWorkingDay = matchedEvents.find((e) => e.type === 'special_working_day');
  if (specialWorkingDay) {
    const targetDay = specialWorkingDay.replacementDay || dayName;
    const rawSchedule = timetable.schedule[targetDay] || [];
    const schedule = rawSchedule.filter(
      (c) => batch === 'All' || !c.section || c.section === 'Both' || c.section === batch
    );

    return {
      dayName,
      effectiveDayName: targetDay,
      isHoliday: false,
      holidayEvent: null,
      isExam: false,
      examEvent: null,
      isSpecialWorkingDay: true,
      specialDayEvent: specialWorkingDay,
      isSuspended: false,
      schedule,
      notice: `Special Working Day: Following ${targetDay} Timetable (${specialWorkingDay.title})`
    };
  }

  // 2. Priority: Public or College Holiday (suppresses regular classes)
  const holiday = matchedEvents.find(
    (e) => (e.type === 'public_holiday' || e.type === 'college_holiday') && e.isSuspended !== false
  );
  if (holiday) {
    return {
      dayName,
      effectiveDayName: dayName,
      isHoliday: true,
      holidayEvent: holiday,
      isExam: false,
      examEvent: null,
      isSpecialWorkingDay: false,
      specialDayEvent: null,
      isSuspended: true,
      schedule: [],
      notice: `${holiday.type === 'public_holiday' ? 'Public Holiday' : 'College Holiday'}: ${holiday.title}`
    };
  }

  // 3. Priority: Examination period (regular classes suspended)
  const exam = matchedEvents.find((e) => e.type === 'exam' && e.isSuspended !== false);
  if (exam) {
    return {
      dayName,
      effectiveDayName: dayName,
      isHoliday: false,
      holidayEvent: null,
      isExam: true,
      examEvent: exam,
      isSpecialWorkingDay: false,
      specialDayEvent: null,
      isSuspended: true,
      schedule: [],
      notice: `Examination Period: ${exam.title}`
    };
  }

  // 4. Priority: Timetable Exception / Batch-specific event
  const timetableException = matchedEvents.find((e) => e.type === 'timetable_exception');
  let schedule = (timetable.schedule[dayName] || []).filter(
    (c) => batch === 'All' || !c.section || c.section === 'Both' || c.section === batch
  );

  if (timetableException?.specialSchedule && timetableException.specialSchedule.length > 0) {
    schedule = timetableException.specialSchedule.filter(
      (c) => batch === 'All' || !c.section || c.section === 'Both' || c.section === batch
    );
  }

  return {
    dayName,
    effectiveDayName: dayName,
    isHoliday: false,
    holidayEvent: null,
    isExam: false,
    examEvent: null,
    isSpecialWorkingDay: false,
    specialDayEvent: null,
    isSuspended: false,
    schedule,
    notice: timetableException ? `Schedule Exception: ${timetableException.title}` : null
  };
}
