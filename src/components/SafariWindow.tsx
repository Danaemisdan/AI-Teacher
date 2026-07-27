import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface SafariWindowProps {
  url: string;
  children: ReactNode;
  onClose?: () => void;
  onInteraction?: () => void;
  className?: string;
}

export function SafariWindow({ url, children, onClose, onInteraction, className = "" }: SafariWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      drag
      dragMomentum={false}
      onPointerDown={onInteraction}
      className={`absolute z-[60] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-white/5 backdrop-blur-3xl inset-0 m-auto ${className}`}
      style={{
        width: "min(98vw, 900px)",
        /* Mobile: fill between status bar and dock. Desktop: 600px */
        height: "min(calc(100vh - 140px), 600px)",
      }}
    >
      {/* Title Bar */}
      <div className="h-11 w-full bg-black/40 border-b border-white/10 flex items-center px-3 select-none shrink-0 cursor-move gap-3">
        <div className="flex gap-2 shrink-0">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
        </div>
        {/* URL Bar */}
        <div className="flex-1 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center px-3 shadow-inner min-w-0">
          <span className="text-white/80 text-xs font-medium tracking-wide font-sans truncate">{url || "New Tab"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white overflow-hidden pointer-events-auto min-h-0">
        {children}
      </div>
    </motion.div>
  );
}
