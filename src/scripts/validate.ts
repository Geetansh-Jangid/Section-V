import fs from 'fs';
import path from 'path';
import {
  TimetableSchema,
  FacultySchema,
  CRSchema,
  AnnouncementSchema,
  NoteSchema,
  LinksSchema
} from '../lib/schemas.ts';
import { z } from 'zod';

console.log('⚡ Starting Section-V OS Git Data Integrity Validation...\n');

let errorCount = 0;

function validateJsonFile<T>(filePath: string, schema: z.ZodType<T>, label: string) {
  try {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ [Missing File]: ${filePath}`);
      errorCount++;
      return;
    }

    const rawData = fs.readFileSync(resolvedPath, 'utf8');
    const parsedJson = JSON.parse(rawData);
    const result = schema.safeParse(parsedJson);

    if (result.success) {
      console.log(`✅ [Valid]: ${label} (${filePath})`);
    } else {
      console.error(`❌ [Validation Error in ${label}]:`);
      console.error(JSON.stringify(result.error.format(), null, 2));
      errorCount++;
    }
  } catch (err: any) {
    console.error(`❌ [Parse Exception]: ${filePath} - ${err.message}`);
    errorCount++;
  }
}

function checkContentFiles() {
  const contentDirs = ['content/announcements', 'content/notes'];
  for (const dir of contentDirs) {
    const fullDir = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) {
      console.warn(`⚠️ [Warning]: Content directory ${dir} does not exist yet.`);
      continue;
    }
    const files = fs.readdirSync(fullDir);
    console.log(`📄 Checked ${dir}: found ${files.length} markdown documents.`);
  }
}

// 1. Timetable validation
validateJsonFile('src/data/timetable.json', TimetableSchema, 'Timetable Data');

// 2. Faculty validation
validateJsonFile('src/data/faculty.json', z.array(FacultySchema), 'Faculty Directory');

// 3. Class Representatives validation
validateJsonFile('src/data/cr.json', z.array(CRSchema), 'Class Representatives Registry');

// 4. Announcements validation
validateJsonFile('src/data/announcements.json', z.array(AnnouncementSchema), 'Announcements Feed');

// 5. Notes validation
validateJsonFile('src/data/notes.json', z.array(NoteSchema), 'Subject Notes Catalog');

// 6. External Links & Portals validation
validateJsonFile('src/data/links.json', LinksSchema, 'Portal & Links Directory');

// 7. Content markdown directory checks
checkContentFiles();

console.log('\n----------------------------------------');
if (errorCount === 0) {
  console.log('🎉 ALL SECTION-V OS DATA SCHEMAS VALIDATED SUCCESSFULLY! CI PASS.');
  process.exit(0);
} else {
  console.error(`💥 Validation failed with ${errorCount} schema errors. Fix data before merge.`);
  process.exit(1);
}
