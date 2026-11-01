import React from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useSectionVStore } from '../../lib/store.ts';
import { calculateAttendanceMetrics } from '../../lib/attendanceUtils.ts';

interface AttendanceWidgetProps {
  onNavigateToCalculator: () => void;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ onNavigateToCalculator }) => {
  const { attendance, targetAttendance, markAttendance } = useSectionVStore();

  const subjectList = Object.values(attendance);
  const totalAttended = subjectList.reduce((acc, curr) => acc + curr.attended, 0);
  const totalConducted = subjectList.reduce((acc, curr) => acc + curr.total, 0);

  const metrics = calculateAttendanceMetrics(totalAttended, totalConducted, targetAttendance);

  const lowestSubject = [...subjectList].sort((a, b) => {
    const pctA = a.total === 0 ? 0 : (a.attended / a.total) * 100;
    const pctB = b.total === 0 ? 0 : (b.attended / b.total) * 100;
    return pctA - pctB;
  })[0];

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-muted" />
            <h3 className="text-[13px] font-medium text-secondary uppercase tracking-wide">
              Attendance Health
            </h3>
          </div>
          <button 
            onClick={onNavigateToCalculator}
            className="text-[12px] font-mono text-secondary hover:text-foreground transition-colors cursor-pointer select-none"
            title="Click to adjust custom target"
          >
            Target {targetAttendance}%
          </button>
        </div>

        {/* Big Metric Display */}
        <div className="mb-4">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono">{metrics.currentPercentage}%</span>
            <span className={`text-[12px] font-mono font-medium px-2 py-0.5 rounded ${
              metrics.isSafe
                ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20'
            }`}>
              {metrics.isSafe ? 'Compliant' : `Below ${targetAttendance}%`}
            </span>
          </div>
          <p className="text-[13px] text-muted mt-1 font-mono">
            {metrics.totalAttended} of {metrics.totalConducted} lectures attended
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-elevated h-1 overflow-hidden mb-3">
          <div
            className={`h-1 transition-all duration-500 ${
              metrics.isSafe
                ? 'bg-emerald-500'
                : metrics.statusBadge === 'critical'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, metrics.currentPercentage)}%` }}
          />
        </div>

        {/* Status indicator line */}
        <div className="text-[13.5px] text-secondary leading-relaxed">
          {metrics.statusText}
        </div>

        {/* Lowest subject callout if below target (clean border-t without boxed card) */}
        {lowestSubject && (
          <div className="mt-4 pt-3 border-t border-divider-subtle flex items-center justify-between text-[13px]">
            <span className="text-secondary truncate max-w-[200px]">
              Lowest: <strong className="text-foreground font-medium">{lowestSubject.subjectCode}</strong> ({lowestSubject.subjectName})
            </span>
            <span className="font-mono text-secondary shrink-0">
              {lowestSubject.attended}/{lowestSubject.total} ({lowestSubject.total > 0 ? Math.round((lowestSubject.attended / lowestSubject.total) * 100) : 0}%)
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onNavigateToCalculator}
        className="mt-5 pt-3 border-t border-divider-subtle flex items-center justify-between text-[13px] text-secondary hover:text-foreground transition-colors cursor-pointer select-none"
      >
        <span>Open full attendance calculator</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
