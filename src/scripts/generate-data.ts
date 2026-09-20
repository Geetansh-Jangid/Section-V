import fs from 'fs';
import path from 'path';
import {
  TimetableSchema,
  FacultySchema,
  CRSchema,
  AnnouncementSchema,
  NoteSchema,
  LinksSchema,
  TaskItemSchema,
  SubjectNote,
  Faculty,
  ClassRepresentative,
  Announcement,
  TimetableData,
  LinksConfig,
  ScheduleItem,
  TaskItem
} from '../lib/schemas.ts';

const rootDir = process.cwd();

function readFileContent(relPath: string): string {
  const fullPath = path.resolve(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeJsonFile(relPath: string, data: any) {
  const fullPath = path.resolve(rootDir, relPath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Generated JSON: ${relPath}`);
}

// -----------------------------------------------------------------------------
// 1. Parse Notes TXT files
// -----------------------------------------------------------------------------
function parseNotesDirectory(): SubjectNote[] {
  const notesDir = path.resolve(rootDir, 'content/notes');
  if (!fs.existsSync(notesDir)) return [];

  const files = fs.readdirSync(notesDir).filter(f => f.endsWith('.txt'));
  const subjects: SubjectNote[] = [];

  for (const file of files) {
    const relFile = `content/notes/${file}`;
    const content = readFileContent(relFile);
    const lines = content.split('\n');

    let currentSubject: Partial<SubjectNote> = {
      contentFile: relFile,
      units: [],
      pyqs: [],
      tags: []
    };

    let currentUnit: any = null;
    let currentPyq: any = null;
    let currentBlock = 'META';

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.toUpperCase() === '[UNIT]') {
        if (currentUnit && currentUnit.title) {
          currentSubject.units!.push(currentUnit);
        }
        currentUnit = { topics: [] };
        currentBlock = 'UNIT';
        continue;
      }

      if (line.toUpperCase() === '[PYQ]') {
        if (currentPyq && currentPyq.year) {
          currentSubject.pyqs!.push(currentPyq);
        }
        currentPyq = {};
        currentBlock = 'PYQ';
        continue;
      }

      const separatorIdx = line.indexOf(':');
      if (separatorIdx === -1) continue;

      const key = line.slice(0, separatorIdx).trim();
      const val = line.slice(separatorIdx + 1).trim();

      if (currentBlock === 'META') {
        switch (key.toLowerCase()) {
          case 'subject code':
            currentSubject.subjectCode = val;
            currentSubject.id = `sub-${val.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            break;
          case 'subject name':
            currentSubject.subjectName = val;
            break;
          case 'faculty':
            currentSubject.faculty = val;
            break;
          case 'credits':
            currentSubject.credits = Number(val) || 4;
            break;
          case 'semester':
            currentSubject.semester = Number(val) || 1;
            break;
          case 'drive folder url':
            currentSubject.driveUrl = val;
            break;
          case 'pyq drive url':
            currentSubject.pyqDriveUrl = val;
            break;
          case 'tags':
            currentSubject.tags = val.split(',').map(t => t.trim()).filter(Boolean);
            break;
          case 'last updated':
            currentSubject.lastUpdated = val;
            break;
        }
      } else if (currentBlock === 'UNIT' && currentUnit) {
        switch (key.toLowerCase()) {
          case 'unit number':
            currentUnit.unitNumber = Number(val) || (currentSubject.units!.length + 1);
            break;
          case 'title':
            currentUnit.title = val;
            break;
          case 'topics':
            currentUnit.topics = val.split(',').map(t => t.trim()).filter(Boolean);
            break;
          case 'drive link':
          case 'slides url':
            currentUnit.slidesUrl = val;
            break;
        }
      } else if (currentBlock === 'PYQ' && currentPyq) {
        switch (key.toLowerCase()) {
          case 'year':
            currentPyq.year = val;
            break;
          case 'exam type':
            currentPyq.examType = val;
            break;
          case 'file size':
            currentPyq.fileSize = val;
            break;
          case 'drive link':
          case 'url':
            currentPyq.url = val;
            break;
        }
      }
    }

    if (currentUnit && currentUnit.title) {
      currentSubject.units!.push(currentUnit);
    }
    if (currentPyq && currentPyq.year) {
      currentSubject.pyqs!.push(currentPyq);
    }

    if (currentSubject.subjectCode && currentSubject.subjectName) {
      if (!currentSubject.lastUpdated) currentSubject.lastUpdated = new Date().toISOString().split('T')[0];
      if (!currentSubject.driveUrl) currentSubject.driveUrl = 'https://drive.google.com';
      subjects.push(NoteSchema.parse(currentSubject));
    }
  }

  return subjects;
}

// -----------------------------------------------------------------------------
// 2. Parse Faculty TXT file
// -----------------------------------------------------------------------------
function parseFacultyFile(): Faculty[] {
  const relFile = 'content/faculty/faculty.txt';
  const content = readFileContent(relFile);
  const blocks = content.split(/\[FACULTY\]/i).slice(1);
  const faculties: Faculty[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let item: any = { contentFile: relFile, subjects: [], researchInterests: [] };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();

      switch (key.toLowerCase()) {
        case 'id': item.id = val; break;
        case 'name': item.name = val; break;
        case 'designation': item.designation = val; break;
        case 'department': item.department = val; break;
        case 'cabin': item.cabin = val; break;
        case 'email': item.email = val; break;
        case 'phone': item.phone = val; break;
        case 'office hours': item.officeHours = val; break;
        case 'avatar': item.avatar = val; break;
        case 'research interests':
          item.researchInterests = val.split(',').map(s => s.trim()).filter(Boolean);
          break;
        case 'subjects':
          // format: CODE: Name; CODE2: Name2
          const parts = val.split(';');
          item.subjects = parts.map(p => {
            const subParts = p.split(':');
            return {
              code: (subParts[0] || '').trim(),
              name: (subParts[1] || subParts[0] || '').trim()
            };
          }).filter(s => s.code);
          break;
      }
    }

    if (item.name && item.email) {
      faculties.push(FacultySchema.parse(item));
    }
  }

  return faculties;
}

// -----------------------------------------------------------------------------
// 3. Parse Announcements TXT file
// -----------------------------------------------------------------------------
function parseAnnouncementsFile(): Announcement[] {
  const relFile = 'content/announcements/announcements.txt';
  const content = readFileContent(relFile);
  const blocks = content.split(/\[ANNOUNCEMENT\]/i).slice(1);
  const announcements: Announcement[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let item: any = { contentFile: relFile, tags: [] };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();

      switch (key.toLowerCase()) {
        case 'id': item.id = val; break;
        case 'title': item.title = val; break;
        case 'author': item.author = val; break;
        case 'date': item.date = val; break;
        case 'priority': item.priority = val.toLowerCase(); break;
        case 'category': item.category = val; break;
        case 'summary': item.summary = val; break;
        case 'tags':
          item.tags = val.split(',').map(t => t.trim()).filter(Boolean);
          break;
      }
    }

    if (item.title && item.author) {
      announcements.push(AnnouncementSchema.parse(item));
    }
  }

  return announcements;
}

// -----------------------------------------------------------------------------
// 4. Parse Links TXT file
// -----------------------------------------------------------------------------
function parseLinksFile(): LinksConfig {
  const relFile = 'content/links/links.txt';
  const content = readFileContent(relFile);
  const result: any = {
    contentFile: relFile,
    githubRepoUrl: 'https://github.com/Geetansh-Jangid/Section-V',
    campusPortals: []
  };

  const portalBlocks = content.split(/\[PORTAL\]/i);
  const headerLines = portalBlocks[0].split('\n');

  for (const rawLine of headerLines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (key === 'github repo url') result.githubRepoUrl = val;
    if (key === 'whatsapp community url') result.whatsappCommunityUrl = val;
    if (key === 'general drive url') result.generalDriveUrl = val;
  }

  for (let i = 1; i < portalBlocks.length; i++) {
    const lines = portalBlocks[i].split('\n');
    let portal: any = {};
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();
      if (key === 'id') portal.id = val;
      if (key === 'title') portal.title = val;
      if (key === 'description' || key === 'desc') portal.desc = val;
      if (key === 'url') portal.url = val;
      if (key === 'icon') portal.icon = val;
    }
    if (portal.title && portal.url) {
      result.campusPortals.push(portal);
    }
  }

  return LinksSchema.parse(result);
}

// -----------------------------------------------------------------------------
// 5. Parse CR TXT file
// -----------------------------------------------------------------------------
function parseCrFile(): ClassRepresentative[] {
  const relFile = 'content/cr/cr.txt';
  const content = readFileContent(relFile);
  const blocks = content.split(/\[CR\]/i).slice(1);
  const crs: ClassRepresentative[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let item: any = {
      contentFile: relFile,
      primaryResponsibilities: [],
      social: {}
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();

      switch (key) {
        case 'id': item.id = val; break;
        case 'name': item.name = val; break;
        case 'role': item.role = val; break;
        case 'section': item.section = val; break;
        case 'roll no': item.rollNo = val; break;
        case 'email': item.email = val; break;
        case 'phone': item.phone = val; break;
        case 'office hours': item.officeHours = val; break;
        case 'avatar': item.avatar = val; break;
        case 'responsibilities':
          item.primaryResponsibilities = val.split(';').map(r => r.trim()).filter(Boolean);
          break;
        case 'github': item.social.github = val; break;
        case 'linkedin': item.social.linkedin = val; break;
        case 'whatsapp': item.social.whatsapp = val; break;
      }
    }

    if (item.name && item.email) {
      crs.push(CRSchema.parse(item));
    }
  }

  return crs;
}

// -----------------------------------------------------------------------------
// 6. Parse Timetable TXT file
// -----------------------------------------------------------------------------
function parseTimetableFile(): TimetableData {
  const relFile = 'content/timetable/timetable.txt';
  const content = readFileContent(relFile);

  const timeSlots = [
    { id: "slot-1", startTime: "08:30", endTime: "09:30", label: "1" },
    { id: "slot-2", startTime: "09:30", endTime: "10:30", label: "2" },
    { id: "slot-3", startTime: "10:30", endTime: "11:30", label: "3" },
    { id: "slot-4", startTime: "11:30", endTime: "12:30", label: "4" },
    { id: "slot-5", startTime: "12:30", endTime: "13:30", label: "5", isBreak: true },
    { id: "slot-6", startTime: "13:30", endTime: "14:30", label: "6" },
    { id: "slot-7", startTime: "14:30", endTime: "15:30", label: "7" }
  ];

  const timetable: TimetableData = {
    contentFile: relFile,
    section: "Section V (AI)",
    semester: "Semester 1 / 2 - B.Tech CSE (AI)",
    academicYear: "2026-2027",
    defaultRoom: "CT-12",
    timeSlots,
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    }
  };

  const dayRegex = /^\[(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\]/i;
  const lines = content.split('\n');
  let currentDay = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const matchDay = line.match(dayRegex);
    if (matchDay) {
      currentDay = matchDay[1].charAt(0).toUpperCase() + matchDay[1].slice(1).toLowerCase();
      continue;
    }

    if (currentDay && line.startsWith('Slot:')) {
      // Slot: 1 | Code: M | Name: Mathematics | Faculty: GC | Room: CT-12 | Type: Theory | Batch: Both | Color: #84cc16
      const segments = line.split('|').map(s => s.trim());
      const item: Partial<ScheduleItem> = {};
      let slotNum = '1';

      for (const seg of segments) {
        const idx = seg.indexOf(':');
        if (idx === -1) continue;
        const k = seg.slice(0, idx).trim().toLowerCase();
        const v = seg.slice(idx + 1).trim();

        if (k === 'slot') slotNum = v;
        if (k === 'code' || k === 'subject code') item.subjectCode = v;
        if (k === 'name' || k === 'subject name' || k === 'subject') item.subjectName = v;
        if (k === 'faculty') item.faculty = v;
        if (k === 'room') item.room = v;
        if (k === 'type') item.type = v as any;
        if (k === 'batch' || k === 'section') item.section = v as any;
        if (k === 'color') item.color = v;
      }

      if (item.subjectCode) {
        if (!item.subjectName) item.subjectName = item.subjectCode;
        if (!item.type) item.type = 'Theory';
        if (!item.section) item.section = 'Both';
        if (!item.room) item.room = 'CT-12';
        if (!item.faculty) item.faculty = 'TBD';
        item.slotId = `slot-${slotNum}`;
        item.id = `${currentDay.slice(0, 3).toLowerCase()}-${slotNum}-${(item.section || 'both').toLowerCase()}-${item.subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        timetable.schedule[currentDay].push(item as ScheduleItem);
      }
    }
  }

  return TimetableSchema.parse(timetable);
}

// -----------------------------------------------------------------------------
// 7. Parse Tasks / Work TXT file
// -----------------------------------------------------------------------------
function parseTasksFile(): TaskItem[] {
  const relFile = 'content/tasks/tasks.txt';
  const content = readFileContent(relFile);
  const blocks = content.split(/\[TASK\]/i).slice(1);
  const tasks: TaskItem[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let item: any = {
      contentFile: relFile,
      completed: false
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();

      switch (key) {
        case 'id': item.id = val; break;
        case 'title': item.title = val; break;
        case 'subject':
        case 'subjectcode': item.subjectCode = val; break;
        case 'section': item.section = val; break;
        case 'due date': item.dueDate = val; break;
        case 'priority': item.priority = val.toLowerCase(); break;
        case 'assigned by': item.assignedBy = val; break;
        case 'description': item.description = val; break;
      }
    }

    if (item.title && item.subjectCode) {
      if (!item.section) item.section = 'All';
      if (!item.priority) item.priority = 'medium';
      if (!item.assignedBy) item.assignedBy = 'Course Faculty';
      if (!item.description) item.description = '';
      if (!item.dueDate) item.dueDate = new Date().toISOString().split('T')[0];
      tasks.push(TaskItemSchema.parse(item));
    }
  }

  return tasks;
}

// -----------------------------------------------------------------------------
// Main Generation Script
// -----------------------------------------------------------------------------
console.log('🚀 Generating Section-V structured JSON files from content TXT files...');

try {
  const notes = parseNotesDirectory();
  writeJsonFile('src/data/notes.json', notes);

  const faculty = parseFacultyFile();
  writeJsonFile('src/data/faculty.json', faculty);

  const announcements = parseAnnouncementsFile();
  writeJsonFile('src/data/announcements.json', announcements);

  const links = parseLinksFile();
  writeJsonFile('src/data/links.json', links);

  const crs = parseCrFile();
  writeJsonFile('src/data/cr.json', crs);

  const timetable = parseTimetableFile();
  writeJsonFile('src/data/timetable.json', timetable);

  const tasks = parseTasksFile();
  writeJsonFile('src/data/tasks.json', tasks);

  console.log('🎉 Successfully generated and validated all data from TXT content files!');
} catch (err: any) {
  console.error('❌ Data generation failed:', err.message);
  process.exit(1);
}
