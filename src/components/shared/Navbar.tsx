import React, { useState } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Search, 
  GitPullRequest, 
  Menu, 
  X, 
  LayoutGrid
} from 'lucide-react';

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

  const navItems = [
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'attendance', label: '75% Attendance', icon: ShieldCheck },
    { id: 'notes', label: 'Notes & Syllabus', icon: BookOpen },
    { id: 'faculty', label: 'Faculty Directory', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f1f1f] bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Section V Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('timetable')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-mono font-bold text-xs">
                V
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  Section V
                </span>
                <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                  AI · V1 & V2
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links - Shown ONLY at >= 1200px as requested */}
          <nav className="hidden min-[1200px]:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a]'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121212]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-neutral-400" />
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
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#0f0f0f] border border-[#222222] text-xs text-neutral-400 hover:text-white hover:border-[#333333] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Contribute PR button */}
            <button
              onClick={onOpenContribute}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0f0f0f] border border-[#222222] text-xs font-medium text-neutral-300 hover:text-white hover:border-[#333333] transition-colors"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px]">Contribute</span>
            </button>

            {/* Hamburger Menu Toggle - Shown at < 1200px as explicitly requested */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="min-[1200px]:hidden p-1.5 rounded-md bg-[#0f0f0f] border border-[#222222] text-neutral-300 hover:text-white hover:border-[#333333]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Menu Dropdown for < 1200px */}
      {mobileMenuOpen && (
        <div className="min-[1200px]:hidden border-b border-[#1f1f1f] bg-[#080808] px-4 pt-2 pb-4 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#171717] text-white border border-[#262626]'
                    : 'text-neutral-400 hover:text-white hover:bg-[#111111]'
                }`}
              >
                <Icon className="w-4 h-4 text-neutral-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1a1a1a] mt-2">
            <button
              onClick={() => {
                onOpenContribute();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-[#111111] text-neutral-300 border border-[#222222] hover:text-white"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-neutral-400" />
              <span>Submit Contribution / Edit</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
