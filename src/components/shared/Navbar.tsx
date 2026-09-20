import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  Users,
  ShieldCheck,
  Search,
  GitPullRequest,
  Menu,
  X,
  LayoutGrid,
  Sun,
  Moon,
  CheckSquare,
  Layers
} from 'lucide-react';
import { useSectionVStore } from '../../lib/store.ts';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCommand: () => void;
  onOpenContribute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCommand,
  onOpenContribute
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, userSection, setUserSection } = useSectionVStore();

  // The menu already owns the viewport. Lock document scrolling without fixing
  // the body, which can move a sticky header off-screen in Firefox Android.
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

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'todo', label: 'Todo', icon: CheckSquare },
    { id: 'attendance', label: 'Attendance', icon: ShieldCheck },
    { id: 'notes', label: 'Notes & Syllabus', icon: BookOpen },
    { id: 'faculty', label: 'Faculty Directory', icon: Users }
  ];

  return (
    <>
      <header className="sticky top-0 z-[60] w-full border-b border-[#1f1f1f] bg-black/95 backdrop-blur-md transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Section V Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  Section V
                </span>
              </div>
            </button>
          </div>

          {/* Desktop navigation is reserved for wide layouts; smaller widths use the menu. */}
          <nav className="hidden min-[1460px]:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 outline-none select-none cursor-pointer ${
                    isActive
                      ? 'bg-[#222222] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121212]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Cmd+K Search trigger */}
            <button
              onClick={onOpenCommand}
              className="h-9 inline-flex items-center gap-2 px-3 rounded-md bg-[#0f0f0f] border border-[#222222] text-sm text-neutral-400 hover:text-white hover:border-[#333333] transition-colors cursor-pointer select-none"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono leading-none bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Batch / Section Corner Toggle (V1 | V2) - Desktop only; mobile lives in hamburger menu */}
            <div
              className="hidden min-[1460px]:inline-flex h-9 items-center rounded-md bg-[#0f0f0f] border border-[#222222] overflow-hidden"
              title={`Your Section: V${userSection === 'V1' ? '1' : '2'} · Switch to show your batch by default`}
            >
              <div className="flex items-center p-0.5">
                {(['V1', 'V2'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setUserSection(sec)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer select-none ${
                      userSection === sec
                        ? 'bg-white text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Contribute PR button */}
            <button
              onClick={onOpenContribute}
              className="hidden sm:inline-flex h-9 items-center gap-2 px-3 rounded-md bg-[#0f0f0f] border border-[#222222] text-sm font-medium text-neutral-300 hover:text-white hover:border-[#333333] transition-colors cursor-pointer select-none"
            >
              <GitPullRequest className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Contribute</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-[#0f0f0f] border border-[#222222] text-neutral-400 hover:text-white hover:border-[#333333] transition-colors cursor-pointer select-none"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5 text-neutral-300" />}
            </button>

            {/* Hamburger menu is used below the wide desktop navigation breakpoint. */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="min-[1460px]:hidden h-9 w-9 inline-flex items-center justify-center rounded-md bg-[#0f0f0f] border border-[#222222] text-neutral-300 hover:text-white hover:border-[#333333] cursor-pointer select-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      </header>

      {/* Hamburger menu dropdown for layouts below 1460px. */}
      {mobileMenuOpen && (
        <div className="min-[1460px]:hidden fixed inset-x-0 bottom-0 top-16 z-50 bg-black overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 outline-none cursor-pointer ${
                    isActive
                      ? 'bg-[#222222] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#111111]'
                  }`}
                >
                  <Icon className="w-5 h-5 text-neutral-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-4 border-t border-[#1a1a1a] mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 bg-[#111111] border border-[#222222] rounded-lg px-3 py-2.5">
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Batch View</span>
                </span>
                <div className="flex items-center p-1 rounded-lg bg-[#0f0f0f] border border-[#222222]">
                  {(['V1', 'V2'] as const).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setUserSection(sec)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer select-none ${
                        userSection === sec
                          ? 'bg-white text-black'
                          : 'text-neutral-400 hover:text-white'
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-[#111111] text-neutral-300 border border-[#222222] hover:text-white cursor-pointer"
              >
                <GitPullRequest className="w-4 h-4 text-neutral-400" />
                <span>Submit Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
