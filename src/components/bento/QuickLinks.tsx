import React from 'react';
import { 
  ExternalLink, 
  Globe, 
  BookOpen, 
  GraduationCap, 
  Wifi, 
  Github, 
  Layers,
  Link2,
  LucideIcon
} from 'lucide-react';
import linksDataRaw from '../../data/links.json';
import { LinksConfig } from '../../lib/schemas.ts';

const linksData = linksDataRaw as LinksConfig;

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Layers,
  Wifi,
  Github,
  Globe
};

export const QuickLinks: React.FC = () => {
  return (
    <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 flex flex-col justify-between hover:border-[#333333] transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Campus Portals
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">src/data/links.json</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {linksData.campusPortals.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Link2;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group p-2.5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-[#333333] hover:bg-[#161616] transition-colors flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-2">
                  <IconComponent className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-neutral-200 group-hover:text-white truncate transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">{item.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#1c1c1c] flex items-center justify-between text-[11px] text-neutral-500">
        <span>Single Sign-On with Institute Email</span>
        <a 
          href="https://github.com/Geetansh-Jangid/Section-V" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-neutral-300 transition-colors flex items-center gap-1"
        >
          <Github className="w-3 h-3" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
};
