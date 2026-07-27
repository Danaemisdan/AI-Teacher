import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MacOSDock from "./mac-os-dock";
import IOSDock from "./ios-dock";
import { AgentFace, AgentState } from "./AgentFace";
import { useMediaQuery } from "../hooks/use-media-query";
import { GlassFilter } from "./liquid-glass";
import MacOSMenuBar from "./mac-os-menu-bar";
import { NewDaVinciWindow } from "./NewDaVinciWindow";
import { MessagesWindow } from "./MessagesWindow";
import { LockScreen } from "./LockScreen";

function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize a single audio element on mount for iOS Safari compatibility
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
          sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
          filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
          
          sourceNodeRef.current.connect(filterNodeRef.current);
          filterNodeRef.current.connect(audioCtxRef.current.destination);
        }
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
  }, []);

  const speak = useCallback((text: string, idx: number, onEnd?: () => void, muffled: boolean = false) => {
    stop(); // Force stop any currently playing TTS to prevent chaotic overlap!
    
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = `/audio/demo-${idx}.mp3`;

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    
    if (filterNodeRef.current) {
      if (muffled) {
        filterNodeRef.current.type = 'allpass'; // Disabled entirely as user hates the muffled effect
      } else {
        filterNodeRef.current.type = 'allpass';
      }
    }

    let errorHandled = false;
    
    audio.onended = () => onEnd?.();
    audio.onerror = () => {
      if (errorHandled) return;
      errorHandled = true;
      // If audio fails to load, just simulate the duration so the sequence doesn't get stuck forever.
      // Do NOT use speechSynthesis as the user hates the robotic OS voice fallback.
      const words = text.split(" ").length;
      const duration = Math.max(2000, words * 300 + 500);
      setTimeout(() => onEnd?.(), duration);
    }; 
    audio.play().catch(() => audio.onerror?.(new Event("error")));
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return { speak, stop, pause, resume };
}

interface AgentShowcaseProps {
  isVisible?: boolean;
  onAgentActive?: (active: boolean) => void;
}

const presentationDockApps = [
  { id: "finder", name: "Finder", icon: "/app-icons/finder.png" },
  { id: "davinci", name: "DaVinci Resolve", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" },
  { id: "messages", name: "Messages", icon: "/app-icons/messages.png" },
  { id: "settings", name: "System Settings", icon: "/app-icons/settings.png" },
];

export function NewAgentShowcase({ isVisible = false, onAgentActive }: AgentShowcaseProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [active, setActive] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("sleeping");
  const [subtitle, setSubtitle] = useState("");
  const [showDesktop, setShowDesktop] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  
  // Workflow state:
  // 0 = idle (waiting for click 1)
  // 1 = clicking opens Davinci Phase 1
  // 2 = clicking does DaVinci Phase 2
  // 3 = clicking does DaVinci Phase 3
  // 4 = clicking does DaVinci Phase 4 (Exporting) -> opens messages
  const [presentationStep, setPresentationStep] = useState<number>(0);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  
  const timer = useRef<NodeJS.Timeout | null>(null);
  const { speak: rawSpeak, stop: rawStop } = useTTS();
  
  const speak = useCallback((text: string, idx: number, onDone?: () => void) => {
    rawSpeak(text, idx, onDone);
  }, [rawSpeak]);

  const stop = useCallback(() => {
    rawStop();
  }, [rawStop]);

  const clear = useCallback(() => { 
    if (timer.current) clearTimeout(timer.current); 
  }, []);

  const end = useCallback(() => { 
    clear(); 
    stop(); 
    setAgentState("sleeping"); 
    setSubtitle("");
    setActive(false);
    setShowDesktop(false);
    setShowLockScreen(false);
    setPresentationStep(0);
    setIsProcessingClick(false);
  }, [clear, stop]);

  useEffect(() => {
    onAgentActive?.(active);
  }, [active, onAgentActive]);

  useEffect(() => {
    if (!isVisible) {
      end();
    }
  }, [isVisible, end]);

  useEffect(() => () => { clear(); stop(); }, [clear, stop]);

  const wake = useCallback(() => {
    if (active) return;
    clear(); stop();
    setActive(true);
    setAgentState("idle");
    setSubtitle("");
    setShowDesktop(false);
    setShowLockScreen(false);
    
    timer.current = setTimeout(() => {
       setAgentState("speaking");
       setSubtitle("Oh, hey there! Why did you wake me up?");
       speak("Oh, hey there! Why did you wake me up?", 8, () => {
           setAgentState("idle");
           setSubtitle("");
           setShowLockScreen(true);
       });
    }, 500);
  }, [active, clear, stop, speak]);

  const handleUnlock = useCallback(() => {
     setShowLockScreen(false);
     setAgentState("speaking");
     const text = "Hey Danny, welcome back. What creative work should we do now bro?";
     setSubtitle(text);
     speak(text, 54, () => {
        setAgentState("idle");
        setSubtitle("");
        setShowDesktop(true);
     });
  }, [speak]);

  const handleGlobalClick = useCallback(() => {
    if (!showDesktop || isProcessingClick) return;
    setIsProcessingClick(true);
    stop();

    if (presentationStep === 0) {
       // Step 1: "I'll edit this video for you." -> Opens DaVinci
       setAgentState("speaking");
       const text = "I'll edit this video for you.";
       setSubtitle(text);
       speak(text, 49, () => {
           setAgentState("idle");
           setSubtitle("");
           setPresentationStep(1);
           setIsProcessingClick(false);
       });
    } else if (presentationStep === 1) {
       // Step 2: "I'll add a blue color background on the title screen."
       setAgentState("speaking");
       const text = "I'll add a blue color background on the title screen.";
       setSubtitle(text);
       speak(text, 50, () => {
           setAgentState("idle");
           setSubtitle("");
           setPresentationStep(2);
           setIsProcessingClick(false);
       });
    } else if (presentationStep === 2) {
       // Step 3: "And now I will make sure to add more videos... I'll trim the third video to your size."
       setAgentState("speaking");
       const text = "And now I will make sure to add more videos... I'll trim the third video to your size.";
       setSubtitle(text);
       speak(text, 51, () => {
           setAgentState("idle");
           setSubtitle("");
           setPresentationStep(3);
           setIsProcessingClick(false);
       });
    } else if (presentationStep === 3) {
       // Step 4: "Exporting the video now... and I'll send it to your team on the Messages app."
       setAgentState("speaking");
       const text = "Exporting the video now... and I'll send it to your team on the Messages app.";
       setSubtitle(text);
       speak(text, 52, () => {
           setAgentState("idle");
           setSubtitle("");
           // Transition to Exporting phase
           setPresentationStep(4);
           setIsProcessingClick(false);
       });
    } else {
       // Done, don't do anything else
       setIsProcessingClick(false);
    }
  }, [showDesktop, isProcessingClick, presentationStep, speak, stop]);

  return (
    <div 
       className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ${showDesktop ? "" : "px-4"}`}
       onClick={showDesktop ? handleGlobalClick : undefined}
    >

      {/* Presentation Workflow UI */}
      <AnimatePresence>
         {presentationStep >= 1 && presentationStep <= 4 && (
            <NewDaVinciWindow 
               phase={presentationStep} 
               onRenderComplete={() => {
                  if (presentationStep === 4) {
                      setPresentationStep(5); // Transition to Messages phase
                  }
               }}
            />
         )}
      </AnimatePresence>

      <AnimatePresence>
         {presentationStep === 5 && (
            <MessagesWindow 
               onComplete={() => {
                  setAgentState("speaking");
                  const text = "I'll schedule a meet with the client and attend the call myself to provide the updates.";
                  setSubtitle(text);
                  speak(text, 53, () => {
                      setAgentState("sleeping");
                      setSubtitle("");
                      setPresentationStep(6);
                  });
               }}
            />
         )}
      </AnimatePresence>

      {/* Background change when desktop appears */}
      <AnimatePresence>
        {showDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("/images/wallpaper.jpg")`,
            }}
          >
            <div className="absolute inset-0 bg-black/80" />
            <GlassFilter />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {showLockScreen && (
             <LockScreen onUnlock={handleUnlock} />
         )}
      </AnimatePresence>

      {/* Purple ambient glow */}
      <motion.div
        className="pointer-events-none absolute"
        animate={active
          ? showDesktop ? { opacity: 0 } : { scale: 1.1, opacity: 0.7 }
          : { scale: 1, opacity: 0.5 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        style={{
          width: 700, height: 700, left: "50%", x: "-50%", top: "50%", y: "-50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,255,0.38) 0%, rgba(80,20,200,0.16) 40%, transparent 70%)",
          filter: "blur(32px)",
          zIndex: 0,
        }}
      />

      {/* OS Top Bar */}
      <AnimatePresence>
        {showDesktop && !isMobile && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-[9998]"
          >
            <MacOSMenuBar appName="Finder" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent face */}
      <motion.div
        className="relative z-[9999]"
        drag={showDesktop}
        dragConstraints={{ left: -500, right: 500, top: -240, bottom: 200 }}
        dragElastic={0.2}
        dragMomentum={false}
        animate={active 
          ? (showDesktop || showLockScreen)
              ? isMobile ? { scale: 0.45, y: "-36vh" } : { scale: 0.6, y: "-42vh" }
              : { scale: 1.05 } 
          : { scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        onClick={(e) => {
           if (!active) {
              e.stopPropagation();
              wake();
           }
        }}
        style={{ cursor: !active ? "pointer" : showDesktop ? "grab" : "default" }}
        whileHover={!active ? { scale: 1.04 } : {}}
        whileTap={!active ? { scale: 0.97 } : showDesktop ? { cursor: "grabbing" } : {}}
      >
        <AgentFace state={agentState} size={210} />

        {/* Pulse ring & Wake Text */}
        <AnimatePresence>
          {!active && (
            <motion.div key="r" className="absolute rounded-[2.5rem] border border-white/[0.08]"
              style={{ inset: -12 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0.93, 1.09, 0.93] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} />
          )}
          {!active && (
             <motion.div
               key="wake-text"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-wide whitespace-nowrap"
             >
               {isMobile ? "Tap to wake" : "Click to wake"}
             </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subtitle speech bubble */}
      <AnimatePresence mode="wait">
        {active && subtitle && (
          <motion.div
            key={subtitle}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className={`absolute z-[10001] px-5 py-3 rounded-2xl border border-white/[0.15] text-white/95 font-medium tracking-wide text-center
              ${
                showDesktop
                  ? isMobile ? "top-[20vh] left-1/2 -translate-x-1/2 w-[92vw] text-sm" : "top-[15vh] left-1/2 -translate-x-1/2 w-[92vw] md:max-w-[520px] text-sm md:text-base"
                  : "relative mt-4 max-w-[80vw] md:max-w-[500px] text-base md:text-lg"
              }`}
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
              fontFamily: "-apple-system,'SF Pro Display',sans-serif",
            }}
          >
            {subtitle}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OS Dock */}
      <AnimatePresence>
        {showDesktop && !isMobile && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 z-[100] w-full flex justify-center pointer-events-auto"
          >
            <MacOSDock apps={presentationDockApps} onAppClick={() => {}} />
          </motion.div>
        )}
        {showDesktop && isMobile && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-2 z-[100] w-full flex justify-center pointer-events-auto"
          >
            <IOSDock 
              apps={presentationDockApps} 
              onAppClick={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
