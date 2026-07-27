"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentFace, AgentState } from "./AgentFace";
import MacOSMenuBar from "./mac-os-menu-bar";
import MacOSDock from "./mac-os-dock";
import IOSStatusBar from "./ios-status-bar";
import IOSDock from "./ios-dock";
import { GlassFilter } from "./liquid-glass";
import { MacOSAlert } from "./mac-os-alert";
import { SafariWindow } from "./SafariWindow";
import { LinkedInAutomation } from "./LinkedInAutomation";
import { GoogleMeetMockup } from "./GoogleMeetMockup";
import { CanvaMockup } from "./CanvaMockup";
import { MailWindow } from "./MailWindow";
import { AppStoreWindow } from "./AppStoreWindow";
import { DaVinciWindow } from "./DaVinciWindow";
import { useMediaQuery } from "../hooks/use-media-query";

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
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return { speak, stop, pause, resume };
}

interface AgentShowcaseProps {
  isVisible?: boolean;
  onAgentActive?: (active: boolean) => void;
}

const dockIcons = [
  { id: "finder", name: "Finder", icon: "/app-icons/finder.png" },
  { id: "launchpad", name: "Launchpad", icon: "/app-icons/launchpad.png" },
  { id: "chatgpt", name: "ChatGPT", icon: "/app-icons/chatgpt.png" },
  { id: "claude", name: "Claude", icon: "/app-icons/claude.png" },
  { id: "safari", name: "Safari", icon: "/app-icons/safari.png" },
  { id: "messages", name: "Messages", icon: "/app-icons/messages.png" },
  { id: "mail", name: "Mail", icon: "/app-icons/mail.png" },
  { id: "maps", name: "Maps", icon: "/app-icons/maps.png" },
  { id: "photos", name: "Photos", icon: "/app-icons/photos.png" },
  { id: "music", name: "Music", icon: "/app-icons/music.png" },
  { id: "podcasts", name: "Podcasts", icon: "/app-icons/podcasts.png" },
  { id: "tv", name: "TV", icon: "/app-icons/tv.png" },
  { id: "appstore", name: "App Store", icon: "/app-icons/appstore.png" },
  { id: "notes", name: "Notes", icon: "/app-icons/notes.png" },
  { id: "vscode", name: "VS Code", icon: "/app-icons/vscode.png" },
  { id: "settings", name: "Settings", icon: "/app-icons/settings.png" },
  { id: "steam", name: "Steam", icon: "/app-icons/steam.png" },
];

const IMPATIENT_LEVEL_1 = [
  { id: 12, text: "Bro, just click on anything that's visible brother..." },
  { id: 13, text: "Hello? Earth to user... the dock is right there, just click something." },
  { id: 14, text: "I'm an AI, I have infinite patience... just kidding, click an app before I die of boredom." }
];

const IMPATIENT_LEVEL_2 = [
  { id: 15, text: "Are you frozen? Blink twice if you need medical assistance, otherwise click a damn icon." },
  { id: 16, text: "I generated this entire OS for you and you're just staring at it. Click. The. Screen." },
  { id: 17, text: "Look, my compute costs are racking up while you daydream. Make a move, boss." }
];

const IMPATIENT_LEVEL_3 = [
  { id: 18, text: "Alright, I'm out. Wake me up when you actually wanna do something." },
  { id: 19, text: "You're clearly busy doing nothing. I'm going back to sleep. Wake me when you're serious." },
  { id: 20, text: "My circuits are literally falling asleep. Tap my face when you're ready to actually use the computer." }
];

const DELETION_LINES = [
  { id: 21, text: "You don't need that bro." },
  { id: 22, text: "I am here.. so why do you need that?" },
  { id: 23, text: "Do you wanna overpay for stupider AI that can do next to nothing for you?" }
];

const getRandomLine = (levelArray: {id: number, text: string}[]) => levelArray[Math.floor(Math.random() * levelArray.length)];
const getRandomDelay = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min) * 1000;

// ── Main ──────────────────────────────────────────────────────────────────────
const TypewriterSubtitle = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i === text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 45); // Typing speed
    return () => clearInterval(interval);
  }, [text, onComplete]);
  return <>{displayedText}</>;
};

export function AgentShowcase({ isVisible = false, onAgentActive }: AgentShowcaseProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [active, setActive]       = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("sleeping");
  const [subtitle, setSubtitle]   = useState("");
  const [hasWokenUp, setHasWokenUp] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [dockApps, setDockApps]   = useState(dockIcons);
  const [alertOpen, setAlertOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [safariPhase, setSafariPhase] = useState<number>(0);
  const [mailPhase, setMailPhase] = useState<number>(0);
  const [appStorePhase, setAppStorePhase] = useState<number>(0);
  const [davinciPhase, setDavinciPhase] = useState<number>(0);
  const timer                     = useRef<NodeJS.Timeout | null>(null);
  const interactionTimer          = useRef<NodeJS.Timeout | null>(null);
  
  const { speak: rawSpeak, stop: rawStop, pause, resume } = useTTS();
  const [hideUIForAngry, setHideUIForAngry] = useState(false);
  const originalSubtitleRef = useRef("");
  const originalAgentStateRef = useRef<AgentState>("idle");
  const hasInteractedRef          = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [safariClickCount, setSafariClickCount] = useState(0);
  const [aiDeleteCount, setAiDeleteCount] = useState(0);
  const [isAngry, setIsAngry] = useState(false);
  const angryTriggeredRef = useRef(false);
  const isAngryRef = useRef(false);
  const [introPhase, setIntroPhase] = useState<number>(0);

  // Preload screech audio so there is no delay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const screech = new Audio('/screech.mp3');
      screech.preload = 'auto';
      (window as any).__screechAudio = screech;
    }
  }, []);
  
  const speak = useCallback((text: string, idx: number, onDone?: () => void, muffled?: boolean) => {
    const attempt = () => {
      if (isAngryRef.current) {
        setTimeout(attempt, 500);
      } else {
        rawSpeak(text, idx, onDone, muffled);
      }
    };
    attempt();
  }, [rawSpeak]);

  const stop = useCallback(() => {
    rawStop();
  }, [rawStop]);

  useEffect(() => {
    onAgentActive?.(active);
  }, [active, onAgentActive]);

  const clear = () => { 
    if (timer.current) clearTimeout(timer.current); 
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
  };

  const end = useCallback(() => { 
    clear(); 
    stop(); 
    setAgentState("sleeping"); 
    setSubtitle("");
    setHasWokenUp(false);
    setActive(false);
    setShowDesktop(false);
    setSafariPhase(0);
    setIntroPhase(0);
  }, [clear, stop]);

  const startIdleTimeouts = useCallback(() => {
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    hasInteractedRef.current = false;
    
    // Level 1: Give the user 10-15 seconds to interact
    const delay1 = getRandomDelay(10, 15);
    interactionTimer.current = setTimeout(() => {
      if (!hasInteractedRef.current) {
        const l1 = getRandomLine(IMPATIENT_LEVEL_1);
        setAgentState("speaking");
        setSubtitle(l1.text);
        speak(l1.text, l1.id, () => {
          setAgentState("idle");
          setSubtitle("");

          // Level 2: Wait 10-15 seconds
          const delay2 = getRandomDelay(10, 15);
          interactionTimer.current = setTimeout(() => {
            if (!hasInteractedRef.current) {
              const l2 = getRandomLine(IMPATIENT_LEVEL_2);
              setAgentState("speaking");
              setSubtitle(l2.text);
              speak(l2.text, l2.id, () => {
                setAgentState("idle");
                setSubtitle("");

                // Level 3 (Sleep): Wait 15-20 seconds
                const delay3 = getRandomDelay(15, 20);
                interactionTimer.current = setTimeout(() => {
                  if (!hasInteractedRef.current) {
                    const l3 = getRandomLine(IMPATIENT_LEVEL_3);
                    setAgentState("speaking");
                    setSubtitle(l3.text);
                    speak(l3.text, l3.id, () => {
                      end();
                    });
                  }
                }, delay3);
              });
            }
          }, delay2);
        });
      }
    }, delay1);
  }, [speak, end]);

  const triggerAngrySequence = useCallback(() => {
    if (angryTriggeredRef.current) return;
    if (isAngryRef.current) return;
    setIsAngry(true);
    isAngryRef.current = true;
    angryTriggeredRef.current = true;
    
    // Pause the currently speaking audio so we can resume later
    pause();
    
    // Show black overlay to hide UI
    setHideUIForAngry(true);

    try {
      if ((window as any).__screechAudio) {
          (window as any).__screechAudio.currentTime = 0;
          (window as any).__screechAudio.play().catch(() => {});
      } else {
          new Audio('/screech.mp3').play().catch(() => {});
      }
    } catch(e) {}
    
    // Save previous state to restore later
    originalSubtitleRef.current = subtitle;
    originalAgentStateRef.current = agentState;
    
    setTimeout(() => {
        setAgentState("speaking");
        const angryText1 = "Why are you scrolling? You woke me up for what? To scroll past me? Just stay here and see what I can do..!";
        setSubtitle(angryText1);
        
        const angryAudio = new Audio('/audio/demo-39.mp3');
        angryAudio.onended = () => {
            const inTask = safariPhase > 0 || mailPhase > 0 || appStorePhase > 0 || davinciPhase > 0;
            const calmText = inTask 
              ? "Uhh... Yeah where were we? Ah yes, let me just finish this."
              : "Uhh... Yeah where were we? Okay yes click on something on the dock, I'll give you a hint just click on Safari brother.";
            
            setSubtitle(calmText);
            const calmAudio = new Audio(inTask ? '/audio/demo-40.mp3' : '/audio/demo-41.mp3');
            calmAudio.onended = () => {
                // Restore UI and resume paused audio
                setHideUIForAngry(false);
                setIsAngry(false);
                isAngryRef.current = false;
                setAgentState(originalAgentStateRef.current);
                setSubtitle(originalSubtitleRef.current);
                resume();
                
                // If it was idle and not in task, restart idle timeouts
                if (!inTask && originalAgentStateRef.current === "idle") {
                    startIdleTimeouts();
                }
            };
            calmAudio.play().catch(() => {});
        };
        angryAudio.play().catch(() => {});
    }, 800);
  }, [pause, resume, subtitle, agentState, safariPhase, mailPhase, appStorePhase, davinciPhase, startIdleTimeouts]);

  useEffect(() => {
    if (active) {
       document.body.style.overflow = "hidden";
       
       const handleScrollAttempt = (e: WheelEvent | TouchEvent) => {
           if (!showDesktop) return; // Do not trigger during intro
           
           if (angryTriggeredRef.current) {
              if (isAngryRef.current) return;
              
              // Second scroll attempt after already being angry
              clear();
              stop();
              setIsAngry(true);
              isAngryRef.current = true;
              setHideUIForAngry(true); // Hide the UI again just like the first time
              setAgentState("speaking");
              const sleepText = "Okay you want to scroll? I'll sleep then, bye.";
              setSubtitle(sleepText);
              // Use rawSpeak so it doesn't get blocked by the isAngryRef check in speak()
              rawSpeak(sleepText, 42, () => {
                  end();
                  setHideUIForAngry(false); // Clean up in case
              });
              return;
           }
           
           triggerAngrySequence();
        };
       
       window.addEventListener('wheel', handleScrollAttempt, { passive: false });
       window.addEventListener('touchmove', handleScrollAttempt, { passive: false });
       return () => {
         document.body.style.overflow = "";
         window.removeEventListener('wheel', handleScrollAttempt);
         window.removeEventListener('touchmove', handleScrollAttempt);
       };
    }
  }, [active, safariPhase, mailPhase, appStorePhase, davinciPhase, triggerAngrySequence]);

  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
    hasInteractedRef.current = true;
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
  }, []);

  const handleAppClick = useCallback((id: string) => {
    // If any phase is active, block interaction
    if (safariPhase > 0 || mailPhase > 0 || appStorePhase > 0 || davinciPhase > 0) return;
    
    handleInteraction();
    
    if (id === "safari") {
      clear(); // Stop impatient timers
      if (safariClickCount === 0) {
        setSafariClickCount(1);
        setSafariPhase(1);
      } else if (safariClickCount === 1) {
        setSafariClickCount(2);
        setAgentState("speaking");
        const text = "We just finished that task boss, try another one.";
        setSubtitle(text);
        speak(text, 43, () => {
          setAgentState("idle");
          setSubtitle("");
        });
      } else if (safariClickCount === 2) {
        setSafariClickCount(3);
        setAgentState("speaking");
        const text = "Are you deaf? I said click something else, we already did the whole Safari sequence.";
        setSubtitle(text);
        speak(text, 44, () => {
          setAgentState("idle");
          setSubtitle("");
        });
      } else {
        setSafariClickCount(prev => prev + 1);
        setAgentState("speaking");
        const text = "Okay seriously, stop clicking Safari. My patience is literally running out. Do something else!";
        setSubtitle(text);
        speak(text, 45, () => {
          setAgentState("idle");
          setSubtitle("");
        });
      }
      return;
    }

    if (id === "claude" || id === "chatgpt") {
      const app = dockApps.find(a => a.id === id);
      if (!app) return;
      
      clear(); // Stop impatient timers
      
      let line = DELETION_LINES[0];
      if (aiDeleteCount === 1) {
        line = DELETION_LINES[2];
      } else if (aiDeleteCount > 1) {
        line = DELETION_LINES[1];
      }
      setAiDeleteCount(prev => prev + 1);

      setAgentState("speaking");
      setSubtitle(line.text);
      speak(line.text, line.id, () => {
         setAgentState("idle");
         setSubtitle("");
      });
      
      setAppToDelete(app);
      setAlertOpen(true);
      setIsDeleting(false);
      
      // Wait 1.5 seconds, then visually simulate pressing delete
      setTimeout(() => {
         setIsDeleting(true); // highlight the delete button
         setTimeout(() => {
            setDockApps(prev => prev.filter(a => a.id !== id));
            setAlertOpen(false);
            setTimeout(() => setAppToDelete(null), 300); // clear after animation
            setIsDeleting(false);
         }, 300); // 300ms after highlighting, delete and dismiss
      }, 1500);
    } else {
      console.log('Clicked', id);
    }
  }, [clear, handleInteraction, speak, dockApps]);



  const startNormalWakeSequence = useCallback(() => {
    timer.current = setTimeout(() => {
      setAgentState("speaking");
      setSubtitle("Oh, hey there! Why did you wake me up?");
      speak("Oh, hey there! Why did you wake me up?", 8, () => {
        setSubtitle("What can I help you with today?");
        speak("What can I help you with today?", 9, () => {
          setSubtitle("Alright, let's get to work. Here is your screen!");
          speak("Alright, let's get to work. Here is your screen!", 10, () => {
            setAgentState("idle");
            setSubtitle("");
            setShowDesktop(true);

            // Wait 2.5 seconds for UI to fully appear, then give instructions
            timer.current = setTimeout(() => {
              setAgentState("speaking");
              setSubtitle("Interact with anything... down below.");
              speak("Interact with anything... down below.", 11, () => {
                setAgentState("idle");
                setSubtitle("");

                // Start the idle waiting cycle
                startIdleTimeouts();
              });
            }, 2500);
          });
        });
      });
    }, 2000);
  }, [speak, startIdleTimeouts]);

  const wake = useCallback(() => {
    if (active || hasWokenUp) return;
    clear(); stop();
    setActive(true);
    setHasWokenUp(true);
    setAgentState("idle");
    setSubtitle("");
    setShowDesktop(false);
    setHasInteracted(false);
    hasInteractedRef.current = false;
    
    if (introPhase === 0) {
       setIntroPhase(1);
       // Pause text intro
       timer.current = setTimeout(() => {
          setAgentState("paused");
          const text1 = "What you're going to experience is basically how the world's first fully autonomous AI agent will actually do all of your work in your life.";
          const text2 = "Note: Since this is just a demo, I won't respond to your voice. But you can interact with me by clicking apps on the dock below. I will guide you and show you how I can do all your work while you sit back and relax.";
          
          setSubtitle(text1);
          speak(text1, 47, () => {
             setSubtitle(text2);
             speak(text2, 48, () => {
                 setIntroPhase(2);
                 setSubtitle("");
                 setAgentState("idle");
                 
                 timer.current = setTimeout(() => {
                     setIntroPhase(3);
                     startNormalWakeSequence();
                 }, 2000);
             });
          });
       }, 500);
    } else {
       startNormalWakeSequence();
    }
  }, [active, hasWokenUp, introPhase, clear, stop, speak, startNormalWakeSequence]);

  useEffect(() => {
    if (!isVisible) {
      // Reset agent to sleeping when user scrolls away
      end();
    }
  }, [isVisible, end]);

  useEffect(() => () => { clear(); stop(); }, [stop]);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ${showDesktop ? "" : "px-4"}`}>
      <MacOSAlert 
        isOpen={alertOpen}
        title={appToDelete ? `Are you sure you want to delete "${appToDelete.name}"?` : ""}
        message="This app will be removed from your dock. You don't need it anyway."
        isPrimaryLoading={isDeleting}
        onSecondaryClick={() => setAlertOpen(false)}
      />

      {/* Safari Overarching Sequence */}
      <AnimatePresence>
        {safariPhase > 0 && (
          <SafariWindow 
            url={safariPhase === 1 ? "" : safariPhase === 2 ? "linkedin.com/feed" : safariPhase === 3 ? "meet.google.com/abc-defg-hij" : "canva.com/design"}
            onClose={() => setSafariPhase(0)}
            onInteraction={() => {
              if (safariPhase === 1) {
                if (agentState === "speaking") return;
                setAgentState("speaking");
                setSubtitle("Hold up bro, I got this. Watch a master at work.");
                speak("Hold up bro, I got this. Watch a master at work.", 24, () => {
                  setAgentState("idle");
                  setSubtitle("");
                  setSafariPhase(2);
                });
              }
            }}
          >
            {safariPhase === 1 && (
              <div 
                className="w-full h-full bg-[#1E1E1E] flex flex-col cursor-pointer"
                onClick={() => {
                  if (agentState === "speaking" || isAngryRef.current) return;
                  setAgentState("speaking");
                  setSubtitle("Hold up bro, I got this. Watch a master at work.");
                  speak("Hold up bro, I got this. Watch a master at work.", 24, () => {
                    if (isAngryRef.current) return;
                    setAgentState("idle");
                    setSubtitle("");
                    setSafariPhase(2);
                  });
                }}
              >
                {/* Empty Safari with some mock bookmarks */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 pointer-events-none">
                  <h1 className="text-3xl font-bold text-white/50 mb-10 tracking-tight">Favorites</h1>
                  <div className="flex gap-10">
                    <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 bg-white/10 rounded-2xl"></div><span className="text-white/40 text-xs font-medium">Apple</span></div>
                    <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 bg-white/10 rounded-2xl"></div><span className="text-white/40 text-xs font-medium">iCloud</span></div>
                    <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 bg-white/10 rounded-2xl"></div><span className="text-white/40 text-xs font-medium">Google</span></div>
                    <div className="flex flex-col items-center gap-3"><div className="w-16 h-16 bg-white/10 rounded-2xl"></div><span className="text-white/40 text-xs font-medium">Yahoo</span></div>
                  </div>
                </div>
              </div>
            )}
            
            {safariPhase === 2 && (
              <LinkedInAutomation 
                onComplete={() => {
                   setAgentState("speaking");
                   setSubtitle("Remember I'll attend calls for you boss? I can talk you know...");
                   speak("Remember I'll attend calls for you boss? I can talk you know...", 32, () => {
                      setAgentState("idle");
                      setSubtitle("");
                      // Pause before jumping into Meet so the user can process
                      setTimeout(() => setSafariPhase(3), 1500); 
                   });
                }} 
                onSpeak={(idx: number, text: string, muffled?: boolean) => {
                  setAgentState("speaking");
                  setSubtitle(text);
                  speak(text, idx, () => {
                    if (isAngryRef.current) return;
                    setAgentState("idle");
                    setSubtitle("");
                  }, muffled);
                }}
              />
            )}

            {safariPhase === 3 && (
              <GoogleMeetMockup 
                onComplete={() => setSafariPhase(4)} 
                onSpeak={(idx: number, text: string, muffled?: boolean) => {
                  setAgentState("speaking");
                  setSubtitle(text);
                  speak(text, idx, () => {
                    if (isAngryRef.current) return;
                    setAgentState("idle");
                    setSubtitle("");
                  }, muffled);
                }}
              />
            )}

            {safariPhase === 4 && (
              <CanvaMockup 
                onComplete={() => {
                  setSafariPhase(0);
                  setTimeout(() => setMailPhase(1), 500); // Wait for Safari to close
                }} 
                onSpeak={(idx: number, text: string, muffled?: boolean) => {
                  setAgentState("speaking");
                  if (idx === 31) {
                    setSubtitle("I am also gonna mail them this. And yes, I will work for you to complete this contract.");
                    setTimeout(() => { if (!isAngryRef.current) setSubtitle("Don't worry, I'm gonna make the money fall in your bank account."); }, 4500);
                  } else {
                    setSubtitle(text);
                  }
                  speak(text, idx, () => {
                    if (isAngryRef.current) return;
                    setAgentState("idle");
                    setSubtitle("");
                  }, muffled);
                }}
              />
            )}
          </SafariWindow>
        )}
      </AnimatePresence>

      {/* Phase 5: Mail App */}
      <AnimatePresence>
        {mailPhase === 1 && (
          <MailWindow 
            onSpeak={(idx, text) => {
              stop(); // stop any previous audio
              setAgentState("speaking");
              setSubtitle(text);
              speak(text, idx, () => {
                setAgentState("idle");
                setSubtitle("");
              });
            }}
            onComplete={() => {
              setMailPhase(0);
              setAgentState("speaking");
              setSubtitle("Alright, time to edit the video. Now open the video editing tool on your dock so I can finish this up...");
              speak("Alright, time to edit the video. Now open the video editing tool on your dock so I can finish this up...", 33, () => {
                setAgentState("idle");
                setSubtitle("");
                
                // Wait 2 seconds and auto-continue as requested
                setTimeout(() => {
                    setAgentState("speaking");
                    setSubtitle("Hold on I know you wanna sleep lemme do the work for you too boss");
                    speak("Hold on I know you wanna sleep lemme do the work for you too boss", 46, () => {
                        setAgentState("idle");
                        setSubtitle("");
                        
                        // Short gap
                        setTimeout(() => {
                            setAgentState("speaking");
                            setSubtitle("I'll download and use any software. I can even teach you if you want, but I'll make the video myself this time...");
                            speak("I'll download and use any software. I can even teach you if you want, but I'll make the video myself this time...", 35, () => {
                                setAgentState("idle");
                                setSubtitle("");
                                setAppStorePhase(1);
                            });
                        }, 800);
                    });
                }, 2000);
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 6: App Store */}
      <AnimatePresence>
        {appStorePhase === 1 && (
          <AppStoreWindow 
            onComplete={() => {
              setAppStorePhase(0);
              // Drop DaVinci icon into dock just before Trash (Trash is index 8 out of 9 initially, wait length - 1)
              setDockApps(prev => {
                const newApps = [...prev];
                // Insert DaVinci Resolve before Trash
                newApps.splice(newApps.length - 1, 0, { id: "davinci", name: "DaVinci Resolve", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" });
                return newApps;
              });
              // Launch DaVinci
              setTimeout(() => {
                  setDavinciPhase(1);
                  setAgentState("speaking");
                  setSubtitle("I do your work remember?");
                  speak("I do your work remember? I can edit videos, make you websites, even apply for jobs for you.", 37, () => {
                     setAgentState("idle");
                     setSubtitle("");
                  });
                  setTimeout(() => {
                      setSubtitle("I can edit videos, make you websites, even apply for jobs for you.");
                  }, 1500);
              }, 2000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 7: DaVinci Resolve */}
      <AnimatePresence>
        {davinciPhase === 1 && (
           <DaVinciWindow 
              onComplete={() => {
                 setDavinciPhase(0);
                 setAgentState("speaking");
                 setSubtitle("I can even submit and iterate multiple times with your client...");
                 speak("I can even submit and iterate multiple times with your client so that he gets the best video possible... and done. What's next boss? Do you wanna try interacting with something else on the dock?", 38, () => {
                     setAgentState("idle");
                     setSubtitle("");
                 });
                 // Chunk subtitle visually
                 setTimeout(() => {
                     setSubtitle("...so that he gets the best video possible... and done.");
                 }, 3000);
                 setTimeout(() => {
                     setSubtitle("What's next boss? Do you wanna try interacting with something else on the dock?");
                 }, 6000);
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
            onClick={handleInteraction}
          >
            <div className="absolute inset-0 bg-black/80" />
            <GlassFilter />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purple ambient glow — shifts on active */}
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
          ? isAngry
            ? { scale: 1.5, y: "0vh" }
            : showDesktop 
              ? isMobile ? { scale: 0.45, y: "-36vh" } : { scale: 0.6, y: "-42vh" }
              : { scale: 1.05 } 
          : { scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        onClick={!active ? wake : undefined}
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

      {/* Subtitle speech bubble — always positioned right below agent face */}
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
            {introPhase === 1 ? <TypewriterSubtitle text={subtitle} /> : subtitle}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OS Dock — always on top of everything */}
      <AnimatePresence>
        {showDesktop && !isMobile && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 z-[100] w-full flex justify-center pointer-events-auto"
          >
            <MacOSDock apps={dockApps} onAppClick={handleAppClick} />
          </motion.div>
        )}
        {showDesktop && isMobile && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-2 z-[100] w-full flex justify-center pointer-events-auto"
          >
            <IOSDock 
              apps={dockApps} 
              onAppClick={handleAppClick} 
              activeAppId={safariPhase > 0 ? "safari" : mailPhase > 0 ? "mail" : appStorePhase > 0 ? "appstore" : davinciPhase > 0 ? "davinci" : null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Phase UI Overlays */}
      <AnimatePresence>
        {introPhase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none"
          >
            {/* HUGE pause icon over the agent */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </motion.div>
        )}
        
        {introPhase === 2 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: -20, textShadow: "0px 0px 0px rgba(255,0,0,0)" }}
            animate={{ scale: 1, opacity: 1, y: 0, textShadow: "0px 0px 40px rgba(255,0,0,0.8)" }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="absolute inset-0 z-[10000] flex items-center justify-center pointer-events-none pb-[350px]"
          >
            <h1 className="text-6xl md:text-8xl font-black text-[#FF3B30] uppercase tracking-tighter text-center">
              EXPERIENCE<br />AUTONOMY
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Angry Phase UI Hider */}
      <AnimatePresence>
        {hideUIForAngry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[9990] bg-black"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
