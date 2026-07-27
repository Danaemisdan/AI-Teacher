import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  
  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="absolute inset-0 z-[150] flex flex-col items-center justify-center cursor-pointer"
      onClick={onUnlock}
    >
      {/* Heavy blur backdrop for the lock screen effect */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl z-0" />

      {/* Date and Time (Top) */}
      <div className="absolute top-[25vh] flex flex-col items-center z-10 text-white drop-shadow-md">
        <div className="text-xl font-medium tracking-wide mb-1 opacity-90">{formattedDate}</div>
        <div className="text-7xl font-bold tracking-tight">{formattedTime}</div>
      </div>

      {/* Login Area (Center) */}
      <div className="z-10 flex flex-col items-center mt-32">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-2xl border-2 border-white/20 bg-gray-800">
            {/* Dummy profile image, using a placeholder or user image */}
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541" 
                alt="Danny" 
                className="w-full h-full object-cover opacity-80"
            />
        </div>
        <h2 className="text-white text-2xl font-semibold mb-6 drop-shadow-md">Danny</h2>
        
        {/* Fake Password Input */}
        <div className="relative flex items-center group">
            <input 
                type="password" 
                placeholder="Enter Password" 
                readOnly
                className="w-48 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-center text-sm placeholder-white/70 outline-none cursor-pointer group-hover:bg-white/30 transition-colors"
            />
            <div className="absolute right-1 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white cursor-pointer hover:bg-white/50 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        </div>
        
        <div className="text-white/60 text-sm mt-4 cursor-pointer hover:text-white/90 transition-colors">
            Cancel
        </div>
      </div>

      {/* Bottom status bar (optional, like power button) */}
      <div className="absolute bottom-8 right-8 flex gap-4 text-white/80 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>
      </div>
    </motion.div>
  );
}
