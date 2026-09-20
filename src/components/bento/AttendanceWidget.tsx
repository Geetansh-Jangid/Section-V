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
    const pctA = a.total === 0 ? 100 : (a.attended / a.total) * 100;
    const pctB = b.total === 0 ? 100 : (b.attended / b.total) * 100;
    return pctA - pctB;
  })[0];

  return (
    <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 flex flex-col justify-between hover:border-[#333333] transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Attendance Health
            </h3>
          </div>
          <span 
            onClick={onNavigateToCalculator}
            className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-[#141414] border border-[#222222] hover:text-white hover:border-[#333333] transition-colors cursor-pointer"
            title="Click to adjust custom target"
          >
            Target {targetAttendance}%
          </span>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
              <span>{metrics.currentPercentage}%</span>
              <span className={`text-xs font-medium ${metrics.isSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.isSafe ? 'Compliant' : `Below ${targetAttendance}%`}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              {metrics.totalAttended} / {metrics.totalConducted} total lectures attended
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#161616] rounded-full h-1.5 overflow-hidden mb-3">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              metrics.isSafe ? 'bg-white' : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, metrics.currentPercentage)}%` }}
          />
        </div>

        {/* Status indicator line */}
        <div className="text-xs text-neutral-300 leading-relaxed">
          {metrics.statusText}
        </div>

        {/* Lowest subject callout if below target */}
        {lowestSubject && (
          <div className="mt-3 p-2.5 rounded bg-[#111111] border border-[#1f1f1f] flex items-center justify-between text-xs">
            <span className="text-neutral-400 truncate max-w-[170px]">
              Lowest: <strong className="text-neutral-200">{lowestSubject.subjectCode}</strong>
            </span>
            <span className="font-mono text-neutral-300">
              {lowestSubject.attended}/{lowestSubject.total} ({lowestSubject.total > 0 ? Math.round((lowestSubject.attended / lowestSubject.total) * 100) : 100}%)
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onNavigateToCalculator}
        className="mt-4 pt-3 border-t border-[#1c1c1c] flex items-center justify-between text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
      >
        <span>Open full attendance calculator</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
