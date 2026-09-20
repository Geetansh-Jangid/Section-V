import { z } from 'zod';

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
  type: z.enum(['Theory', 'Practical', 'Tutorial', 'Elective', 'Activity', 'Training', 'Project', 'Lab']),
  section: z.enum(['Both', 'V1', 'V2']).optional(),
  color: z.string().optional(),
  isCancelled: z.boolean().optional(),
  proxyFaculty: z.string().optional(),
  note: z.string().optional()
});

export const TimetableSchema = z.object({
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
  id: z.string(),
  name: z.string().min(2),
  designation: z.string(),
  department: z.string(),
  cabin: z.string(),
  email: z.string().email(),
  phone: z.string(),
  subjects: z.array(FacultySubjectSchema),
  officeHours: z.string(),
  researchInterests: z.array(z.string()),
  avatar: z.string()
});

export const CRSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  section: z.string(),
  rollNo: z.string(),
  email: z.string().email(),
  phone: z.string(),
  officeHours: z.string(),
  primaryResponsibilities: z.array(z.string()),
  social: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    whatsapp: z.string().url().optional()
  }),
  avatar: z.string()
});

export const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  author: z.string(),
  date: z.string(),
  priority: z.enum(['normal', 'medium', 'high', 'urgent']),
  category: z.enum(['Exam', 'Lab', 'Event', 'Timetable', 'General']),
  tags: z.array(z.string()),
  summary: z.string().optional(),
  markdownPath: z.string().optional()
});

export const UnitTopicSchema = z.object({
  unitNumber: z.number().int().positive(),
  title: z.string(),
  topics: z.array(z.string()),
  slidesUrl: z.string().url().optional()
});

export const PyqSchema = z.object({
  year: z.string(),
  examType: z.enum(['Mid-Sem', 'End-Sem', 'Improvement', 'Quiz']),
  fileSize: z.string(),
  url: z.string().url()
});

export const NoteSchema = z.object({
  id: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  faculty: z.string(),
  credits: z.number(),
  semester: z.number(),
  driveUrl: z.string().url(),
  pyqDriveUrl: z.string().url().optional(),
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
  githubRepoUrl: z.string().url(),
  whatsappCommunityUrl: z.string().url().optional(),
  generalDriveUrl: z.string().url().optional(),
  campusPortals: z.array(CampusPortalSchema)
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
