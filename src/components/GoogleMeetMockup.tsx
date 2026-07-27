import React, { useEffect, useRef, useState } from "react";
import { AgentFace } from "./AgentFace";

export function GoogleMeetMockup({ 
  onComplete,
  onSpeak
}: { 
  onComplete: () => void,
  onSpeak: (idx: number, text: string, muffled?: boolean) => void
}) {
  const onCompleteRef = useRef(onComplete);
  const onSpeakRef = useRef(onSpeak);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSpeakRef.current = onSpeak;
  }, [onComplete, onSpeak]);

  useEffect(() => {
    // 1s: speak intro
    const t1 = setTimeout(() => {
      onSpeakRef.current(27, "Hey my boss is sleeping so I had to join in.", true);
    }, 1000);

    // 4.5s: speak pitch
    const t2 = setTimeout(() => {
      onSpeakRef.current(28, "Sure I'll edit the best video you'll ever see.", true);
    }, 4500);

    // 9s: ending
    const t3 = setTimeout(() => {
      onSpeakRef.current(29, "Thanks for your time in the call.", true);
    }, 9000);

    // 12.5s: meeting ends
    const t4 = setTimeout(() => {
       onCompleteRef.current();
    }, 12500); 

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#202124] overflow-hidden rounded-b-xl border-t border-white/10 flex flex-col">
       
       {/* Main Content Area */}
       <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 h-[calc(100%-60px)] md:h-[calc(100%-88px)]">
           {/* Box 1: Agent */}
           <div className="flex-1 bg-[#281432] rounded-[16px] md:rounded-[24px] shadow-lg border border-white/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute top-2 left-2 md:top-4 md:left-4 text-white text-[10px] md:text-xs bg-black/40 px-2 py-1 md:px-3 md:py-1.5 rounded-md flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> You
               </div>
               <AgentFace state="speaking" size={160} />
           </div>
           
           {/* Box 2: Client */}
           <div className="flex-1 bg-[#3C4043] rounded-[16px] md:rounded-[24px] shadow-lg border border-white/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute top-2 left-2 md:top-4 md:left-4 text-white text-[10px] md:text-xs bg-black/40 px-2 py-1 md:px-3 md:py-1.5 rounded-md flex items-center gap-2">
                 John Doe
               </div>
               {/* Client Avatar */}
               <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden bg-black border-2 border-white/20">
                   <img src="https://ui-avatars.com/api/?name=John+Doe&background=202124&color=fff&size=128" alt="John Doe" className="w-full h-full object-cover" />
               </div>
           </div>
       </div>

       {/* Bottom Toolbar */}
       <div className="h-[60px] md:h-[88px] w-full flex items-center justify-between px-3 md:px-6 pb-1 md:pb-2">
           <div className="hidden md:block text-white text-[15px] font-medium tracking-wide">
               6:38 AM | meet.google.com
           </div>
           
           <div className="flex items-center gap-2 md:gap-3 mx-auto md:mx-0">
               <div className="h-10 md:h-12 bg-[#3C4043] rounded-full flex items-center px-1 md:px-2">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer text-white/90">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                   </div>
               </div>
               
               <div className="h-10 md:h-12 bg-[#EA4335] rounded-full flex items-center px-3 md:px-4 cursor-pointer hover:bg-red-600 transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="22" y1="2" x2="2" y2="22"></line></svg>
               </div>
               
               <div className="h-10 md:h-12 bg-[#3C4043] rounded-full flex items-center px-1 md:px-2">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer text-white/90">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                   </div>
               </div>
           </div>
           
           <div className="hidden md:flex items-center gap-4 text-white/90">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
           </div>
       </div>
    </div>
  );
}
