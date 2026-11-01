import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  GitPullRequest
} from 'lucide-react';
import { useSectionVStore } from '../../lib/store.ts';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenContribute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenContribute
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, userSection, setUserSection } = useSectionVStore();

  // Lock document scrolling when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const root = document.documentElement;
    const rootOverflow = root.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      root.style.overflow = rootOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when expanding to desktop viewport
  useEffect(() => {
    const wideLayout = window.matchMedia('(min-width: 1024px)');
    const closeOnWideLayout = () => {
      if (wideLayout.matches) setMobileMenuOpen(false);
    };

    closeOnWideLayout();
    wideLayout.addEventListener('change', closeOnWideLayout);
    return () => wideLayout.removeEventListener('change', closeOnWideLayout);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'todo', label: 'Todo' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notes', label: 'Notes & Syllabus' },
    { id: 'faculty', label: 'Faculty Directory' }
  ];

  return (
    <>
      <header className={`${mobileMenuOpen ? 'fixed' : 'sticky'} top-0 inset-x-0 z-[60] w-full border-b border-border-subtle bg-nav-bg/95 backdrop-blur-md transition-colors`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-15">
            {/* Logo & Section V Brand (Far Left) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group select-none"
              >
                <span className="text-[16px] sm:text-[17px] font-bold tracking-tight text-foreground font-mono">
                  Section V
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-muted uppercase tracking-wider pl-1.5 border-l border-divider-subtle">
                  B.Tech AI & DS
                </span>
              </button>
            </div>

            {/* Right Side: All Navigation Links + Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 mr-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`px-3 py-1.5 text-[14px] font-medium transition-colors duration-150 outline-none select-none cursor-pointer border ${
                        isActive
                          ? 'bg-selected-bg text-selected-text font-bold border-selected-border shadow-xs'
                          : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Batch Selector (V1 | V2) */}
              <div
                className="inline-flex items-center bg-surface-secondary p-0.5 border border-border"
                title={`Section View: V${userSection === 'V1' ? '1' : '2'}`}
              >
                {(['V1', 'V2'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setUserSection(sec)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer select-none border ${
                      userSection === sec
                        ? 'bg-selected-bg text-selected-text border-selected-border shadow-xs'
                        : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Contribute PR Button */}
              <button
                onClick={onOpenContribute}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[14px] font-medium text-secondary hover:text-foreground hover:bg-surface-hover/60 transition-colors cursor-pointer select-none"
                title="Contribute notes, updates, or fixes"
              >
                <GitPullRequest className="w-4 h-4 text-muted shrink-0" />
                <span>Contribute</span>
              </button>

              {/* Theme Toggle (Dark / Light) */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-md text-secondary hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer select-none"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </button>

              {/* Mobile Menu Button (< lg) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden h-8.5 w-8.5 inline-flex items-center justify-center rounded-md text-secondary hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer select-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Navigation Drawer for screens below lg */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-14 sm:top-15 z-50 bg-background border-b border-border-subtle overflow-hidden">
          <div className="h-full overflow-y-auto px-5 py-6 space-y-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-[15px] font-medium transition-colors duration-150 outline-none cursor-pointer border ${
                      isActive
                        ? 'bg-selected-bg text-selected-text font-bold border-selected-border shadow-xs'
                        : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-divider-subtle mt-4 space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] text-secondary font-medium">Batch View</span>
                <div className="inline-flex items-center bg-surface-secondary p-0.5 border border-border">
                  {(['V1', 'V2'] as const).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setUserSection(sec)}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-colors cursor-pointer select-none border ${
                        userSection === sec
                          ? 'bg-selected-bg text-selected-text border-selected-border shadow-xs'
                          : 'text-secondary hover:text-foreground hover:bg-hover-bg border-transparent'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onOpenContribute();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[14px] font-medium bg-surface-elevated text-foreground border border-border-subtle hover:bg-surface-hover cursor-pointer"
              >
                <GitPullRequest className="w-4 h-4 text-muted" />
                <span>Contribute Content</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
