import { z } from 'zod';

// Preprocessing helper: treats null, undefined, empty strings and whitespace-only strings as undefined
export const emptyStringToUndefined = (val: unknown): unknown => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return val;
};

// Reusable schema for optional URL fields that gracefully handles blank/whitespace strings
export const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional()
);

// Time format regex (HH:MM in 24-hour format)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const TimeSlotSchema = z.object({
  id: z.string(),
  startTime: z.string().regex(timeRegex, { message: "Must be HH:MM format (24-hour)" }),
  endTime: z.string().regex(timeRegex, { message: "Must be HH:MM format (24-hour)" }),
  label: z.string(),
  isBreak: z.boolean().optional()
});

export const ScheduleItemSchema = z.object({
  id: z.string(),
  slotId: z.string(),
  subjectCode: z.string().min(1),
  subjectName: z.string().min(1),
  faculty: z.string(),
  room: z.string(),
  type: z.string(),
  section: z.string().optional(),
  color: z.string().optional(),
  isCancelled: z.boolean().optional(),
  proxyFaculty: z.string().optional(),
  note: z.string().optional()
});

export const TimetableSchema = z.object({
  contentFile: z.string().optional(),
  section: z.string(),
  semester: z.string(),
  academicYear: z.string(),
  defaultRoom: z.string(),
  timeSlots: z.array(TimeSlotSchema),
  schedule: z.record(
    z.string(),
    z.array(ScheduleItemSchema)
  )
});

export const FacultySubjectSchema = z.object({
  code: z.string(),
  name: z.string()
});

export const FacultySchema = z.object({
  contentFile: z.string().optional(),
  id: z.string(),
  name: z.string().min(2),
  designation: z.string(),
  department: z.string().optional().default(''),
  cabin: z.string().optional().default(''),
  email: z.preprocess(emptyStringToUndefined, z.string().email().optional()),
  phone: z.string().optional().default(''),
  subjects: z.array(FacultySubjectSchema),
  officeHours: z.string().optional().default(''),
  researchInterests: z.array(z.string()),
  avatar: z.string()
});

export const CRSchema = z.object({
  contentFile: z.string().optional(),
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
  section: z.string(),
  rollNo: z.preprocess(emptyStringToUndefined, z.string().optional()),
  email: z.preprocess(emptyStringToUndefined, z.string().email().optional()),
  phone: z.preprocess(emptyStringToUndefined, z.string().optional()),
  officeHours: z.string().optional(),
  primaryResponsibilities: z.array(z.string()).optional(),
  social: z.object({
    github: optionalUrl,
    linkedin: optionalUrl,
    whatsapp: optionalUrl
  }).optional(),
  avatar: z.string()
});

export const TaskItemSchema = z.object({
  contentFile: z.string().optional(),
  id: z.string(),
  title: z.string().min(3),
  subjectCode: z.string(),
  section: z.string(),
  dueDate: z.string(),
  priority: z.string(),
  assignedBy: z.string(),
  description: z.string(),
  completed: z.boolean().optional()
});

export const AnnouncementSchema = z.object({
  contentFile: z.string().optional(),
  id: z.string(),
  title: z.string().min(5),
  author: z.preprocess(emptyStringToUndefined, z.string().optional()),
  date: z.string().optional().default(''),
  priority: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  summary: z.string().optional(),
  markdownPath: z.string().optional()
});

export const UnitTopicSchema = z.object({
  unitNumber: z.number().int().positive(),
  title: z.string(),
  topics: z.array(z.string()),
  slidesUrl: optionalUrl,
  notesUrl: optionalUrl,
  notebookLmUrl: optionalUrl
});

export const PyqSchema = z.object({
  year: z.string(),
  examType: z.string(),
  url: optionalUrl
});

export const NoteSchema = z.object({
  contentFile: z.string().optional(),
  id: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  faculty: z.string(),
  credits: z.number(),
  semester: z.number(),
  driveUrl: optionalUrl,
  pyqDriveUrl: optionalUrl,
  notesUrl: optionalUrl,
  lastUpdated: z.string(),
  tags: z.array(z.string()),
  units: z.array(UnitTopicSchema),
  pyqs: z.array(PyqSchema).optional()
});

export const CampusPortalSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string(),
  url: z.string().url(),
  icon: z.string()
});

export const LinksSchema = z.object({
  contentFile: z.string().optional(),
  githubRepoUrl: z.string().url(),
  whatsappCommunityUrl: optionalUrl,
  generalDriveUrl: optionalUrl,
  campusPortals: z.array(CampusPortalSchema)
});

export const CalendarEventTypeSchema = z.enum([
  'public_holiday',
  'college_holiday',
  'exam',
  'special_working_day',
  'timetable_exception',
  'event'
]);

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD format" }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: CalendarEventTypeSchema,
  description: z.string().optional(),
  applicableBatch: z.enum(['All', 'V1', 'V2']).default('All'),
  isSuspended: z.boolean().default(true), // Whether regular classes are suspended
  replacementDay: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).optional(),
  specialSchedule: z.array(ScheduleItemSchema).optional()
});

// Infer TypeScript types from Zod schemas
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type TimetableData = z.infer<typeof TimetableSchema>;
export type Faculty = z.infer<typeof FacultySchema>;
export type ClassRepresentative = z.infer<typeof CRSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type UnitTopic = z.infer<typeof UnitTopicSchema>;
export type PyqItem = z.infer<typeof PyqSchema>;
export type SubjectNote = z.infer<typeof NoteSchema>;
export type CampusPortal = z.infer<typeof CampusPortalSchema>;
export type LinksConfig = z.infer<typeof LinksSchema>;
export type TaskItem = z.infer<typeof TaskItemSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type CalendarEventType = z.infer<typeof CalendarEventTypeSchema>;
