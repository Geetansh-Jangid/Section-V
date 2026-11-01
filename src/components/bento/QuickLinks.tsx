import React from 'react';
import { 
  ExternalLink, 
  Globe, 
  BookOpen, 
  GraduationCap, 
  Wifi, 
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
  Globe
};

export const QuickLinks: React.FC = () => {
  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted" />
          <h3 className="text-[13px] font-medium text-secondary uppercase tracking-wide">
            Campus Portals
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {linksData.campusPortals.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Link2;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group p-3 rounded-lg border border-border-subtle hover:border-border hover:bg-surface-elevated/40 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-2">
                  <IconComponent className="w-4 h-4 text-secondary group-hover:text-foreground transition-colors" />
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-foreground transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-muted truncate mt-0.5">{item.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
