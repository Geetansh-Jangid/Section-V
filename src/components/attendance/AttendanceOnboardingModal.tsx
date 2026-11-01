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
import { createPortal } from 'react-dom';
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

  // Keep the first-run setup consistent with the other global dialogs: the
  // backdrop lives at the document root and the page cannot scroll beneath it.
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

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

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="attendance-onboarding-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs"
          style={{ minHeight: '100dvh' }}
          onClick={isReconfigure ? onClose : undefined}
        >
          <div className="h-full overflow-y-auto overscroll-contain flex p-3 sm:p-4">
            <motion.div
              key="attendance-onboarding-content"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              data-modal-card="true"
              className="w-full max-w-[calc(100dvw-1.5rem)] sm:max-w-xl md:max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh] m-auto"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-border-subtle shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Edit Attendance
                </h3>
              </div>

              {isReconfigure && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5">
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-secondary font-semibold block mb-2 text-xs sm:text-sm">
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
                              ? 'bg-foreground text-background font-semibold shadow-xs'
                              : 'bg-surface-elevated border border-border-subtle text-secondary hover:text-foreground hover:bg-surface-hover'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>

                    {/* Custom Stepper */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-border-subtle">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-muted" />
                        <span className="text-xs sm:text-sm text-secondary">Custom Target:</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTarget((t) => Math.max(50, t - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border-subtle text-secondary hover:text-foreground cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center bg-surface border border-border-subtle rounded-lg px-2 py-1">
                          <input
                            type="number"
                            min={50}
                            max={100}
                            value={target}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) setTarget(Math.min(100, Math.max(50, val)));
                            }}
                            className="w-8 text-center text-xs sm:text-sm font-mono font-bold bg-transparent text-foreground outline-none"
                          />
                          <span className="text-xs font-mono text-muted">%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTarget((t) => Math.min(100, t + 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border-subtle text-secondary hover:text-foreground cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted px-1">
                    <span>Subject</span>
                    <span className="font-mono">Attended / Total</span>
                  </div>

                  <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {subjects.map((subj) => {
                      const current = counts[subj.subjectCode] || { attended: subj.attended, total: subj.total };
                      const pct = current.total > 0 ? ((current.attended / current.total) * 100).toFixed(0) : '0';
                      const isSafe = current.total === 0 ? true : Number(pct) >= target;

                      return (
                        <div
                          key={subj.subjectCode}
                          className="p-3 rounded-xl bg-surface-elevated/40 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-foreground">
                                {subj.subjectCode}
                              </span>
                              <span className="text-xs font-medium text-foreground truncate max-w-[180px] sm:max-w-none">
                                {subj.subjectName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-bold text-foreground">
                                {pct}%
                              </span>
                              <span className="text-[10px] text-muted font-mono">
                                ({isSafe ? `Eligible ≥ ${target}%` : `Below ${target}% target`})
                              </span>
                            </div>
                          </div>

                          {/* Steppers */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                            {/* Attended */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-muted font-semibold mb-0.5">
                                Attended
                              </span>
                              <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'attended', -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={current.attended}
                                  onChange={(e) => handleDirectInput(subj.subjectCode, 'attended', parseInt(e.target.value, 10) || 0)}
                                  className="w-8 text-center text-xs font-mono font-bold bg-transparent text-foreground outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'attended', 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Total Conducted */}
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] uppercase tracking-wider text-muted font-semibold mb-0.5">
                                Total
                              </span>
                              <div className="flex items-center gap-1 bg-surface border border-border-subtle rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'total', -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={current.total}
                                  onChange={(e) => handleDirectInput(subj.subjectCode, 'total', parseInt(e.target.value, 10) || 0)}
                                  className="w-8 text-center text-xs font-mono font-bold bg-transparent text-foreground outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCount(subj.subjectCode, 'total', 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer"
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
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-border-subtle bg-surface-elevated/40 shrink-0 flex items-center justify-between gap-3">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface border border-border-subtle text-xs font-medium text-secondary hover:text-foreground cursor-pointer"
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
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs"
                >
                  <span>Next: Set Counts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Start Tracking</span>
                </button>
              )}
            </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
