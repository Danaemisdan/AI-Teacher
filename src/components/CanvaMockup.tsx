import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export function CanvaMockup({ 
  onComplete,
  onSpeak
}: { 
  onComplete: () => void,
  onSpeak: (idx: number, text: string) => void
}) {
  const [step, setStep] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const onSpeakRef = useRef(onSpeak);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSpeakRef.current = onSpeak;
  }, [onComplete, onSpeak]);

  useEffect(() => {
      const timer = setInterval(() => {
          const doc = iframeRef.current?.contentDocument;
          if (doc) {
              const el = doc.getElementById('canva-document');
              if (el) {
                  const bounds = el.getBoundingClientRect();
                  if (bounds.width > 0 && bounds.height > 0) {
                     setRect(bounds);
                     clearInterval(timer);
                  }
              }
          }
      }, 100);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1s: speak intro
    const t1 = setTimeout(() => {
      onSpeakRef.current(30, "Deal closed. Now I'm auto-generating a thousand-dollar contract.");
      setStep(1);
    }, 1000);

    const t2 = setTimeout(() => setStep(2), 3500); // Mouse moves to doc
    const t3 = setTimeout(() => setStep(3), 6000); // Doc updates
    const t4 = setTimeout(() => setStep(4), 8000); // Cursor moves away

    const t5 = setTimeout(() => {
        onSpeakRef.current(31, "I am also gonna mail them this. And yes, I will work for you to complete this contract. Don't worry, I'm gonna make the money fall in your bank account.");
    }, 9000);

    const t6 = setTimeout(() => {
        onCompleteRef.current();
    }, 19000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, []);

  return (
    <div className="relative w-full h-[90vh] md:h-full overflow-hidden bg-[#F2F4F7] rounded-b-xl border-t border-white/10">
       {/* Use the provided Canva HTML clone via iframe */}
       <iframe ref={iframeRef} src="/canva/index.html" className="absolute inset-0 w-[1200px] md:w-full h-full border-none pointer-events-none z-0 origin-top-left transform scale-[0.35] md:scale-100" />

       {/* Simulated in-canvas document typing via absolute overlay */}
       {step >= 3 && rect && (
          <div className="absolute pointer-events-none flex flex-col overflow-hidden"
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              padding: '30px',
            }}
          >
            <h1 className="text-[32px] font-serif text-white tracking-tight mb-4 mt-2">VIDEO EDITING CONTRACT</h1>
            <div className="flex flex-col gap-4 text-gray-300 text-[16px] leading-relaxed font-sans">
                <p><strong className="text-white">Client:</strong> John Doe, VP Marketing<br/>
                <strong className="text-white">Contractor:</strong> Momentum OS</p>
                <div className="h-px w-full bg-white/20"></div>
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  This agreement confirms the engagement of Momentum OS for the production, editing, and delivery of 4 high-conversion promotional videos for the upcoming Q3 campaign.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
                  The contractor agrees to deliver the final MP4 files by the end of the month, incorporating up to 2 rounds of revisions.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                  className="mt-6 flex flex-col"
                >
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Project Fee</span>
                   <span className="font-bold text-2xl tracking-tight text-white">$1,000.00 USD</span>
                </motion.div>
            </div>
          </div>
       )}

       {/* Simulated Cursor */}
       {step < 4 && (
         <motion.div
           animate={{
             x: step === 0 ? 100 : step === 1 ? 350 : step === 2 ? 600 : step === 3 ? 800 : 900,
             y: step === 0 ? 200 : step === 1 ? 300 : step === 2 ? 400 : step === 3 ? 300 : 500,
           }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
           className="absolute z-50 w-6 h-6 pointer-events-none"
           style={{
             backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\"><path fill=\"black\" stroke=\"white\" stroke-width=\"1.5\" d=\"M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.94c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z\"/></svg>')",
             backgroundSize: "contain",
             backgroundRepeat: "no-repeat",
             filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
           }}
         />
       )}
    </div>
  );
}
