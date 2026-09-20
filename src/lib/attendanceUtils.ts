export interface AttendanceCalculationResult {
  currentPercentage: number;
  isSafe: boolean;
  bunkableClasses: number;
  classesToAttend: number;
  totalAttended: number;
  totalConducted: number;
  statusText: string;
  statusBadge: 'safe' | 'warning' | 'critical';
}

export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  targetPercent: number = 75
): AttendanceCalculationResult {
  if (total === 0) {
    return {
      currentPercentage: 100,
      isSafe: true,
      bunkableClasses: 0,
      classesToAttend: 0,
      totalAttended: 0,
      totalConducted: 0,
      statusText: 'No lectures conducted yet · Clean slate! Lucky you, 100% attendance by default.',
      statusBadge: 'safe'
    };
  }

  const safeAttended = Math.min(attended, total);
  const currentPercentage = Number(((safeAttended / total) * 100).toFixed(1));
  const targetRatio = targetPercent / 100;
  const isSafe = currentPercentage >= targetPercent;

  let bunkableClasses = 0;
  let classesToAttend = 0;
  let statusText = '';
  let statusBadge: 'safe' | 'warning' | 'critical' = 'safe';

  if (isSafe) {
    // How many more classes can be missed:
    // (attended) / (total + B) >= targetRatio
    const maxBunk = Math.floor((safeAttended - targetRatio * total) / targetRatio);
    bunkableClasses = Math.max(0, maxBunk);

    if (bunkableClasses >= 3) {
      statusText = `Lucky you! You can safely miss ${bunkableClasses} classes without angering the debar gods.`;
    } else if (bunkableClasses > 0) {
      statusText = `Safe for now! ${bunkableClasses} ${bunkableClasses === 1 ? 'bunk credit' : 'bunk credits'} left. Spend wisely.`;
    } else {
      statusText = `Living on the edge! Zero bunk margin left. Walk into next class like a model student.`;
    }

    statusBadge = currentPercentage >= targetPercent + 10 ? 'safe' : 'warning';
  } else {
    // How many consecutive classes must be attended:
    const needed = Math.ceil((targetRatio * total - safeAttended) / (1 - targetRatio));
    classesToAttend = Math.max(1, needed);
    if (classesToAttend <= 3) {
      statusText = `Attendance deficit! Must attend next ${classesToAttend} ${classesToAttend === 1 ? 'lecture' : 'lectures'} straight. Time to sit in the front row.`;
    } else {
      statusText = `Debar danger zone! Must attend next ${classesToAttend} consecutive classes. Stop sleeping through alarms!`;
    }
    statusBadge = currentPercentage < 65 ? 'critical' : 'warning';
  }

  return {
    currentPercentage,
    isSafe,
    bunkableClasses,
    classesToAttend,
    totalAttended: safeAttended,
    totalConducted: total,
    statusText,
    statusBadge
  };
}
