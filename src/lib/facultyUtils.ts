import facultyDataRaw from '../data/faculty.json';

export interface FacultySubject {
  code: string;
  name: string;
}

export interface FacultyItem {
  id: string;
  name: string;
  designation: string;
  subjects: FacultySubject[];
}

const facultyList = facultyDataRaw as FacultyItem[];

/**
 * Returns the faculty name(s) for a given subject code dynamically from faculty.json.
 * If userSection ('V1' | 'V2') is provided, it attempts to match section-specific teachers (e.g. for labs).
 */
export function getFacultyForSubject(subjectCode: string, userSection?: 'V1' | 'V2'): string {
  if (!subjectCode) return 'Faculty';

  const cleanCode = subjectCode.trim().toUpperCase();

  const matchingFaculty = facultyList.filter((fac) =>
    fac.subjects?.some((s) => s.code.toUpperCase() === cleanCode)
  );

  if (matchingFaculty.length === 0) {
    return 'Faculty';
  }

  if (matchingFaculty.length === 1) {
    return matchingFaculty[0].name;
  }

  if (userSection) {
    const sectionMatch = matchingFaculty.find(
      (fac) =>
        fac.designation.toUpperCase().includes(userSection) ||
        fac.subjects.some((s) => s.name.toUpperCase().includes(userSection))
    );
    if (sectionMatch) {
      return sectionMatch.name;
    }
  }

  return matchingFaculty.map((f) => f.name).join(' / ');
}
