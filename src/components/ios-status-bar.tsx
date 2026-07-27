"use client";

import { useState, useEffect } from "react";

export default function IOSStatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const int = setInterval(updateTime, 60000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-14 z-50 flex justify-between items-center px-6 pt-3 text-white font-semibold text-[15px] tracking-wide pointer-events-none drop-shadow-md">
      {/* Time */}
      <div className="w-16 flex justify-start">{time || "9:41"}</div>

      {/* Center gap for Dynamic Island */}
      
      {/* System Icons */}
      <div className="w-16 flex justify-end space-x-1.5 items-center">
        {/* Cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="6" width="3" height="6" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 12C9.1 12 10 11.1 10 10C10 8.9 9.1 8 8 8C6.9 8 6 8.9 6 10C6 11.1 6.9 12 8 12Z" />
          <path d="M4 6.5C5.1 5.4 6.5 4.8 8 4.8C9.5 4.8 10.9 5.4 12 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M1.5 4C3.3 2.2 5.5 1.2 8 1.2C10.5 1.2 12.7 2.2 14.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="1" />
          <rect x="3" y="3" width="16" height="6" rx="1" fill="currentColor" />
          <path d="M22 4C23.1046 4 24 4.89543 24 6C24 7.10457 23.1046 8 22 8V4Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
