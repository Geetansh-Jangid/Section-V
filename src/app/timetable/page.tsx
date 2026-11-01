import React from 'react';
import { TimetableSection } from '../../components/timetable/TimetableSection.tsx';

export const TimetablePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-[26px] font-semibold text-foreground tracking-tight">
        Timetable
      </h1>
      <TimetableSection />
    </div>
  );
};
