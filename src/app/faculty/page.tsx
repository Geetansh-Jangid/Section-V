import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Search, 
  Copy, 
  Check, 
  MessageSquare
} from 'lucide-react';
import facultyDataRaw from '../../data/faculty.json';
import crDataRaw from '../../data/cr.json';
import { Faculty, ClassRepresentative } from '../../lib/schemas.ts';

const facultyList = facultyDataRaw as Faculty[];
const crList = crDataRaw as ClassRepresentative[];

export const FacultyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFaculty = facultyList.filter((fac) => {
    const term = searchTerm.toLowerCase();
    const matchName = fac.name.toLowerCase().includes(term);
    const matchCabin = fac.cabin.toLowerCase().includes(term);
    const matchSubject = fac.subjects.some((s) => s.code.toLowerCase().includes(term) || s.name.toLowerCase().includes(term));
    return matchName || matchCabin || matchSubject;
  });

  const copyCabin = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Faculty & Student Directory
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Professor office cabins, consultation hours, and Section V Class Representatives.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search faculty or cabin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#121212] border border-[#222222] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Class Representatives Highlight Section */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Section V Class Representatives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {crList.map((cr) => (
            <div
              key={cr.id}
              className="rounded-lg bg-[#0d0d0d] border border-[#222222] p-4 flex flex-col justify-between hover:border-[#333333] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black">
                      {cr.role}
                    </span>
                    <h4 className="text-base font-semibold text-white mt-1.5">{cr.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">Roll No: {cr.rollNo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-neutral-400 block">{cr.officeHours}</span>
                    <span className="text-[10px] text-neutral-500">Available</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
                  <a
                    href={`mailto:${cr.email}`}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{cr.email}</span>
                  </a>
                  <a
                    href={`tel:${cr.phone}`}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{cr.phone}</span>
                  </a>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1c1c1c] flex items-center justify-between text-xs">
                <span className="text-neutral-500 text-[11px]">Academic Grievances</span>
                {cr.social?.whatsapp && (
                  <a
                    href={`https://wa.me/${cr.social.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white font-medium"
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Professors & Instructors ({filteredFaculty.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFaculty.map((fac) => (
            <div
              key={fac.id}
              className="rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] p-4 flex flex-col justify-between hover:border-[#2a2a2a] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{fac.name}</h4>
                    <p className="text-xs text-neutral-400">{fac.designation} · {fac.department}</p>
                  </div>

                  {/* Copy cabin button */}
                  <button
                    onClick={() => copyCabin(fac.id, fac.cabin)}
                    className="p-1.5 rounded bg-[#141414] border border-[#262626] text-neutral-400 hover:text-white transition-colors shrink-0"
                    title="Copy cabin number"
                  >
                    {copiedId === fac.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Cabin location badge */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono font-medium text-neutral-200">{fac.cabin}</span>
                </div>

                {/* Subjects taught */}
                <div className="mt-2.5 space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Subjects</span>
                  <div className="flex flex-wrap gap-1">
                    {fac.subjects.map((sub) => (
                      <span
                        key={sub.code}
                        className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#141414] border border-[#222222] text-neutral-300"
                        title={sub.name}
                      >
                        {sub.code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1c1c1c] flex items-center justify-between text-[11px] text-neutral-400">
                <a
                  href={`mailto:${fac.email}`}
                  className="hover:text-white transition-colors truncate max-w-[180px]"
                >
                  {fac.email}
                </a>
                <span>{fac.officeHours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
