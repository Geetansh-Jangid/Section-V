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
      statusText: 'No lectures conducted yet. Attendance at 100%.',
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
    // attended >= targetRatio * total + targetRatio * B
    // B <= (attended - targetRatio * total) / targetRatio
    const maxBunk = Math.floor((safeAttended - targetRatio * total) / targetRatio);
    bunkableClasses = Math.max(0, maxBunk);

    if (bunkableClasses > 0) {
      statusText = `You can safely miss ${bunkableClasses} ${bunkableClasses === 1 ? 'class' : 'classes'} and stay at or above ${targetPercent}%.`;
    } else {
      statusText = `You are on the margin! Attend the next lecture to avoid dropping below ${targetPercent}%.`;
    }

    statusBadge = currentPercentage >= targetPercent + 10 ? 'safe' : 'warning';
  } else {
    // How many consecutive classes must be attended:
    // (attended + A) / (total + A) >= targetRatio
    // attended + A >= targetRatio * total + targetRatio * A
    // A * (1 - targetRatio) >= targetRatio * total - attended
    // A >= (targetRatio * total - attended) / (1 - targetRatio)
    const needed = Math.ceil((targetRatio * total - safeAttended) / (1 - targetRatio));
    classesToAttend = Math.max(1, needed);
    statusText = `Attendance deficit! You must attend the next ${classesToAttend} consecutive ${classesToAttend === 1 ? 'lecture' : 'lectures'} to hit ${targetPercent}%.`;
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
