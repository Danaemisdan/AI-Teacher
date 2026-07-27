"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IOSDockProps {
  apps: { id: string; name: string; icon: string }[];
  onAppClick?: (id: string) => void;
  activeAppId?: string | null;
}

export default function IOSDock({ apps, onAppClick, activeAppId }: IOSDockProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const visibleCount = 6;

  useEffect(() => {
    if (activeAppId) {
      const index = apps.findIndex(a => a.id === activeAppId);
      if (index !== -1) {
        if (index < startIndex) {
          setDirection(-1);
          setStartIndex(Math.max(0, index));
        } else if (index >= startIndex + visibleCount) {
          setDirection(1);
          setStartIndex(Math.min(apps.length - visibleCount, index - visibleCount + 1));
        }
      }
    }
  }, [activeAppId, apps, startIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setStartIndex((prev) => Math.min(apps.length - visibleCount, prev + 1));
  };

  const visibleApps = apps.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[98%] max-w-[420px] h-[72px] rounded-[24px] bg-white/20 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 flex items-center justify-between px-1">
      <button 
        onClick={handlePrev} 
        disabled={startIndex === 0}
        className={`w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white ${startIndex === 0 ? 'opacity-30' : 'active:bg-black/40'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      <div className="flex-1 overflow-hidden relative h-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={startIndex}
            custom={direction}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute flex items-center justify-around w-full px-0.5 gap-1"
          >
            {visibleApps.map((app) => (
              <div 
                key={app.id} 
                onClick={(e) => {
                  e.stopPropagation();
                  onAppClick && onAppClick(app.id);
                }} 
                className="flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-90"
              >
                <div className="relative w-[48px] h-[48px] shadow-sm rounded-[12px]">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-full h-full object-cover rounded-[12px]"
                  />
                  {activeAppId === app.id && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <button 
        onClick={handleNext} 
        disabled={startIndex >= apps.length - visibleCount}
        className={`w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white ${startIndex >= apps.length - visibleCount ? 'opacity-30' : 'active:bg-black/40'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}
