import React from 'react';
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
      {/* Core Academic Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Class Live Status */}
        <ActiveClassCard />

        {/* Attendance Health */}
        <AttendanceWidget onNavigateToCalculator={() => onNavigate('attendance')} />

        {/* Tasks Section */}
        <HomeworkWidget onNavigateToTodo={() => onNavigate('todo')} />

        {/* Notifications */}
        <QuickAnnounce onOpenContributeModal={onOpenContributeModal} />
      </div>

      {/* Campus Portals & Quick Links */}
      <QuickLinks />
    </div>
  );
};
