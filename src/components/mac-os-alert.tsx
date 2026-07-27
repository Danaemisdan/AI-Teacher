import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MacOSAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  isPrimaryLoading?: boolean;
}

export function MacOSAlert({
  isOpen,
  title,
  message,
  primaryButtonText = 'Delete',
  secondaryButtonText = 'Cancel',
  onPrimaryClick,
  onSecondaryClick,
  isPrimaryLoading = false
}: MacOSAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-[260px] rounded-2xl flex flex-col items-center pointer-events-auto"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(40px) saturate(150%)',
              WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 0.5px rgba(0, 0, 0, 0.15)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            <div className="px-4 pt-5 pb-4 text-center flex flex-col items-center">
              <h2 className="text-[15px] font-semibold text-black leading-tight mb-1 tracking-tight">
                {title}
              </h2>
              <p className="text-[13px] text-black/70 leading-snug tracking-tight">
                {message}
              </p>
            </div>
            
            <div className="w-full flex border-t border-black/[0.15] h-[44px]">
              <button
                onClick={onSecondaryClick}
                className="flex-1 text-[16px] text-blue-500 font-normal hover:bg-black/5 transition-colors border-r border-black/[0.15] rounded-bl-2xl outline-none"
              >
                {secondaryButtonText}
              </button>
              <button
                onClick={onPrimaryClick}
                className={`flex-1 text-[16px] text-red-500 font-semibold transition-colors rounded-br-2xl outline-none ${isPrimaryLoading ? 'bg-black/10' : 'hover:bg-black/5'}`}
              >
                {primaryButtonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
