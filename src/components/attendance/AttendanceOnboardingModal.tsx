import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  ArrowRight,
  Check,
  Sliders,
  X,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSectionVStore } from '../../lib/store.ts';

interface AttendanceOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  isReconfigure?: boolean;
}

export const AttendanceOnboardingModal: React.FC<AttendanceOnboardingModalProps> = ({
  open,
  onClose,
  isReconfigure = false
}) => {
  const {
    attendance,
    targetAttendance,
    completeAttendanceOnboarding
  } = useSectionVStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [target, setTarget] = useState<number>(targetAttendance || 75);
  const [counts, setCounts] = useState<Record<string, { attended: number; total: number }>>({});

  useEffect(() => {
    if (open) {
      setTarget(targetAttendance || 75);
      const initialCounts: Record<string, { attended: number; total: number }> = {};
      Object.values(attendance).forEach((subj) => {
        initialCounts[subj.subjectCode] = {
          attended: subj.attended,
          total: subj.total
        };
      });
      setCounts(initialCounts);
      setStep(1);
    }
  }, [open, attendance, targetAttendance]);

  const handleUpdateCount = (code: string, field: 'attended' | 'total', delta: number) => {
    setCounts((prev) => {
      const current = prev[code] || { attended: 0, total: 0 };
      let newAttended = current.attended;
      let newTotal = current.total;

      if (field === 'attended') {
        newAttended = Math.max(0, current.attended + delta);
        if (newAttended > newTotal) newTotal = newAttended;
      } else {
        newTotal = Math.max(0, current.total + delta);
        if (newAttended > newTotal) newAttended = newTotal;
      }

      return {
        ...prev,
        [code]: { attended: newAttended, total: newTotal }
      };
    });
  };

  const handleDirectInput = (code: string, field: 'attended' | 'total', val: number) => {
    setCounts((prev) => {
      const current = prev[code] || { attended: 0, total: 0 };
      let newAttended = current.attended;
      let newTotal = current.total;

      if (field === 'attended') {
        newAttended = Math.max(0, val);
        if (newAttended > newTotal) newTotal = newAttended;
      } else {
        newTotal = Math.max(0, val);
        if (newAttended > newTotal) newAttended = newTotal;
      }

      return {
        ...prev,
        [code]: { attended: newAttended, total: newTotal }
      };
    });
  };

  const handleSave = () => {
    completeAttendanceOnboarding(counts, target);
    onClose();
  };

  const subjects = Object.values(attendance);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="attendance-onboarding-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={isReconfigure ? onClose : undefined}
        >
          <motion.div
            key="attendance-onboarding-content"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            data-modal-card="true"
            className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl bg-[#0d0d0d] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#1f1f1f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{isReconfigure ? 'Edit Baseline Attendance' : 'Attendance Setup'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-neutral-400 border border-[#282828]">
                      Step {step} of 2
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {step === 1
                      ? 'Set your target attendance and threshold.'
                      : 'Enter your current attended and total lectures per subject.'}
                  </p>
                </div>
              </div>

              {isReconfigure && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#121212] border border-[#222222] space-y-2">
                    <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Private & Client-Side Attendance Ledger</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Your attendance counts remain strictly on this device in your browser. Calculate bunk margins and mandatory lectures accurately.
                    </p>
                  </div>

                  <div>
                    <label className="text-neutral-200 font-semibold block mb-2 text-xs sm:text-sm">
                      Select Your Target Attendance:
                    </label>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[70, 75, 80, 85].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTarget(preset)}
                          className={`py-2.5 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            target === preset
                              ? 'bg-white text-black shadow-sm'
                              : 'bg-[#141414] border border-[#222222] text-neutral-300 hover:text-white hover:border-[#333333]'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>

                    {/* Custom Stepper */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#222222]">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs sm:text-sm text-neutral-300">Custom Target:</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTarget((t) => Math.max(50, t - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c1c1c] border border-[#2e2e2e] text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center bg-[#0d0d0d] border border-[#2e2e2e] rounded-lg px-2 py-1">
                          <input
                            type="number"
                            min={50}
                            max={100}
                            value={target}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) setTarget(Math.min(100, Math.max(50, val)));
                            }}
                            className="w-8 text-center text-xs sm:text-sm font-mono font-bold bg-transparent text-white outline-none"
                          />
                          <span className="text-xs font-mono text-neutral-500">%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTarget((t) => Math.min(100, t + 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c1c1c] border border-[#2e2e2e] text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                    <span>Subject</span>
                    <span className="font-mono">Attended / Total</span>
                  </div>

                  <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                    {subjects.map((subj) => {
                      const current = counts[subj.subjectCode] || { attended: subj.attended, total: subj.total };
                      const pct = current.total > 0 ? ((current.attended / current.total) * 100).toFixed(0) : '100';
                      const isSafe = Number(pct) >= target;

                      return (
                        <div
                          key={subj.subjectCode}
                          className="p-3 rounded-xl bg-[#121212] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-black border border-neutral-700 text-white">
                                {subj.subjectCode}
                              </span>
                              <span className="text-xs font-medium text-neutral-200 truncate max-w-[180px] sm:max-w-none">
                                {subj.subjectName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[11px] font-mono font-bold ${isSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {pct}%
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                ({isSafe ? `Eligible ≥ ${target}%` : `Below ${target}% target`})
                              </span>
                            </div>
                          </div>

                          {/* Steppers */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c1c1c]">
                            {/* Attended */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">
                                Attended
                              </span>
                              <div className="flex items-center gap-1 bg-[#181818] border border-[#2a2a2a] rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'attended', -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={current.attended}
                                  onChange={(e) => handleDirectInput(subj.subjectCode, 'attended', parseInt(e.target.value, 10) || 0)}
                                  className="w-8 text-center text-xs font-mono font-bold bg-transparent text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'attended', 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Total Conducted */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">
                                Total
                              </span>
                              <div className="flex items-center gap-1 bg-[#181818] border border-[#2a2a2a] rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'total', -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={current.total}
                                  onChange={(e) => handleDirectInput(subj.subjectCode, 'total', parseInt(e.target.value, 10) || 0)}
                                  className="w-8 text-center text-xs font-mono font-bold bg-transparent text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'total', 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-[#1f1f1f] bg-[#0c0c0c] shrink-0 flex items-center justify-between gap-3">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#282828] text-xs font-medium text-neutral-300 hover:text-white cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <span>Next: Set Counts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Start Tracking</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
