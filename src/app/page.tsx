import React from 'react';
import { TimetableSection } from '../components/timetable/TimetableSection.tsx';
import { ActiveClassCard } from '../components/bento/ActiveClassCard.tsx';
import { AttendanceWidget } from '../components/bento/AttendanceWidget.tsx';
import { HomeworkWidget } from '../components/bento/HomeworkWidget.tsx';
import { QuickAnnounce } from '../components/bento/QuickAnnounce.tsx';
import { QuickLinks } from '../components/bento/QuickLinks.tsx';

interface PageProps {
  onNavigate: (tab: string) => void;
  onOpenContributeModal: () => void;
}

export const DashboardPage: React.FC<PageProps> = ({ onNavigate, onOpenContributeModal }) => {
  return (
    <div className="space-y-6">
      {/* 1. FIRST SECTION: Timetable with V1 / V2 Filter */}
      <TimetableSection />

      {/* 2. SECONDARY SECTION: Bento Grid of Core Academic Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Class Live Status */}
        <ActiveClassCard />

        {/* 75% Attendance Health */}
        <AttendanceWidget onNavigateToCalculator={() => onNavigate('attendance')} />

        {/* Homework & Lab Assignment Checklist */}
        <HomeworkWidget />

        {/* Official Bulletins & Circulars */}
        <QuickAnnounce onOpenContributeModal={onOpenContributeModal} />
      </div>

      {/* 3. TERTIARY SECTION: Institute Portals */}
      <QuickLinks />
    </div>
  );
};
