import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar.tsx';
import { CommandPalette } from '../components/command/CommandPalette.tsx';
import { ContributeModal } from '../components/shared/ContributeModal.tsx';
import { 
  GitBranch, 
  Terminal, 
  Code,
  Github
} from 'lucide-react';
import linksDataRaw from '../data/links.json';
import { LinksConfig } from '../lib/schemas.ts';
import { useSectionVStore } from '../lib/store.ts';

const linksData = linksDataRaw as LinksConfig;

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const RootLayout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onSelectTab
}) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const { theme, isContributeModalOpen, setContributeModalOpen } = useSectionVStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-neutral-800 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenContribute={() => setContributeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Global Command Palette & Contribute Modal */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={onSelectTab}
        onOpenContributeModal={() => setContributeModalOpen(true)}
      />

      <ContributeModal
        open={isContributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
      />

      {/* Minimal Technical Footer */}
      <footer className="border-t border-[#1a1a1a] bg-black py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-300">Section V</span>
              <span className="text-neutral-600">·</span>
              <span className="font-mono text-[11px] text-neutral-400">
                CSE AI · Batches V1 & V2
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <button
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#111111] border border-[#222222] text-neutral-300 hover:text-white"
              >
                <Terminal className="w-3 h-3 text-neutral-400" />
                <span>⌘K Search</span>
              </button>
              <a
                href={linksData.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => setContributeModalOpen(true)}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
              >
                <Code className="w-3 h-3" />
                <span>Submit Edit</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
