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
import { AttendanceOnboardingModal } from './AttendanceOnboardingModal.tsx';

export const AttendanceCalc: React.FC = () => {
  const {
    attendance,
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
      {/* Attendance Onboarding / Reconfigure Modal */}
      <AttendanceOnboardingModal
        open={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        isReconfigure={isReconfiguring}
      />

      {/* Top Banner Overview */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                {targetAttendance}% Attendance & Bunk Margin
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Private local attendance register. Calculate how many classes you can afford to miss or need to attend.
            </p>
          </div>

          {/* Custom Target Percentage Setter */}
          <div className="flex flex-wrap items-center gap-2 bg-[#121212] p-1.5 rounded-lg border border-[#222222]">
            <div className="flex items-center gap-1.5 pl-1">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">Target:</span>
            </div>

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
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    targetAttendance === val
                      ? 'bg-white text-black font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            {/* Custom Stepper & Input */}
            <div className="flex items-center gap-1 pl-1 border-l border-[#222222]">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(50, targetAttendance - 1);
                  setTargetAttendance(next);
                }}
                className="w-6 h-6 flex items-center justify-center rounded bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                title="Decrease target by 1%"
              >
                <Minus className="w-3 h-3" />
              </button>

              <div className="flex items-center bg-[#0d0d0d] border border-[#2a2a2a] rounded px-1.5 py-0.5">
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
                  className="w-8 text-center text-xs font-mono font-semibold bg-transparent text-white outline-none focus:text-white"
                />
                <span className="text-[11px] font-mono text-neutral-500">%</span>
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
                className="w-6 h-6 flex items-center justify-center rounded bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                title="Increase target by 1%"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Big Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {/* Card 1: Current Overall */}
          <div className="p-4 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Overall Ratio</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-bold text-white tracking-tight">{overallMetrics.currentPercentage}%</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                overallMetrics.isSafe 
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-800'
              }`}>
                {overallMetrics.isSafe ? 'Exam Eligible' : 'Debar Risk'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-mono">
              {overallMetrics.totalAttended} attended / {overallMetrics.totalConducted} conducted
            </p>
          </div>

          {/* Card 2: Bunkable / Attend Requirement */}
          <div className="p-4 rounded-lg bg-[#111111] border border-[#1f1f1f]">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {overallMetrics.isSafe ? 'Safe Bunk Allowance' : 'Required Lectures'}
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className={`text-3xl font-bold tracking-tight ${overallMetrics.isSafe ? 'text-white' : 'text-amber-400'}`}>
                {overallMetrics.isSafe ? overallMetrics.bunkableClasses : overallMetrics.classesToAttend}
              </span>
              <span className="text-xs text-neutral-400">
                {overallMetrics.isSafe ? 'classes can be missed' : 'consecutive needed'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {overallMetrics.statusText}
            </p>
          </div>

          {/* Card 3: Interactive Simulator */}
          <div className="p-4 rounded-lg bg-[#111111] border border-[#1f1f1f] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Simulation</span>
                <span className="font-mono text-xs text-neutral-200">Projected: {projectedPct}%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setSimulationType(simulationType === 'bunk' ? 'attend' : 'bunk')}
                  className="px-2 py-1 rounded bg-[#181818] border border-[#2a2a2a] text-xs text-neutral-200 hover:text-white"
                >
                  If I {simulationType === 'bunk' ? 'skip' : 'attend'}:
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSimulationOffset(Math.max(0, simulationOffset - 1))}
                    className="p-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-white px-2">{simulationOffset}</span>
                  <button
                    onClick={() => setSimulationOffset(simulationOffset + 1)}
                    className="p-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-300 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-neutral-400">lectures</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#1c1c1c] flex justify-between items-center text-[11px] text-neutral-400">
              <span>Projection status:</span>
              <span className={projectedPct >= targetAttendance ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {projectedPct >= targetAttendance ? 'Meets Threshold' : 'Below Threshold'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Subject Ledger</h3>
            <p className="text-xs text-neutral-400">Log presence or absence per subject.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsReconfiguring(true);
                setShowOnboardingModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] border border-[#222222] text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Settings2 className="w-3 h-3" />
              <span>Edit Baseline</span>
            </button>
            <button
              onClick={resetAllAttendance}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] border border-[#222222] text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjectList.map((subj) => {
            const subMetrics = calculateAttendanceMetrics(subj.attended, subj.total, targetAttendance);
            return (
              <div
                key={subj.subjectCode}
                className="rounded-lg bg-[#111111] border border-[#1f1f1f] p-4 flex flex-col justify-between hover:border-[#2a2a2a] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-black border border-neutral-700 px-1.5 py-0.2 rounded">
                          {subj.subjectCode}
                        </span>
                        <span className="text-xs text-neutral-400">{subj.faculty}</span>
                      </div>
                      <h4 className="text-sm font-medium text-neutral-100 mt-1">{subj.subjectName}</h4>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-bold font-mono ${subMetrics.isSafe ? 'text-white' : 'text-amber-400'}`}>
                        {subMetrics.currentPercentage}%
                      </span>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {subj.attended}/{subj.total}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#181818] h-1.5 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        subMetrics.isSafe ? 'bg-white' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, subMetrics.currentPercentage)}%` }}
                    />
                  </div>

                  <p className="text-xs text-neutral-400 mt-1.5">
                    {subMetrics.isSafe ? (
                      <span className="text-emerald-400 font-medium">
                        ✓ Can miss {subMetrics.bunkableClasses} classes
                      </span>
                    ) : (
                      <span className="text-rose-400 font-medium">
                        ⚠ Attend {subMetrics.classesToAttend} consecutive classes
                      </span>
                    )}
                  </p>
                </div>

                {/* Interactive Controls */}
                <div className="mt-3 pt-3 border-t border-[#1c1c1c] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => markAttendance(subj.subjectCode, 'present')}
                      className="px-2 py-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => markAttendance(subj.subjectCode, 'absent')}
                      className="px-2 py-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Absent</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSubjectCounts(subj.subjectCode, Math.max(0, subj.attended - 1), Math.max(0, subj.total - 1))}
                      title="Decrement"
                      className="p-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateSubjectCounts(subj.subjectCode, subj.attended + 1, subj.total + 1)}
                      title="Increment"
                      className="p-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => resetSubjectAttendance(subj.subjectCode)}
                      title="Reset subject"
                      className="p-1 rounded bg-[#181818] border border-[#2a2a2a] text-neutral-400 hover:text-white ml-0.5"
                    >
                      <RotateCcw className="w-3 h-3" />
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
