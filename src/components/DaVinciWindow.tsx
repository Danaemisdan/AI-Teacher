import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function DaVinciWindow({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 1000);
            return 100;
        }
        return p + 2;
      });
    }, 140);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 m-auto w-[98vw] md:w-[95vw] bg-[#141414] rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-gray-800 flex flex-col overflow-hidden z-[80]"
      style={{
        height: "min(calc(100vh - 140px), 85vh)",
      }}
    >
      {/* Top Menu */}
      <div className="h-8 bg-[#1A1A1A] border-b border-black flex items-center px-4 justify-between select-none text-xs text-gray-400">
        <div className="flex items-center gap-4">
            <span className="text-white font-bold">DaVinci Resolve</span>
            <div className="hidden md:flex gap-4">
              <span>File</span>
              <span>Edit</span>
              <span>Trim</span>
              <span>Timeline</span>
              <span>Clip</span>
              <span>Mark</span>
              <span>View</span>
              <span>Playback</span>
            </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <span>Momentum_Campaign</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex gap-1 p-1 bg-black">
         {/* Media Pool (Left) */}
         <div className="w-[20%] bg-[#1A1A1A] rounded flex flex-col">
            <div className="h-8 bg-[#242424] flex items-center px-3 text-xs font-semibold text-gray-300 rounded-t">Media Pool</div>
            <div className="flex-1 p-2 flex flex-wrap gap-2 content-start">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="w-[45%] aspect-video bg-gray-800 rounded border border-gray-700"></div>
                ))}
            </div>
         </div>

         {/* Viewers (Center/Right) */}
         <div className="flex-1 flex gap-1">
             {/* Source Viewer */}
             <div className="flex-1 bg-[#1A1A1A] rounded flex flex-col">
                 <div className="h-8 flex items-center justify-center text-xs text-gray-400">Source</div>
                 <div className="flex-1 p-2 flex items-center justify-center">
                     <div className="w-full aspect-video bg-black flex items-center justify-center border border-gray-800 relative">
                         <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-purple-900 to-indigo-900"></div>
                     </div>
                 </div>
                 <div className="h-10 flex items-center justify-center gap-4 text-gray-500">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </div>
             </div>
             {/* Timeline Viewer */}
             <div className="flex-1 bg-[#1A1A1A] rounded flex flex-col">
                 <div className="h-8 flex items-center justify-center text-xs text-gray-400">Timeline - Momentum_Campaign</div>
                 <div className="flex-1 p-2 flex items-center justify-center">
                     <div className="w-full aspect-video bg-black border border-gray-800 relative overflow-hidden flex items-center justify-center">
                         {/* Fake video playing effect with Nyan Cat */}
                         <motion.div 
                           className="absolute inset-0 bg-gradient-to-br from-[#111] via-purple-900/40 to-[#000] mix-blend-screen"
                           animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)'] }}
                           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         />
                         <img src="https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif" alt="Nyan Cat" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-60 z-10" />
                         {/* Cinematic Bars */}
                         <div className="absolute top-0 left-0 right-0 h-[12%] bg-black z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"></div>
                         <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]"></div>
                     </div>
                 </div>
                 <div className="h-10 flex items-center justify-center gap-4 text-gray-300">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </div>
             </div>
         </div>
      </div>

      {/* Timeline Panel (Bottom) — visible on all screens */}
      <div className="flex h-[150px] md:h-[250px] bg-[#1A1A1A] border-t border-black flex-col">
         <div className="h-8 bg-[#242424] flex items-center px-4 justify-between border-b border-black">
             <div className="text-xs text-gray-300 flex gap-4">
                 <span className="text-white">Edit</span><span>Color</span><span>Fairlight</span><span>Deliver</span>
             </div>
             <div className="text-[10px] text-red-500 font-mono">01:00:0{Math.floor(progress/10)}:{progress%10}0</div>
         </div>
         <div className="flex-1 flex overflow-hidden relative p-1">
             {/* Tracks Headers */}
             <div className="w-32 bg-[#222] border-r border-black flex flex-col gap-1 z-10">
                 <div className="h-14 bg-[#2A2A2A] rounded-sm flex items-center px-2 text-[10px] text-gray-400">V1</div>
                 <div className="h-14 bg-[#2A2A2A] rounded-sm flex items-center px-2 text-[10px] text-gray-400">V2</div>
                 <div className="h-14 bg-[#2A2A2A] rounded-sm flex items-center px-2 text-[10px] text-gray-400 mt-2">A1</div>
             </div>
             {/* Timeline Tracks */}
             <div className="flex-1 relative bg-[#111]">
                 {/* Playhead */}
                 <motion.div 
                   className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                   style={{ left: `${progress}%` }}
                 >
                     <div className="absolute top-0 -left-1.5 w-3 h-3 bg-red-500 rounded-sm"></div>
                 </motion.div>
                 
                 {/* Clips */}
                 <div className="absolute top-1 left-4 w-[30%] h-12 bg-indigo-600/80 rounded border border-white/20 text-[10px] text-white/50 p-1">Intro.mp4</div>
                 <div className="absolute top-1 left-[35%] w-[40%] h-12 bg-purple-600/80 rounded border border-white/20 text-[10px] text-white/50 p-1">B-Roll_City.mp4</div>
                 <div className="absolute top-16 left-[20%] w-[15%] h-12 bg-pink-600/80 rounded border border-white/20 text-[10px] text-white/50 p-1">Text_Overlay.png</div>
                 
                 <div className="absolute top-[120px] left-4 w-[30%] h-12 bg-teal-700/60 rounded border border-white/20 text-[10px] text-white/50 p-1">Audio_Track_1.wav</div>
                 <div className="absolute top-[120px] left-[35%] w-[40%] h-12 bg-teal-700/60 rounded border border-white/20 text-[10px] text-white/50 p-1">Audio_Track_2.wav</div>
             </div>
         </div>
      </div>
    </motion.div>
  );
}
