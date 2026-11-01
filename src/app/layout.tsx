import React, { useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar.tsx';
import { ContributeModal } from '../components/shared/ContributeModal.tsx';
import { 
  GitBranch, 
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

  // Lock body scroll when contribute modal is open
  useEffect(() => {
    if (isContributeModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isContributeModalOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent-bg selection:text-foreground">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenContribute={() => setContributeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1600px]">
        {children}
      </main>

      {/* Global Contribute Modal */}
      <ContributeModal
        open={isContributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
      />

      {/* Minimal Technical Footer */}
      <footer className="border-t border-border-subtle bg-surface/50 py-6 text-sm text-secondary">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Section V</span>
              <span className="text-muted">·</span>
              <span className="font-mono text-sm text-secondary">
                AI & DS · Batches V1 & V2
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://github.com/Geetansh-Jangid/Section-V"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-secondary hover:text-foreground transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
