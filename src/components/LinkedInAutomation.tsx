import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LinkedInAutomation({ 
  onComplete, 
  onSpeak 
}: { 
  onComplete: () => void,
  onSpeak: (idx: number, text: string) => void
}) {
  const [step, setStep] = useState(0);
  
  const onCompleteRef = useRef(onComplete);
  const onSpeakRef = useRef(onSpeak);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSpeakRef.current = onSpeak;
  }, [onComplete, onSpeak]);

  useEffect(() => {
    // 3s later, move cursor
    const t1 = setTimeout(() => {
       setStep(1);
    }, 3000);

    // 4.5s: Speak line 25, open chat
    const t2 = setTimeout(() => {
       setStep(2);
       onSpeakRef.current(25, "Target acquired. Sending a highly personalized, totally not AI-generated pitch.");
    }, 4500);

    // 9s: Typing starts
    const t3 = setTimeout(() => {
       setStep(3);
    }, 9000);

    // 13s: Speak line 26, Prospect replies
    const t4 = setTimeout(() => {
       setStep(4);
       onSpeakRef.current(26, "Boom. They replied. Time to close this.");
    }, 13000);

    // 20.5s: Complete
    const t5 = setTimeout(() => {
       onCompleteRef.current();
    }, 20500);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#F3F2EF] rounded-b-xl border-t border-white/10 overflow-hidden">
      {/* Iframe for the actual LinkedIn clone */}
      <iframe src="/linkedin/index.html" className="w-full h-full border-none pointer-events-none" />

      {/* Simulated Chat Overlay */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 right-16 w-[320px] h-[400px] bg-white rounded-t-xl shadow-[0_-5px_20px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col z-20"
          >
            <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-[#F3F2EF] rounded-t-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full mr-3 flex items-center justify-center font-bold text-blue-600">JD</div>
              <span className="font-semibold text-sm text-gray-900">John Doe - VP of Marketing</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {/* Automated message typing */}
              {step >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, transformOrigin: "bottom right" }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0A66C2] text-white p-3 rounded-lg rounded-br-sm self-end max-w-[85%] text-[13px] leading-relaxed shadow-sm"
                >
                  Hey John! I noticed your recent product launch. I'm a video editor and I can create high-converting promo videos for your campaign. Are you open to a chat?
                </motion.div>
              )}
              {step >= 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, transformOrigin: "bottom left" }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#F3F2EF] text-gray-800 p-3 rounded-lg rounded-bl-sm self-start max-w-[85%] text-[13px] leading-relaxed shadow-sm"
                >
                  Sounds great! Let's hop on a quick call to discuss the details. Here's my Meet link: meet.google.com/abc-defg-hij
                </motion.div>
              )}
            </div>
            {/* Input area */}
            <div className="p-3 border-t border-gray-200">
                <div className="w-full bg-[#F3F2EF] h-10 rounded-full px-4 flex items-center">
                    <span className="text-gray-400 text-sm">Write a message...</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Cursor */}
      {step < 4 && (
        <motion.div
          animate={{
            x: step === 0 ? 100 : step === 1 ? 600 : step === 2 ? 650 : 700,
            y: step === 0 ? 100 : step === 1 ? 250 : step === 2 ? 450 : 500,
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
