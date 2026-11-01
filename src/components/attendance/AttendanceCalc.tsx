import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Minus,
  RotateCcw,
  Sliders,
  UserCheck,
  UserX,
  Settings2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSectionVStore } from '../../lib/store.ts';
import { calculateAttendanceMetrics } from '../../lib/attendanceUtils.ts';
import { getFacultyForSubject } from '../../lib/facultyUtils.ts';
import { AttendanceOnboardingModal } from './AttendanceOnboardingModal.tsx';

export const AttendanceCalc: React.FC = () => {
  const {
    attendance,
    userSection,
    targetAttendance,
    setTargetAttendance,
    markAttendance,
    updateSubjectCounts,
    resetSubjectAttendance,
    resetAllAttendance,
    hasCompletedAttendanceOnboarding
  } = useSectionVStore();

  const [simulationOffset, setSimulationOffset] = useState<number>(0);
  const [simulationType, setSimulationType] = useState<'bunk' | 'attend'>('bunk');
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [isReconfiguring, setIsReconfiguring] = useState<boolean>(false);

  // Auto-launch onboarding on first-time visit
  useEffect(() => {
    if (!hasCompletedAttendanceOnboarding) {
      setIsReconfiguring(false);
      setShowOnboardingModal(true);
    }
  }, [hasCompletedAttendanceOnboarding]);

  const subjectList = Object.values(attendance);
  const totalAttended = subjectList.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjectList.reduce((sum, s) => sum + s.total, 0);

  const overallMetrics = calculateAttendanceMetrics(totalAttended, totalConducted, targetAttendance);

  // Compute simulated projection
  const simAttended = simulationType === 'attend' 
    ? totalAttended + simulationOffset 
    : totalAttended;
  const simTotal = totalConducted + simulationOffset;
  const projectedPct = simTotal > 0 ? Number(((simAttended / simTotal) * 100).toFixed(1)) : 100;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title Outside Container */}
      <h1 className="text-2xl sm:text-[26px] font-semibold text-foreground tracking-tight">
        Attendance Calculator
      </h1>

      {/* Attendance Onboarding / Reconfigure Modal */}
      <AttendanceOnboardingModal
        open={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        isReconfigure={isReconfiguring}
      />

      {/* Top Banner Overview */}
      <div className="rounded-xl bg-surface border border-border-subtle p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-divider-subtle">
          <div>
            <span className="text-[13px] font-medium text-secondary uppercase tracking-wider block">Target Attendance Threshold</span>
            <p className="text-[14px] text-muted mt-0.5">Calculates safe bunk credits and consecutive attendance requirements.</p>
          </div>

          {/* Custom Target Percentage Setter */}
          <div className="flex flex-wrap items-center gap-2 bg-surface-elevated p-1 rounded-lg border border-border-subtle">
            <span className="text-xs text-secondary font-medium pl-2">Target:</span>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              {[70, 75, 80, 85].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setTargetAttendance(val);
                    if (overallMetrics.currentPercentage >= val) {
                      triggerCelebration();
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer select-none ${
                    targetAttendance === val
                      ? 'bg-surface text-foreground font-semibold shadow-xs'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            {/* Custom Stepper & Input */}
            <div className="flex items-center gap-1 pl-1.5 border-l border-divider-subtle">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(50, targetAttendance - 1);
                  setTargetAttendance(next);
                }}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Decrease target by 1%"
              >
                <Minus className="w-3 h-3" />
              </button>

              <div className="flex items-center bg-surface border border-border-subtle rounded px-1.5 py-0.5">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={targetAttendance}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      const clamped = Math.min(100, Math.max(50, val));
                      setTargetAttendance(clamped);
                      if (overallMetrics.currentPercentage >= clamped) {
                        triggerCelebration();
                      }
                    }
                  }}
                  className="w-8 text-center text-xs font-mono font-semibold bg-transparent text-foreground outline-none"
                />
                <span className="text-[11px] font-mono text-muted">%</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = Math.min(100, targetAttendance + 1);
                  setTargetAttendance(next);
                  if (overallMetrics.currentPercentage >= next) {
                    triggerCelebration();
                  }
                }}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Increase target by 1%"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Big Status Display with Whitespace (No heavy nested bounding boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Metric 1: Current Overall */}
          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">Overall Ratio</span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight font-mono">{overallMetrics.currentPercentage}%</span>
              <span className={`text-[12px] px-2 py-0.5 rounded font-mono font-medium ${
                overallMetrics.isSafe
                  ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20'
              }`}>
                {overallMetrics.isSafe ? 'Eligible' : 'Debar Risk'}
              </span>
            </div>
            <p className="text-[13px] text-muted mt-1.5 font-mono">
              {overallMetrics.totalAttended} attended of {overallMetrics.totalConducted} conducted
            </p>
          </div>

          {/* Metric 2: Bunkable / Attend Requirement */}
          <div>
            <span className="text-[12px] font-medium text-secondary uppercase tracking-wider block">
              {overallMetrics.isSafe ? 'Safe Bunk Allowance' : 'Required Lectures'}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono text-foreground">
                {overallMetrics.isSafe ? overallMetrics.bunkableClasses : overallMetrics.classesToAttend}
              </span>
              <span className="text-[13px] text-muted">
                {overallMetrics.isSafe ? 'classes can be missed' : 'consecutive needed'}
              </span>
            </div>
            <p className="text-[13px] text-secondary mt-1.5">
              {overallMetrics.statusText}
            </p>
          </div>

          {/* Metric 3: Interactive Simulator */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-secondary uppercase tracking-wider">Simulation</span>
                <span className="font-mono text-xs text-foreground font-semibold">Projected: {projectedPct}%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setSimulationType(simulationType === 'bunk' ? 'attend' : 'bunk')}
                  className="px-2.5 py-1 rounded bg-surface-elevated border border-border-subtle text-xs text-foreground hover:border-border cursor-pointer"
                >
                  If I {simulationType === 'bunk' ? 'skip' : 'attend'}:
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSimulationOffset(Math.max(0, simulationOffset - 1))}
                    className="p-1 rounded bg-surface-elevated text-secondary hover:text-foreground cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-foreground px-2">{simulationOffset}</span>
                  <button
                    onClick={() => setSimulationOffset(simulationOffset + 1)}
                    className="p-1 rounded bg-surface-elevated text-secondary hover:text-foreground cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-muted">lectures</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-divider-subtle flex justify-between items-center text-[12px] text-muted">
              <span>Projection status:</span>
              <span className="text-secondary font-mono font-medium">
                {projectedPct >= targetAttendance ? 'Meets Threshold' : 'Below Threshold'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="rounded-xl bg-surface border border-border-subtle p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Subject Ledger</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsReconfiguring(true);
                setShowOnboardingModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated text-xs font-medium text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit Attendance</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all attendance records to 0%? This will set attended and conducted classes to 0 for all subjects.')) {
                  resetAllAttendance();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated text-xs font-medium text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectList.map((subj) => {
            const subMetrics = calculateAttendanceMetrics(subj.attended, subj.total, targetAttendance);
            const dynamicFaculty = getFacultyForSubject(subj.subjectCode, userSection) || subj.faculty;
            return (
              <div
                key={subj.subjectCode}
                className="rounded-xl bg-surface border border-border-subtle p-5 flex flex-col justify-between hover:border-border transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground bg-surface-elevated px-2 py-0.5 rounded">
                          {subj.subjectCode}
                        </span>
                        <span className="text-[13px] text-secondary">{dynamicFaculty}</span>
                      </div>
                      <h4 className="text-[15px] font-semibold text-foreground mt-1.5">{subj.subjectName}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-foreground">
                        {subMetrics.currentPercentage}%
                      </span>
                      <div className="text-[12px] text-muted font-mono">
                        {subj.attended}/{subj.total}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface-elevated h-1 overflow-hidden my-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        subMetrics.isSafe
                          ? 'bg-emerald-500'
                          : subMetrics.statusBadge === 'critical'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, subMetrics.currentPercentage)}%` }}
                    />
                  </div>

                  <p className="text-[13px] text-secondary mt-1">
                    {subMetrics.isSafe ? (
                      <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                        ✓ Can miss {subMetrics.bunkableClasses} {subMetrics.bunkableClasses === 1 ? 'class' : 'classes'}
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium font-mono">
                        ⚠ Attend {subMetrics.classesToAttend} consecutive {subMetrics.classesToAttend === 1 ? 'class' : 'classes'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Interactive Controls */}
                <div className="mt-4 pt-3.5 border-t border-divider-subtle flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAttendance(subj.subjectCode, 'present')}
                      className="px-3 py-1.5 rounded-md bg-surface-elevated text-secondary hover:text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-muted" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => markAttendance(subj.subjectCode, 'absent')}
                      className="px-3 py-1.5 rounded-md bg-surface-elevated text-secondary hover:text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5 text-muted" />
                      <span>Absent</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSubjectCounts(subj.subjectCode, Math.max(0, subj.attended - 1), Math.max(0, subj.total - 1))}
                      title="Decrement"
                      className="p-1.5 rounded bg-surface-elevated text-muted hover:text-foreground cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateSubjectCounts(subj.subjectCode, subj.attended + 1, subj.total + 1)}
                      title="Increment"
                      className="p-1.5 rounded bg-surface-elevated text-muted hover:text-foreground cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => resetSubjectAttendance(subj.subjectCode)}
                      title="Reset subject"
                      className="p-1.5 rounded bg-surface-elevated text-muted hover:text-foreground ml-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
