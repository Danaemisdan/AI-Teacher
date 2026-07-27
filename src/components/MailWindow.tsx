import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function MailWindow({ onComplete, onSpeak }: { onComplete: () => void, onSpeak: (id: number, text: string) => void }) {
  const [step, setStep] = useState(0);
  const onSpeakRef = useRef(onSpeak);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onSpeakRef.current = onSpeak; }, [onSpeak]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    // Sequence
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => {
       setStep(2);
       onSpeakRef.current(36, "I can take care of every task in your life, you just need to sit back and watch.");
    }, 1800);
    const t3 = setTimeout(() => setStep(3), 5500);
    const t4 = setTimeout(() => setStep(4), 7500);
    const t5 = setTimeout(() => {
        onCompleteRef.current();
    }, 9000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []); // empty dep array — run once only

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: step >= 5 ? 0 : 1, scale: step >= 5 ? 0.95 : 1, y: step >= 5 ? -20 : 0 }}
      className="absolute inset-0 m-auto w-[95vw] md:w-[700px] bg-[#1E1E1E]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden z-[70]"
      style={{
        height: "min(calc(100vh - 140px), 550px)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset"
      }}
    >
      {/* Top Toolbar */}
      <div className="h-12 bg-[#2D2D2D] border-b border-black flex items-center px-4 justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Traffic Lights */}
          <div className="flex gap-2 mr-6">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
          </div>
          
          <button className={`p-1.5 rounded-md ${step >= 4 ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-gray-400">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
           <div className="text-sm font-medium ml-2">Aa</div>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
           <div className="flex items-center gap-1 border border-gray-600 rounded px-1">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
           </div>
        </div>
      </div>

      {/* Header Fields */}
      <div className="bg-[#2D2D2D] px-4 py-1 flex flex-col text-[13px] border-b border-black/50">
        <div className="flex border-b border-gray-600/30 py-2 items-center">
            <span className="text-gray-400 w-12 text-right mr-3">To:</span>
            <div className="bg-[#1A5C9E] text-white px-2 py-0.5 rounded flex items-center text-xs">
                info@dmcapital.com
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 opacity-70"><path d="M6 9l6 6 6-6"/></svg>
            </div>
        </div>
        <div className="flex border-b border-gray-600/30 py-2 items-center">
            <span className="text-gray-400 w-12 text-right mr-3">Cc:</span>
        </div>
        <div className="flex py-2 items-center">
            <span className="text-gray-400 w-12 text-right mr-3">Subject:</span>
            <span className="text-white outline-none">
                {step >= 1 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Video Editing Contract - Momentum OS
                    </motion.span>
                )}
            </span>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 bg-[#1E1E1E] p-6 text-[14px] text-gray-200 font-sans leading-relaxed flex flex-col">
          {step >= 2 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                 <p>Hi John,</p>
                 <p>Great speaking with you earlier! As discussed, I've attached the contract for the Q3 promotional video series. Let me know if you have any questions.</p>
                 <p>Best,<br/>Momentum OS AI</p>
             </motion.div>
          )}

          {/* Attachment */}
          {step >= 3 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
               className="mt-8 flex items-center gap-3 p-3 bg-[#2D2D2D] border border-gray-600/30 rounded-lg w-max shadow-sm"
             >
                 <div className="bg-red-500/20 text-red-400 p-2 rounded">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-sm font-medium">Momentum_Contract.pdf</span>
                     <span className="text-xs text-gray-500">124 KB</span>
                 </div>
             </motion.div>
          )}
      </div>

      {/* Simulated Cursor */}
      {step < 4 && (
        <motion.div
          animate={{
            x: step === 0 ? 150 : step === 1 ? 150 : step === 2 ? 150 : step === 3 ? 50 : 50,
            y: step === 0 ? 150 : step === 1 ? 150 : step === 2 ? 250 : step === 3 ? 30 : 30,
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
