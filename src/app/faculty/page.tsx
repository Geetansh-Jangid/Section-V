import React, { useState } from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Search, 
  MessageSquare
} from 'lucide-react';
import facultyDataRaw from '../../data/faculty.json';
import crDataRaw from '../../data/cr.json';
import { Faculty, ClassRepresentative } from '../../lib/schemas.ts';

const facultyList = facultyDataRaw as Faculty[];
const crList = crDataRaw as ClassRepresentative[];

export const FacultyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = facultyList.filter((fac) => {
    const term = searchTerm.toLowerCase();
    const matchName = fac.name.toLowerCase().includes(term);
    const matchCabin = fac.cabin.toLowerCase().includes(term);
    const matchSubject = fac.subjects.some((s) => s.code.toLowerCase().includes(term) || s.name.toLowerCase().includes(term));
    return matchName || matchCabin || matchSubject;
  });

  return (
    <div className="space-y-6">
      {/* Page Heading & Search Outside Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[26px] font-semibold text-foreground tracking-tight">
          Faculty & CRs Info
        </h1>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty, cabin, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-surface border border-border-subtle text-[13.5px] text-foreground placeholder-muted focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
      </div>

      {/* Class Representatives Highlight Section */}
      <div>
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-secondary mb-3">
          Section V Class Representatives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {crList.map((cr) => (
            <div
              key={cr.id}
              className="rounded-xl bg-surface border border-border-subtle p-5 flex flex-col justify-between hover:border-border transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[17px] font-semibold text-foreground">{cr.name}</h4>
                    {cr.rollNo && (
                      <p className="text-[13px] text-secondary font-mono mt-0.5">Roll No: {cr.rollNo}</p>
                    )}
                    <p className="text-[12.5px] text-muted mt-0.5">{cr.section}</p>
                  </div>
                </div>

                {(cr.email || cr.phone) && (
                  <div className="mt-3.5 flex flex-wrap gap-3 text-[13px] text-secondary">
                    {cr.email && (
                      <a
                        href={`mailto:${cr.email}`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-muted" />
                        <span>{cr.email}</span>
                      </a>
                    )}
                    {cr.phone && (
                      <a
                        href={`tel:${cr.phone}`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-muted" />
                        <span>{cr.phone}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-divider-subtle flex items-center justify-between text-[12px]">
                <span className="text-muted">Academic Updates & Assistance</span>
                {cr.social?.whatsapp && (
                  <a
                    href={`https://wa.me/${cr.social.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[13px] text-secondary hover:text-foreground hover:underline font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty Directory Grid */}
      <div>
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-secondary mb-3">
          Professors & Instructors ({filteredFaculty.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((fac) => (
            <div
              key={fac.id}
              className="rounded-xl bg-surface border border-border-subtle p-5 flex flex-col justify-between hover:border-border transition-colors"
            >
              <div>
                <div>
                  <h4 className="text-[15.5px] font-semibold text-foreground">{fac.name}</h4>
                  <p className="text-[13px] text-secondary mt-0.5">
                    {fac.designation}
                    {fac.department ? ` · ${fac.department}` : ''}
                  </p>
                </div>

                {/* Cabin location badge */}
                {fac.cabin && (
                  <div className="mt-3 flex items-center gap-1.5 text-[13px]">
                    <MapPin className="w-3.5 h-3.5 text-muted" />
                    <span className="font-mono font-medium text-foreground">{fac.cabin}</span>
                  </div>
                )}

                {/* Subjects taught */}
                <div className="mt-3 space-y-1">
                  <span className="text-[11px] text-muted uppercase tracking-wider block">Subjects</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.subjects.map((sub) => (
                      <span
                        key={sub.code}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-elevated border border-border-subtle text-secondary"
                        title={sub.name}
                      >
                        {sub.code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {(fac.email || fac.officeHours) && (
                <div className="mt-4 pt-3 border-t border-divider-subtle flex items-center justify-between text-[12px] text-muted">
                  {fac.email ? (
                    <a
                      href={`mailto:${fac.email}`}
                      className="hover:text-foreground transition-colors truncate max-w-[180px]"
                    >
                      {fac.email}
                    </a>
                  ) : <span />}
                  {fac.officeHours && (
                    <span className="text-right font-mono text-[11.5px]">{fac.officeHours}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
