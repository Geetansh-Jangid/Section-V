import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, X, ArrowLeft, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import announcementsDataRaw from '../../data/announcements.json';
import { Announcement } from '../../lib/schemas.ts';

const announcements = announcementsDataRaw as Announcement[];

interface QuickAnnounceProps {
  onOpenContributeModal?: () => void;
}

export const QuickAnnounce: React.FC<QuickAnnounceProps> = () => {
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);
  const [isAllOpen, setIsAllOpen] = useState<boolean>(false);

  const displayedAnnouncements = announcements.slice(0, 3);
  const remainingCount = Math.max(0, announcements.length - displayedAnnouncements.length);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNotice) {
          setSelectedNotice(null);
        } else if (isAllOpen) {
          setIsAllOpen(false);
        }
      }
    };
    if (selectedNotice || isAllOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotice, isAllOpen]);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted" />
            <h3 className="text-[13px] font-medium text-secondary uppercase tracking-wide">
              Notifications
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAllOpen(true)}
            className="text-[12px] font-mono text-secondary hover:text-foreground transition-colors cursor-pointer select-none"
          >
            {announcements.length} Updates →
          </button>
        </div>

        {/* Notices Stack - clean divider list without nested cards */}
        <div className="space-y-0.5">
          {displayedAnnouncements.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNotice(item)}
              className="group cursor-pointer py-3 px-2 rounded-md border-b border-divider-subtle last:border-b-0 hover:bg-surface-hover/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {item.priority === 'urgent' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" title="Urgent" />
                  )}
                  <h4 className="text-[14px] font-medium text-foreground group-hover:text-foreground line-clamp-1 transition-colors">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[12px] text-muted font-mono shrink-0">{item.date}</span>
              </div>

              <div className="flex items-center justify-between text-[12px] text-muted">
                {item.author ? <span>By {item.author}</span> : <span />}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Indicator for remaining announcements */}
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setIsAllOpen(true)}
            className="w-full mt-3 pt-3 border-t border-divider-subtle flex items-center justify-between text-[13px] text-secondary hover:text-foreground group cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-muted" />
              <span>+{remainingCount} more bulletin{remainingCount > 1 ? 's' : ''}</span>
            </span>
            <span className="text-[12px] text-muted group-hover:text-secondary flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        )}
      </div>

      {/* Modal: All Announcements */}
      {createPortal(
        <AnimatePresence>
          {isAllOpen && !selectedNotice && (
            <motion.div
              key="all-notices-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 modal-backdrop backdrop-blur-md"
              onClick={() => setIsAllOpen(false)}
            >
              <motion.div
                key="all-notices-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                data-modal-card="true"
                className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl bg-surface border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-xl max-h-[88vh] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-muted flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-muted" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                        All Notifications
                      </h3>
                      <p className="text-xs text-secondary">
                        {announcements.length} total notification{announcements.length === 1 ? '' : 's'} published
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAllOpen(false)}
                    className="p-1.5 text-secondary hover:text-foreground rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Body List */}
                <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1 custom-scrollbar">
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNotice(item)}
                      className="group cursor-pointer rounded-xl bg-surface-secondary border border-border-subtle p-4 hover:border-border-strong transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                            item.priority === 'urgent'
                              ? 'bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 font-semibold'
                              : 'bg-surface text-secondary border border-border-subtle'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-surface text-muted border border-border-subtle">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted font-mono">{item.date}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs text-muted border-t border-border-subtle">
                        {item.author ? <span>Signed: {item.author}</span> : <span />}
                        <span className="text-xs font-medium text-secondary group-hover:text-foreground flex items-center gap-1 transition-colors">
                          Read full notice <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border-subtle mt-2 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAllOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-secondary border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer text-xs sm:text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal: Single Notice Detail */}
      {createPortal(
        <AnimatePresence>
          {selectedNotice && (
            <motion.div
              key="notice-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 modal-backdrop backdrop-blur-md"
              onClick={() => setSelectedNotice(null)}
            >
              <motion.div
                key="notice-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                data-modal-card="true"
                className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-surface border border-border-subtle rounded-2xl p-5 sm:p-7 shadow-xl max-h-[90vh] overflow-y-auto my-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    {isAllOpen && (
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(null)}
                        className="p-1 text-secondary hover:text-foreground rounded-md hover:bg-surface-secondary transition-colors cursor-pointer mr-1"
                        title="Back to all announcements"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-xs sm:text-sm font-mono uppercase text-secondary font-semibold tracking-wide">
                      {selectedNotice.category} Notice · {selectedNotice.date}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(null)}
                    className="p-1.5 text-secondary hover:text-foreground rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {selectedNotice.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {selectedNotice.summary || "Official section circular published by department authorities."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedNotice.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-surface-secondary border border-border-subtle text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border-subtle flex flex-wrap justify-between items-center gap-3 text-xs sm:text-sm text-secondary">
                    {selectedNotice.author ? (
                      <span className="font-medium">Signed: {selectedNotice.author}</span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(null)}
                      className="px-4 py-2 rounded-lg bg-surface-secondary border border-border-subtle text-secondary hover:text-foreground transition-colors cursor-pointer text-xs sm:text-sm font-medium"
                    >
                      {isAllOpen ? 'Back' : 'Close'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
