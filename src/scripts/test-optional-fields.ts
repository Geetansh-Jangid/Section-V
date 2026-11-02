import assert from 'node:assert/strict';
import {
  NoteSchema,
  UnitTopicSchema,
  PyqSchema,
  LinksSchema,
  CRSchema,
  emptyStringToUndefined,
  optionalUrl,
  SubjectNote
} from '../lib/schemas.ts';

console.log('🧪 Starting Optional Fields & Validation Test Suite...\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Base mock subject helper
// -----------------------------------------------------------------------------
function createMockSubject(overrides: Partial<SubjectNote> = {}): any {
  return {
    id: 'sub-test',
    subjectCode: 'TEST',
    subjectName: 'Test Subject',
    faculty: 'Prof. Tester',
    credits: 4,
    semester: 1,
    lastUpdated: '2026-11-02',
    tags: ['test'],
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1 Title',
        topics: ['Topic A', 'Topic B'],
        slidesUrl: 'https://drive.google.com/unit1.pdf',
        notesUrl: 'https://drive.google.com/unit1-notes.pdf',
        notebookLmUrl: 'https://notebooklm.google.com/unit1'
      },
      {
        unitNumber: 2,
        title: 'Unit 2 Title',
        topics: ['Topic C'],
        slidesUrl: 'https://drive.google.com/unit2.pdf'
      }
    ],
    pyqs: [
      {
        year: '2025 Mid-Sem',
        examType: 'Mid-Sem',
        url: 'https://drive.google.com/pyq2025.pdf'
      }
    ],
    driveUrl: 'https://drive.google.com/folders/test-subject',
    pyqDriveUrl: 'https://drive.google.com/folders/test-pyqs',
    ...overrides
  };
}

// =============================================================================
// Scenario 1: All optional URLs populated
// =============================================================================
test('Scenario 1: All optional URLs populated (valid URLs pass validation)', () => {
  const subject = createMockSubject({
    driveUrl: 'https://drive.google.com/subject',
    pyqDriveUrl: 'https://drive.google.com/pyqs',
    notesUrl: 'https://drive.google.com/notes',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1',
        topics: ['Topic 1'],
        slidesUrl: 'https://drive.google.com/slides1.pdf',
        notesUrl: 'https://drive.google.com/notes1.pdf',
        notebookLmUrl: 'https://notebooklm.google.com/guide1'
      }
    ],
    pyqs: [
      {
        year: '2025',
        examType: 'Mid-Sem',
        url: 'https://drive.google.com/pyq.pdf'
      }
    ]
  });

  const parsed = NoteSchema.parse(subject);
  assert.strictEqual(parsed.driveUrl, 'https://drive.google.com/subject');
  assert.strictEqual(parsed.pyqDriveUrl, 'https://drive.google.com/pyqs');
  assert.strictEqual(parsed.notesUrl, 'https://drive.google.com/notes');
  assert.strictEqual(parsed.units[0].slidesUrl, 'https://drive.google.com/slides1.pdf');
  assert.strictEqual(parsed.units[0].notesUrl, 'https://drive.google.com/notes1.pdf');
  assert.strictEqual(parsed.units[0].notebookLmUrl, 'https://notebooklm.google.com/guide1');
  assert.strictEqual(parsed.pyqs?.[0].url, 'https://drive.google.com/pyq.pdf');
});

// =============================================================================
// Scenario 2: All optional URLs blank (empty string or whitespace)
// =============================================================================
test('Scenario 2: All optional URLs blank (empty strings treated as undefined)', () => {
  const subject = createMockSubject({
    driveUrl: '',
    pyqDriveUrl: '   ',
    notesUrl: '\t\n  ',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1 Blank',
        topics: ['Topic 1'],
        slidesUrl: '',
        notesUrl: '   ',
        notebookLmUrl: ''
      }
    ],
    pyqs: [
      {
        year: '2025',
        examType: 'Mid-Sem',
        url: '   '
      }
    ]
  });

  const parsed = NoteSchema.parse(subject);
  assert.strictEqual(parsed.driveUrl, undefined);
  assert.strictEqual(parsed.pyqDriveUrl, undefined);
  assert.strictEqual(parsed.notesUrl, undefined);
  assert.strictEqual(parsed.units[0].slidesUrl, undefined);
  assert.strictEqual(parsed.units[0].notesUrl, undefined);
  assert.strictEqual(parsed.units[0].notebookLmUrl, undefined);
  assert.strictEqual(parsed.pyqs?.[0].url, undefined);

  // Check JSON serialization does not contain empty string URL properties
  const jsonString = JSON.stringify(parsed);
  const jsonParsed = JSON.parse(jsonString);
  assert.strictEqual('driveUrl' in jsonParsed, false);
  assert.strictEqual('pyqDriveUrl' in jsonParsed, false);
  assert.strictEqual('slidesUrl' in jsonParsed.units[0], false);
  assert.strictEqual('notesUrl' in jsonParsed.units[0], false);
  assert.strictEqual('notebookLmUrl' in jsonParsed.units[0], false);
});

// =============================================================================
// Scenario 3: Only PYQ URL blank
// =============================================================================
test('Scenario 3: Only PYQ URL blank (subject pyqDriveUrl is blank, others populated)', () => {
  const subject = createMockSubject({
    driveUrl: 'https://drive.google.com/subject',
    pyqDriveUrl: '',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1',
        topics: ['Topic 1'],
        slidesUrl: 'https://drive.google.com/slides1.pdf'
      }
    ]
  });

  const parsed = NoteSchema.parse(subject);
  assert.strictEqual(parsed.driveUrl, 'https://drive.google.com/subject');
  assert.strictEqual(parsed.pyqDriveUrl, undefined);
  assert.strictEqual(parsed.units[0].slidesUrl, 'https://drive.google.com/slides1.pdf');
});

// =============================================================================
// Scenario 4: Only individual unit slide URLs blank
// =============================================================================
test('Scenario 4: Only individual unit slide URLs blank (units[0] blank, units[1] populated)', () => {
  const subject = createMockSubject({
    driveUrl: 'https://drive.google.com/subject',
    pyqDriveUrl: 'https://drive.google.com/pyqs',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1 Without Slides',
        topics: ['Topic 1'],
        slidesUrl: '   '
      },
      {
        unitNumber: 2,
        title: 'Unit 2 With Slides',
        topics: ['Topic 2'],
        slidesUrl: 'https://drive.google.com/slides2.pdf'
      }
    ]
  });

  const parsed = NoteSchema.parse(subject);
  assert.strictEqual(parsed.units[0].slidesUrl, undefined);
  assert.strictEqual(parsed.units[1].slidesUrl, 'https://drive.google.com/slides2.pdf');
  // Entire unit record remains intact
  assert.strictEqual(parsed.units[0].unitNumber, 1);
  assert.strictEqual(parsed.units[0].title, 'Unit 1 Without Slides');
  assert.deepStrictEqual(parsed.units[0].topics, ['Topic 1']);
});

// =============================================================================
// Scenario 5: Some URLs populated and others blank
// =============================================================================
test('Scenario 5: Some URLs populated and others blank across entities', () => {
  const subject = createMockSubject({
    driveUrl: 'https://drive.google.com/subject',
    pyqDriveUrl: '',
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1',
        topics: ['Topic A'],
        slidesUrl: 'https://drive.google.com/unit1.pdf',
        notesUrl: ''
      },
      {
        unitNumber: 2,
        title: 'Unit 2',
        topics: ['Topic B'],
        slidesUrl: '   ',
        notesUrl: 'https://drive.google.com/unit2-notes.pdf'
      }
    ]
  });

  const parsed = NoteSchema.parse(subject);
  assert.strictEqual(parsed.driveUrl, 'https://drive.google.com/subject');
  assert.strictEqual(parsed.pyqDriveUrl, undefined);
  assert.strictEqual(parsed.units[0].slidesUrl, 'https://drive.google.com/unit1.pdf');
  assert.strictEqual(parsed.units[0].notesUrl, undefined);
  assert.strictEqual(parsed.units[1].slidesUrl, undefined);
  assert.strictEqual(parsed.units[1].notesUrl, 'https://drive.google.com/unit2-notes.pdf');
});

// =============================================================================
// Scenario 6: Malformed non-empty URL provided (must produce appropriate validation error)
// =============================================================================
test('Scenario 6: Malformed non-empty URL throws validation error on pyqDriveUrl', () => {
  const subject = createMockSubject({
    pyqDriveUrl: 'not-a-valid-url'
  });

  assert.throws(
    () => NoteSchema.parse(subject),
    (err: any) => {
      assert.strictEqual(err.name, 'ZodError');
      const hasUrlError = err.issues.some(
        (issue: any) => issue.path.includes('pyqDriveUrl') && issue.message.toLowerCase().includes('url')
      );
      assert.strictEqual(hasUrlError, true);
      return true;
    }
  );
});

test('Scenario 6: Malformed non-empty URL throws validation error on unit slidesUrl', () => {
  const subject = createMockSubject({
    units: [
      {
        unitNumber: 1,
        title: 'Unit 1',
        topics: ['Topic 1'],
        slidesUrl: 'http://' // incomplete/malformed URL
      }
    ]
  });

  assert.throws(
    () => NoteSchema.parse(subject),
    (err: any) => {
      assert.strictEqual(err.name, 'ZodError');
      const hasUrlError = err.issues.some(
        (issue: any) => issue.path.includes('slidesUrl')
      );
      assert.strictEqual(hasUrlError, true);
      return true;
    }
  );
});

test('Scenario 6: Malformed non-empty URL throws validation error on subject driveUrl', () => {
  const subject = createMockSubject({
    driveUrl: 'not-a-valid-drive-url'
  });

  assert.throws(
    () => NoteSchema.parse(subject),
    (err: any) => {
      assert.strictEqual(err.name, 'ZodError');
      return true;
    }
  );
});

// =============================================================================
// Additional Coverage: LinksSchema & CRSchema optional URLs
// =============================================================================
test('LinksSchema: Gracefully handles blank optional URLs (whatsappCommunityUrl, generalDriveUrl)', () => {
  const links = {
    githubRepoUrl: 'https://github.com/Geetansh-Jangid/Section-V',
    whatsappCommunityUrl: '   ',
    generalDriveUrl: '',
    campusPortals: [
      {
        id: 'portal-1',
        title: 'ERP',
        desc: 'Student ERP',
        url: 'https://erp.college.edu',
        icon: 'GraduationCap'
      }
    ]
  };

  const parsed = LinksSchema.parse(links);
  assert.strictEqual(parsed.whatsappCommunityUrl, undefined);
  assert.strictEqual(parsed.generalDriveUrl, undefined);
  assert.strictEqual(parsed.githubRepoUrl, 'https://github.com/Geetansh-Jangid/Section-V');
});

test('LinksSchema: Malformed optional URL still fails validation', () => {
  const links = {
    githubRepoUrl: 'https://github.com/Geetansh-Jangid/Section-V',
    whatsappCommunityUrl: 'not_a_valid_url',
    campusPortals: []
  };

  assert.throws(() => LinksSchema.parse(links));
});

test('CRSchema: Handles blank social URLs and rejects malformed social URLs', () => {
  const cr = {
    id: 'cr-test',
    name: 'Test CR',
    section: 'Section V',
    avatar: 'TC',
    social: {
      github: '',
      linkedin: '   ',
      whatsapp: 'https://wa.me/919999999999'
    }
  };

  const parsed = CRSchema.parse(cr);
  assert.strictEqual(parsed.social?.github, undefined);
  assert.strictEqual(parsed.social?.linkedin, undefined);
  assert.strictEqual(parsed.social?.whatsapp, 'https://wa.me/919999999999');

  const crMalformed = {
    ...cr,
    social: {
      github: 'not-a-valid-github-url'
    }
  };
  assert.throws(() => CRSchema.parse(crMalformed));
});

test('emptyStringToUndefined: correctly transforms primitives', () => {
  assert.strictEqual(emptyStringToUndefined(''), undefined);
  assert.strictEqual(emptyStringToUndefined('   '), undefined);
  assert.strictEqual(emptyStringToUndefined('\t\n'), undefined);
  assert.strictEqual(emptyStringToUndefined(null), undefined);
  assert.strictEqual(emptyStringToUndefined(undefined), undefined);
  assert.strictEqual(emptyStringToUndefined('https://test.com'), 'https://test.com');
  assert.strictEqual(emptyStringToUndefined('  https://test.com  '), 'https://test.com');
  assert.strictEqual(emptyStringToUndefined(123), 123);
  assert.strictEqual(emptyStringToUndefined(true), true);
});

// =============================================================================
// Summary
// =============================================================================
console.log('\n========================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
