import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AppStoreWindow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000); // Search
    const t2 = setTimeout(() => setStep(2), 2500); // Results
    const t3 = setTimeout(() => setStep(3), 4000); // Click Get
    const t4 = setTimeout(() => setStep(4), 5500); // Downloading
    const t5 = setTimeout(() => setStep(5), 8500); // Downloaded (Open)
    const t6 = setTimeout(() => onComplete(), 10500); // Close

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: step >= 5 ? 0 : 1, scale: step >= 5 ? 0.95 : 1, y: step >= 5 ? -20 : 0 }}
      className="absolute inset-0 m-auto w-[98vw] md:w-[850px] bg-[#1E1E1E]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden z-[70]"
      style={{
        height: "min(calc(100vh - 140px), 600px)",
      }}
    >
      {/* Sidebar & Content Layout */}
      <div className="flex flex-1 h-full">
         {/* Sidebar */}
         <div className="hidden md:flex w-[220px] bg-[#2D2D2D]/50 border-r border-black/50 p-4 flex-col gap-2">
            <div className="flex gap-2 mb-6 mt-1">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
            </div>
            {/* Search */}
            <div className="bg-black/20 border border-white/10 rounded-md px-2 py-1.5 flex items-center gap-2 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span className="text-gray-300 text-sm">{step >= 1 ? "DaVinci Resolve" : "Search"}</span>
            </div>
            {/* Nav items */}
            <div className="flex items-center gap-2 text-gray-400 text-sm px-2 py-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>Discover</div>
            <div className="flex items-center gap-2 text-gray-400 text-sm px-2 py-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>Arcade</div>
            <div className="flex items-center gap-2 text-gray-400 text-sm px-2 py-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>Create</div>
         </div>

         {/* Main View */}
         <div className="flex-1 bg-[#1E1E1E] p-8 overflow-hidden">
            {step >= 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-6">Results for "DaVinci Resolve"</h2>
                    
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start bg-black/20 p-4 md:p-6 rounded-2xl border border-white/5">
                        {/* App Icon Mock */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] md:rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" className="absolute inset-0 w-full h-full object-cover z-10 p-2" />
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center md:items-start pt-2 text-center md:text-left">
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight mb-1">DaVinci Resolve</h1>
                            <p className="text-gray-400 text-sm md:text-lg mb-4">Hollywood's Professional Editor</p>
                            
                            <div className="flex items-center gap-4">
                                {step < 3 && <div className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-1.5 rounded-full text-sm cursor-pointer shadow-lg shadow-blue-500/20">GET</div>}
                                {step === 3 && (
                                   <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                                )}
                                {step >= 4 && <div className="bg-[#2D2D2D] text-blue-400 font-bold px-6 py-1.5 rounded-full text-sm cursor-pointer">OPEN</div>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white/90 mb-4">More Video Editors</h3>
                        <div className="flex flex-col gap-4">
                            {/* Final Cut */}
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <div className="w-16 h-16 rounded-[14px] bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">Final Cut Pro</h4>
                                    <p className="text-gray-400 text-xs">Professional Video Editing</p>
                                </div>
                                <div className="bg-white/10 text-blue-400 font-bold px-4 py-1 rounded-full text-xs cursor-pointer">$299.99</div>
                            </div>
                            {/* Premiere */}
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <div className="w-16 h-16 rounded-[14px] bg-[#3B2556] border border-purple-500 flex items-center justify-center flex-shrink-0"><span className="text-purple-400 font-bold text-xl">Pr</span></div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">Adobe Premiere Pro</h4>
                                    <p className="text-gray-400 text-xs">Industry standard editor</p>
                                </div>
                                <div className="bg-white/10 text-blue-400 font-bold px-4 py-1 rounded-full text-xs cursor-pointer">GET</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
         </div>
      </div>

      {/* Simulated Cursor */}
      {step < 4 && (
        <motion.div
          animate={{
            x: step === 0 ? 100 : step === 1 ? 100 : step === 2 ? 380 : step === 3 ? 380 : 380,
            y: step === 0 ? 100 : step === 1 ? 80 : step === 2 ? 220 : step === 3 ? 220 : 220,
          }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="absolute z-50 w-6 h-6 pointer-events-none"
          style={{
            backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\"><path fill=\"black\" stroke=\"white\" stroke-width=\"1.5\" d=\"M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.94c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z\"/></svg>')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
          }}
        />
      )}
    </motion.div>
  );
}
