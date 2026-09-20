import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AttendanceHistoryEntry {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  note?: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  faculty: string;
  attended: number;
  total: number;
  history: AttendanceHistoryEntry[];
}

export interface HomeworkTask {
  id: string;
  title: string;
  subjectCode: string;
  dueDate: string;
  priority: 'urgent' | 'medium' | 'low';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface SlotOverride {
  isCancelled?: boolean;
  proxyFaculty?: string;
  roomChange?: string;
  note?: string;
}

export type SectionFilter = 'All' | 'V1' | 'V2';

interface SectionVStore {
  // Theme ('dark' | 'light')
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Contribute Modal
  isContributeModalOpen: boolean;
  setContributeModalOpen: (open: boolean) => void;

  // Target Attendance (Default 75%)
  targetAttendance: number;
  setTargetAttendance: (target: number) => void;

  // Selected Timetable Section Filter ('All' | 'V1' | 'V2')
  selectedSectionFilter: SectionFilter;
  setSelectedSectionFilter: (filter: SectionFilter) => void;

  // Subject Attendance Records
  attendance: Record<string, SubjectAttendance>;
  markAttendance: (subjectCode: string, status: 'present' | 'absent' | 'cancelled') => void;
  updateSubjectCounts: (subjectCode: string, attended: number, total: number) => void;
  resetSubjectAttendance: (subjectCode: string) => void;
  resetAllAttendance: () => void;

  // Personal Homework / Assignment Checklist
  tasks: HomeworkTask[];
  addTask: (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Proxy / Reschedule Overrides
  slotOverrides: Record<string, SlotOverride>;
  setSlotOverride: (slotId: string, override: SlotOverride) => void;
  clearSlotOverride: (slotId: string) => void;
  clearAllOverrides: () => void;

  // Attendance Onboarding
  hasCompletedAttendanceOnboarding: boolean;
  setHasCompletedAttendanceOnboarding: (completed: boolean) => void;
  completeAttendanceOnboarding: (baseline: Record<string, { attended: number; total: number }>, target: number) => void;

  // Navigation tab state (dashboard, timetable, todo, notes, faculty, attendance)
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DEFAULT_SUBJECTS: Record<string, SubjectAttendance> = {
  'M': {
    subjectCode: 'M',
    subjectName: 'Mathematics',
    faculty: 'Prof. G.C. Sharma (GC)',
    attended: 27,
    total: 32,
    history: []
  },
  'DE': {
    subjectCode: 'DE',
    subjectName: 'Digital Electronics',
    faculty: 'Prof. R.S. Evans (RSE)',
    attended: 25,
    total: 30,
    history: []
  },
  'PPS': {
    subjectCode: 'PPS',
    subjectName: 'Programming for Problem Solving',
    faculty: 'Prof. G.S. Rathore (GS)',
    attended: 31,
    total: 34,
    history: []
  },
  'FCSEH': {
    subjectCode: 'FCSEH',
    subjectName: 'Foundation Course in Science, Ethics & Human Values',
    faculty: 'Dr. S. Mukherjee (SM)',
    attended: 22,
    total: 25,
    history: []
  },
  'CH': {
    subjectCode: 'CH',
    subjectName: 'Engineering Chemistry',
    faculty: 'Dr. S.H. Khan (SHK)',
    attended: 26,
    total: 32,
    history: []
  },
  'CSK': {
    subjectCode: 'CSK',
    subjectName: 'Communication Skills',
    faculty: 'Prof. S.H. Bhatia (SHB)',
    attended: 19,
    total: 22,
    history: []
  }
};

const DEFAULT_TASKS: HomeworkTask[] = [
  {
    id: 'task-1',
    title: 'PPS Lab: Dynamic Memory & Linked List Implementation (CF-02)',
    subjectCode: 'PPS',
    dueDate: '2026-09-23',
    priority: 'urgent',
    completed: false,
    notes: 'Verify with test cases before submission to Prof. NK / GS',
    createdAt: '2026-09-18'
  },
  {
    id: 'task-2',
    title: 'Digital Electronics Assignment 2: Karnaugh Map 4-Variable Minimization',
    subjectCode: 'DE',
    dueDate: '2026-09-25',
    priority: 'medium',
    completed: false,
    notes: 'Submit circuit schematics in CT-12',
    createdAt: '2026-09-19'
  },
  {
    id: 'task-3',
    title: 'Chemistry Lab Journal: Water Hardness Titration Calculations',
    subjectCode: 'CH',
    dueDate: '2026-09-26',
    priority: 'low',
    completed: true,
    notes: 'Checked and signed by Prof. RV / SHK',
    createdAt: '2026-09-16'
  }
];

export const useSectionVStore = create<SectionVStore>()(
  persist(
    (set) => ({
      targetAttendance: 75,
      setTargetAttendance: (target) => set({ targetAttendance: target }),

      selectedSectionFilter: 'All',
      setSelectedSectionFilter: (filter) => set({ selectedSectionFilter: filter }),

      attendance: DEFAULT_SUBJECTS,

      markAttendance: (subjectCode, status) => {
        set((state) => {
          const current = state.attendance[subjectCode] || {
            subjectCode,
            subjectName: subjectCode,
            faculty: 'Faculty',
            attended: 0,
            total: 0,
            history: []
          };

          const newAttended = status === 'present' ? current.attended + 1 : current.attended;
          const newTotal = status === 'cancelled' ? current.total : current.total + 1;

          const entry: AttendanceHistoryEntry = {
            id: `att-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            status
          };

          return {
            attendance: {
              ...state.attendance,
              [subjectCode]: {
                ...current,
                attended: newAttended,
                total: newTotal,
                history: [entry, ...current.history].slice(0, 50)
              }
            }
          };
        });
      },

      updateSubjectCounts: (subjectCode, attended, total) => {
        set((state) => {
          const current = state.attendance[subjectCode] || {
            subjectCode,
            subjectName: subjectCode,
            faculty: 'Faculty',
            attended: 0,
            total: 0,
            history: []
          };

          return {
            attendance: {
              ...state.attendance,
              [subjectCode]: {
                ...current,
                attended: Math.max(0, attended),
                total: Math.max(attended, total)
              }
            }
          };
        });
      },

      resetSubjectAttendance: (subjectCode) => {
        set((state) => {
          if (!state.attendance[subjectCode]) return state;
          return {
            attendance: {
              ...state.attendance,
              [subjectCode]: {
                ...state.attendance[subjectCode],
                attended: 0,
                total: 0,
                history: []
              }
            }
          };
        });
      },

      resetAllAttendance: () => {
        set({ attendance: DEFAULT_SUBJECTS });
      },

      tasks: DEFAULT_TASKS,

      addTask: (taskData) => {
        const newTask: HomeworkTask = {
          ...taskData,
          id: `task-${Date.now()}`,
          completed: false,
          createdAt: new Date().toISOString().split('T')[0]
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }));
      },

      slotOverrides: {},

      setSlotOverride: (slotId, override) => {
        set((state) => ({
          slotOverrides: {
            ...state.slotOverrides,
            [slotId]: {
              ...state.slotOverrides[slotId],
              ...override
            }
          }
        }));
      },

      clearSlotOverride: (slotId) => {
        set((state) => {
          const next = { ...state.slotOverrides };
          delete next[slotId];
          return { slotOverrides: next };
        });
      },

      clearAllOverrides: () => {
        set({ slotOverrides: {} });
      },

      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      hasCompletedAttendanceOnboarding: false,
      setHasCompletedAttendanceOnboarding: (completed) => set({ hasCompletedAttendanceOnboarding: completed }),
      completeAttendanceOnboarding: (baseline, target) => {
        set((state) => {
          const updatedAttendance = { ...state.attendance };
          Object.entries(baseline).forEach(([code, counts]) => {
            if (updatedAttendance[code]) {
              updatedAttendance[code] = {
                ...updatedAttendance[code],
                attended: Math.max(0, counts.attended),
                total: Math.max(counts.attended, counts.total)
              };
            }
          });

          return {
            attendance: updatedAttendance,
            targetAttendance: target,
            hasCompletedAttendanceOnboarding: true
          };
        });
      },

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      isContributeModalOpen: false,
      setContributeModalOpen: (open) => set({ isContributeModalOpen: open })
    }),
    {
      name: 'section-v-portal-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        targetAttendance: state.targetAttendance,
        selectedSectionFilter: state.selectedSectionFilter,
        attendance: state.attendance,
        tasks: state.tasks,
        slotOverrides: state.slotOverrides,
        hasCompletedAttendanceOnboarding: state.hasCompletedAttendanceOnboarding
      })
    }
  )
);
