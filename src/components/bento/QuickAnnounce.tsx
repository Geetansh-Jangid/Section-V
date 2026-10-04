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
    <div className="rounded-xl bg-[#0a0a0a] border border-[#222222] p-5 flex flex-col justify-between hover:border-[#333333] transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Official Circulars
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAllOpen(true)}
            className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-[#141414] border border-[#222222] hover:border-[#333333] transition-colors cursor-pointer"
          >
            {announcements.length} Bulletins
          </button>
        </div>

        {/* Notices Stack */}
        <div className="space-y-2">
          {displayedAnnouncements.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNotice(item)}
              className="group cursor-pointer rounded-lg bg-[#111111] border border-[#1f1f1f] p-3 hover:border-[#333333] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                  item.priority === 'urgent'
                    ? 'bg-red-950/80 text-red-300 border border-red-800'
                    : 'bg-[#181818] text-neutral-400 border border-[#282828]'
                }`}>
                  {item.priority}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">{item.date}</span>
              </div>

              <h4 className="text-xs font-medium text-neutral-200 group-hover:text-white line-clamp-1 transition-colors">
                {item.title}
              </h4>

              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                <span>By {item.author}</span>
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
            className="w-full mt-3 pt-2.5 pb-1 px-2 border-t border-[#1a1a1a] flex items-center justify-between text-xs font-mono text-neutral-400 hover:text-white group cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>+{remainingCount} more announcement{remainingCount > 1 ? 's' : ''} available</span>
            </span>
            <span className="text-[11px] text-neutral-500 group-hover:text-neutral-300 flex items-center gap-0.5">
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
              className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setIsAllOpen(false)}
            >
              <motion.div
                key="all-notices-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                data-modal-card="true"
                className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-2xl bg-[#0f0f0f] border border-[#262626] rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#222222] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        All Official Circulars
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {announcements.length} total bulletin{announcements.length === 1 ? '' : 's'} published
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAllOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
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
                      className="group cursor-pointer rounded-xl bg-[#121212] border border-[#222222] p-4 hover:border-[#3a3a3a] transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                            item.priority === 'urgent'
                              ? 'bg-red-950/80 text-red-300 border border-red-800'
                              : 'bg-[#181818] text-neutral-400 border border-[#282828]'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#181818] text-neutral-400 border border-[#282828]">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">{item.date}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs text-neutral-500 border-t border-[#1a1a1a]">
                        <span>Signed: {item.author}</span>
                        <span className="text-xs font-medium text-neutral-400 group-hover:text-white flex items-center gap-1 transition-colors">
                          Read full notice <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-[#222222] mt-2 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAllOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-xs sm:text-sm"
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
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedNotice(null)}
            >
              <motion.div
                key="notice-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                data-modal-card="true"
                className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#0f0f0f] border border-[#262626] rounded-2xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto my-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    {isAllOpen && (
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(null)}
                        className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer mr-1"
                        title="Back to all announcements"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-xs sm:text-sm font-mono uppercase text-neutral-400 font-semibold tracking-wide">
                      {selectedNotice.category} Notice · {selectedNotice.date}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(null)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {selectedNotice.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {selectedNotice.summary || "Official section circular published by department authorities."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedNotice.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#181818] border border-[#282828] text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#222222] flex flex-wrap justify-between items-center gap-3 text-xs sm:text-sm text-neutral-400">
                    <span className="font-medium">Signed: {selectedNotice.author}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(null)}
                      className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer text-xs sm:text-sm"
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
