/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RootLayout } from './app/layout.tsx';
import { DashboardPage } from './app/page.tsx';
import { TimetablePage } from './app/timetable/page.tsx';
import { AttendanceCalc } from './components/attendance/AttendanceCalc.tsx';
import { NotesPage } from './app/notes/page.tsx';
import { FacultyPage } from './app/faculty/page.tsx';
import { TodoPage } from './app/todo/page.tsx';
import { useSectionVStore } from './lib/store.ts';

export default function App() {
  const { activeTab, setActiveTab, setContributeModalOpen } = useSectionVStore();

  // Sync with URL hash for clean navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'timetable', 'todo', 'attendance', 'notes', 'faculty'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveTab]);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab === 'dashboard' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RootLayout activeTab={activeTab} onSelectTab={handleSelectTab}>
      {activeTab === 'dashboard' && (
        <DashboardPage
          onNavigate={handleSelectTab}
          onOpenContributeModal={() => setContributeModalOpen(true)}
        />
      )}

      {activeTab === 'timetable' && <TimetablePage />}

      {activeTab === 'todo' && <TodoPage />}

      {activeTab === 'attendance' && <AttendanceCalc />}

      {activeTab === 'notes' && (
        <NotesPage onOpenContributeModal={() => setContributeModalOpen(true)} />
      )}

      {activeTab === 'faculty' && <FacultyPage />}
    </RootLayout>
  );
}
