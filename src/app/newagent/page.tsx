"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentFace, AgentState } from "@/components/AgentFace";
import { useAITeacher, ChatMessage, TeacherResponse, TeachingContext } from "@/hooks/use-ai-teacher";
import { LLM_MODELS } from "@/lib/llm-config";
import { useTTS } from "@/hooks/use-tts";
import { useConversationController, conversationMode } from "@/hooks/use-conversation-controller";
import { Mic, MicOff, ArrowUp, RefreshCw, WifiOff, Volume2 } from "lucide-react";
import { logPipeline, setPipelineContext } from "@/lib/logger";
import { useVAD } from "@/hooks/use-vad";

// ── Speech recognition hook ────────────────────────────────────────────────────
function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  // Keep latest callback in a ref to avoid stale closures during active listening
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const isStartingRef = useRef(false);

  const start = useCallback(() => {
    if (listening || isStartingRef.current) return;
    isStartingRef.current = true;
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      isStartingRef.current = false;
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    
    rec.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) onResultRef.current(text);
    };
    
    rec.onend = () => {
      logPipeline("SpeechRecognition stopped");
      setListening(false);
      isStartingRef.current = false;
    };
    
    rec.onerror = (e: any) => {
      setListening(false);
      isStartingRef.current = false;
    };
    
    recRef.current = rec;
    
    try {
      rec.start();
      logPipeline("SpeechRecognition started");
      setListening(true);
    } catch (err: any) {
      isStartingRef.current = false;
    }
  }, [listening]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const iv = setInterval(() => {
      setShown(text.slice(0, ++i));
      if (i >= text.length) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [text]);
  const sentences = shown.split(/([.?!]+\s+)/).reduce((acc: string[], val, i) => {
    if (i % 2 === 0) {
      acc.push(val);
    } else {
      acc[acc.length - 1] += val;
    }
    return acc;
  }, []).filter(s => s.trim().length > 0);

  return (
    <span className="flex flex-col gap-2 text-left items-center w-full">
      {sentences.map((sentence, i) => (
        <span key={i} className="block w-full">{sentence.trim()}</span>
      ))}
    </span>
  );
}

// ── Modular Model Selector / Override ─────────────────────────────────────────
function ModelOverrideMenu({ currentLabel, onSelectModel }: { currentLabel: string; onSelectModel: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const models = [
    { tier: "High (2.5 GB)", label: LLM_MODELS.high.label, id: LLM_MODELS.high.id },
    { tier: "Mid (~1 GB)", label: LLM_MODELS.mid.label, id: LLM_MODELS.mid.id },
    { tier: "Low (~100 MB)", label: LLM_MODELS.low.label, id: LLM_MODELS.low.id },
  ];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-white/30 hover:text-white/60 text-[11px] font-mono tracking-wide underline decoration-dotted transition-colors cursor-pointer"
        title="Click to override model"
      >
        {currentLabel} (change)
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 py-1 bg-[#121216] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col text-left">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/30 border-b border-white/5 font-sans">
            Select Model Override
          </div>
          {models.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setOpen(false); onSelectModel(m.id); }}
              className="text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex flex-col gap-0.5 font-mono"
            >
              <span>{m.label}</span>
              <span className="text-[10px] text-white/40">{m.tier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Slow-connection gate ──────────────────────────────────────────────────────
function SlowConnectionWarning({ modelLabel, sizeLabel, onProceed, onDowngrade, onSelectModel }: {
  modelLabel: string; sizeLabel: string;
  onProceed: () => void; onDowngrade: () => void;
  onSelectModel: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#070708] px-8"
    >
      <AgentFace state="thinking" size={56} />
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="flex items-center gap-2 text-yellow-400/80">
          <WifiOff size={16} />
          <span className="text-sm font-medium tracking-wide">Slow connection detected</span>
        </div>
        <p className="text-white/40 text-sm leading-relaxed">
          Your internet is slow right now.{" "}
          <strong className="text-white/60">{modelLabel}</strong> ({sizeLabel}) could take a while.
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={onProceed}
            className="w-full py-2.5 rounded-xl border border-white/15 text-white/70 text-sm hover:border-white/30 hover:text-white/90 transition-all font-medium"
          >
            Download anyway ({sizeLabel})
          </button>
          <button
            onClick={() => onSelectModel(LLM_MODELS.mid.id)}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white/70 text-sm hover:bg-white/[0.1] hover:text-white transition-all font-medium"
          >
            Upgrade to SmolLM2 1.7B (~1 GB)
          </button>
          <button
            onClick={() => onSelectModel(LLM_MODELS.high.id)}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white/70 text-sm hover:bg-white/[0.1] hover:text-white transition-all font-medium"
          >
            Upgrade to Phi-4 Mini (2.5 GB)
          </button>
          <button
            onClick={onDowngrade}
            className="w-full py-2.5 rounded-xl bg-white/[0.02] text-white/40 text-sm hover:bg-white/[0.05] hover:text-white/60 transition-all"
          >
            Use lightest model (~100 MB)
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Download progress ─────────────────────────────────────────────────────────
function LoadingOverlay({ progress, text, modelLabel, sizeLabel }: {
  progress: number; text: string; modelLabel: string; sizeLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#070708]"
    >
      <AgentFace state="sleeping" size={68} />
      <div className="flex flex-col items-center gap-3 w-64">
        <div className="flex items-center justify-between w-full text-xs text-white/40 font-mono">
          <span>{modelLabel}</span>
          <span>{sizeLabel}</span>
        </div>
        <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.3 }}
          />
        </div>
        <p className="text-white/30 text-xs text-center leading-relaxed font-mono">{text}</p>
        <p className="text-white/15 text-[10px]">Downloads once · cached forever</p>
      </div>
    </motion.div>
  );
}

function ErrorOverlay({ errorMessage, onRetry, onDowngrade, onCustomModel }: {
  errorMessage: string;
  onRetry: () => void;
  onDowngrade: () => void;
  onCustomModel: (id: string) => void;
}) {
  const [customId, setCustomId] = useState("");

  const handleClearCache = async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#070708] px-8 overflow-y-auto"
    >
      <AgentFace state="error" size={45} />
      <div className="flex flex-col items-center gap-3 max-w-sm text-center">
        <p className="text-white/50 text-sm leading-relaxed">
          Couldn&apos;t load the model.
        </p>
        {errorMessage && (
          <p className="text-white/20 text-[10px] font-mono break-all leading-relaxed px-2">
            {errorMessage.slice(0, 160)}
          </p>
        )}
        
        <div className="flex flex-col gap-2 w-full mt-3">
          <button onClick={onRetry} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white/80 transition-all">
            <RefreshCw size={14} /> Try again
          </button>
          <button onClick={onDowngrade} className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] hover:text-white/70 transition-all">
            Try smallest available model
          </button>
        </div>

        <div className="w-full h-px bg-white/10 my-2" />
        
        <div className="flex flex-col w-full gap-2 text-left">
          <p className="text-white/40 text-xs mb-1">Already got a working model in your other project? Paste its EXACT ID here to bypass download:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={customId}
              onChange={e => setCustomId(e.target.value)}
              placeholder="e.g. SmolLM2-360M-Instruct-q4f16_1-MLC" 
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
            <button 
              onClick={() => customId.trim() && onCustomModel(customId.trim())}
              className="px-4 py-2 bg-white/10 rounded-lg text-white/70 text-xs hover:bg-white/20 transition-all"
            >
              Load
            </button>
          </div>
        </div>

        <button onClick={handleClearCache} className="w-full py-2 rounded-lg text-red-500/50 text-xs hover:text-red-400 transition-all mt-4">
          Wipe cache & reload
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeacherPage() {
  const ai = useAITeacher();
  const { speak, stop: stopTTS, isSpeaking } = useTTS({ voice: "en-US-AriaNeural" });

  const conversation = useConversationController("idle");
  const [chatError, setChatError]       = useState(false);
  const [subtitle, setSubtitle]         = useState("");
  const [input, setInput]               = useState("");
  const [history, setHistory]           = useState<ChatMessage[]>([]);
  const [context, setContext]           = useState<TeachingContext>({ phase: "hook" });
  const [streamBuffer, setStreamBuffer] = useState("");

  // Tracks whether we've made the connection decision yet
  // null = waiting for detection, true = show warning, false = proceed
  const [showSlowWarning, setShowSlowWarning] = useState<boolean | null>(null);

  const inputRef   = useRef<HTMLInputElement>(null);
  const hasAutoStartedMicRef = useRef(false);
  const isProcessing = conversation.isThinking || isSpeaking;

  // ── Once connection speed is known, decide whether to gate or auto-load ──
  useEffect(() => {
    if (ai.isFastConnection === null) return;     // still detecting
    if (showSlowWarning !== null) return;          // already decided

    // If connection is fast OR if we are already defaulting to the smallest model, 
    // skip the warning and just auto-load.
    if (ai.isFastConnection || ai.modelLabel.includes("SmolLM")) {
      setShowSlowWarning(false);
      ai.load();
    } else {
      // Slow connection and trying to load a large model: show warning
      setShowSlowWarning(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.isFastConnection, ai.modelLabel]);

  const handleProceed = useCallback(() => {
    setShowSlowWarning(false);
    ai.load();
  }, [ai]);

  const handleDowngrade = useCallback(() => {
    setShowSlowWarning(false);
    ai.downgradeAndLoad();
  }, [ai]);

  const handleRetry = useCallback(async () => {
    await ai.reset();
    // After reset, load() re-arms the download
    ai.load();
  }, [ai]);

  const handleErrorDowngrade = useCallback(() => {
    ai.downgradeAndLoad();
  }, [ai]);

  // ── Mic ───────────────────────────────────────────────────────────────────
  const handleSubmitRef = useRef<((e?: React.FormEvent, overrideText?: string) => void) | null>(null);

  const { startVAD, isSpeechDetected } = useVAD();

  useEffect(() => {
    // Start VAD in the background for Phase 1 testing
    startVAD();
  }, [startVAD]);

  useEffect(() => {
    setPipelineContext(conversation.state, ai.status, conversationMode);
  }, [conversation.state, ai.status, conversationMode]);

  const prevStateRef = useRef(conversation.state);
  useEffect(() => {
    if (prevStateRef.current !== conversation.state) {
      logPipeline(`Conversation state: ${conversation.state.charAt(0).toUpperCase() + conversation.state.slice(1)}`);
      prevStateRef.current = conversation.state;
    }
  }, [conversation.state]);

  // ── True Conversational Interruption (Phase 2) ────────────────────────────
  const interruptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track current states in refs to avoid dependency loops in the timeout
  const currentStateRef = useRef(conversation.state);
  useEffect(() => { currentStateRef.current = conversation.state; }, [conversation.state]);

  // ── Phase 3: Smart Turn-Taking (VAD 2-Second Silence Threshold) ───────────
  const VAD_SILENCE_TIMEOUT_MS = 2000;
  const turnTakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedInputRef = useRef(input);
  useEffect(() => { accumulatedInputRef.current = input; }, [input]);

  const { listening, start: startMic, stop: stopMic } = useSpeechRecognition((newText) => {
    setInput(prev => {
      if (!prev) logPipeline("First transcript received");
      logPipeline("Transcript updated");
      return prev ? `${prev} ${newText}` : newText;
    });
  });

  const isListeningRef = useRef(listening);
  useEffect(() => { isListeningRef.current = listening; }, [listening]);

  const [userSpeechConfirmed, setUserSpeechConfirmed] = useState(false);

  useEffect(() => {
    if (isSpeechDetected) {
      if (currentStateRef.current === "speaking" || currentStateRef.current === "thinking") {
        // Require ~200ms of sustained speech to reduce false triggers from clicks/coughs
        interruptTimeoutRef.current = setTimeout(() => {
          setUserSpeechConfirmed(true);
          logPipeline("VAD detected speech");
          logPipeline("Interruption triggered");
          
          stopTTS();
          ai.abort();
          logPipeline("LLM aborted");
          
          // Note: We no longer rollback the history here.
          // By leaving the unanswered user message in the history, handleSubmit will naturally
          // merge the new interrupted speech into it using a system tag!
          
          conversation.enterListening();
          
          if (!isListeningRef.current) {
            try { startMic(); } catch(e) {}
          }
        }, 200);
      } else if (currentStateRef.current === "idle") {
        // Wake word / Wake up from idle
        interruptTimeoutRef.current = setTimeout(() => {
          setUserSpeechConfirmed(true);
          conversation.enterListening();
          
          if (!isListeningRef.current) {
            try { startMic(); } catch(e) {}
          }
        }, 200);
      } else {
        // If already listening, there is no TTS bleed risk. Confirm immediately for responsive UI.
        setUserSpeechConfirmed(true);
      }
    } else {
      setUserSpeechConfirmed(false);
      // If VAD misfires or speech ends before 200ms, cancel the interruption
      if (interruptTimeoutRef.current) {
        clearTimeout(interruptTimeoutRef.current);
        interruptTimeoutRef.current = null;
      }
    }

    return () => {
      if (interruptTimeoutRef.current) {
        clearTimeout(interruptTimeoutRef.current);
      }
    };
  }, [isSpeechDetected, stopTTS, ai, conversation, startMic]);

  // Phase 3: Silence Threshold Submission
  useEffect(() => {
    if (isSpeechDetected) {
      // User is speaking! Cancel any pending submission timers!
      if (turnTakingTimeoutRef.current) {
         clearTimeout(turnTakingTimeoutRef.current);
         turnTakingTimeoutRef.current = null;
         logPipeline("Silence timer cancelled");
      }
    } else {
      // Speech ended. If we are currently accumulating text, start the silence countdown!
      if (currentStateRef.current === "listening" && accumulatedInputRef.current.trim().length > 0) {
        logPipeline("Silence timer started");
        turnTakingTimeoutRef.current = setTimeout(() => {
          logPipeline("Transcript submitted");
          handleSubmitRef.current?.(undefined, accumulatedInputRef.current);
        }, VAD_SILENCE_TIMEOUT_MS);
      }
    }
    
    return () => {
      if (turnTakingTimeoutRef.current) clearTimeout(turnTakingTimeoutRef.current);
    };
  }, [isSpeechDetected]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback((e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const text = overrideText !== undefined ? overrideText.trim() : input.trim();
    
    logPipeline("Submit Attempt", { text, isVoice: overrideText !== undefined });
    
    if (!text || ai.status !== "ready") {
      logPipeline("Submit Aborted", { reason: "empty or not ready" });
      return;
    }

    setInput(""); // Always clear input so it doesn't look like a pending message!
    
    stopTTS();
    setStreamBuffer("");
    conversation.enterThinking();
    setSubtitle("");

    logPipeline("Appending User Message to History");
    
    // Merge consecutive user messages to prevent LLM schema errors while retaining interruption context!
    let newHistory: ChatMessage[] = [...history];
    if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === "user") {
      const last = newHistory.pop()!;
      newHistory.push({
        role: "user",
        content: `${last.content}\n\n[User interrupted the previous response to add:]\n\n${text}`
      });
    } else {
      newHistory.push({ role: "user", content: text });
    }
    
    setHistory(newHistory);
    // Topic is dynamically updated to the newest user request, so the AI follows the student's attention!
    const updatedContext = { ...context, topic: text };
    setContext(updatedContext);

    logPipeline("LLM started");
    ai.chat(
      text,
      updatedContext,
      newHistory,
      // onChunk — live stream preview
      (partial) => {
        // We do not render the partial stream buffer because it contains raw JSON,
        // which looks broken/messy to the user. Just keep status as "Thinking..."
      },
      // onDone — structured response
      (response: TeacherResponse) => {
        logPipeline("LLM completed");
        setStreamBuffer("");
        setSubtitle(response.speech);
        setContext(prev => ({ ...prev, phase: response.phase as TeachingContext["phase"] }));
        setHistory(prev => [...prev, { role: "assistant", content: response.speech }]);
        conversation.enterSpeaking();
        
        logPipeline("Starting TTS Playback");
        speak(response.speech, () => {
          logPipeline("TTS Playback Finished");
          setSubtitle(response.question || "");
          if (conversationMode) {
            conversation.enterListening();
            try {
              logPipeline("recognition.start() requested after TTS");
              startMic();
            } catch (err) {
              console.error("[startMic error]", err);
              logPipeline("restart failed", err);
              // Do NOT enter idle. Force it to stay in listening state.
              conversation.enterListening();
            }
          } else {
            logPipeline("TTS Finished, Entering Idle (Push to Talk)");
            conversation.enterIdle();
          }
        });
      },
      // onError
      (err) => {
        console.error("[chat error]", err);
        logPipeline("Generation error", err);
        setChatError(true);
        // Rollback the un-answered user message to prevent consecutive user roles crashing the LLM on next turn
        logPipeline("Rolling back user history");
        setHistory(prev => prev.slice(0, -1));
        
        conversation.enterIdle();
        setSubtitle("Couldn't generate a response.");
        setTimeout(() => { 
          setChatError(false); 
          setSubtitle(""); 
          
          // Bug 2: Conversation Loop Recovery
          if (conversationMode && ai.status === "ready") {
            try {
              logPipeline("Restart requested");
              conversation.enterListening();
              startMic();
            } catch (e) {
              console.error("[startMic error during recovery]", e);
              logPipeline("restart failed", e);
              conversation.enterIdle();
            }
          }
        }, 3000);
      }
    );
  }, [input, isProcessing, ai, context, history, speak, stopTTS, conversation, startMic, conversationMode]);

  // Keep handleSubmitRef synced with the latest handleSubmit
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // ── Sync conversation state with listening ──────────────────────────────
  useEffect(() => {
    if (listening) {
      if (conversation.state === "idle") {
        conversation.enterListening();
      }
    } else {
      // If the mic drops (e.g. browser timed it out) but the AI is just sitting there (idle or listening),
      // we instantly restart the mic to achieve TRUE continuous conversation. No more idle state!
      if (conversation.state === "listening" || conversation.state === "idle") {
        conversation.enterListening();
        try {
          startMic();
        } catch (e) {
          // ignore
        }
      }
    }
  }, [listening, conversation, startMic]);

  // ── Auto-start microphone once when ready in Conversation Mode ────────────
  useEffect(() => {
    if (!conversationMode) return;
    if (ai.status === "ready" && !hasAutoStartedMicRef.current && !listening) {
      hasAutoStartedMicRef.current = true;
      startMic();
    }
  }, [ai.status, listening, startMic]);

  // Derived booleans for overlay logic
  const showWarning  = showSlowWarning === true;
  const showLoading  = !showWarning && ai.status === "loading";
  const showError    = !showWarning && !showLoading && ai.status === "error";
  const showMain     = !showWarning && !showLoading && !showError;

  return (
    <main className="relative w-full h-screen bg-[#070708] overflow-hidden flex flex-col items-center justify-center select-none">

      <AnimatePresence>
        {showWarning && (
          <SlowConnectionWarning
            key="slow-warning"
            modelLabel={ai.modelLabel}
            sizeLabel={ai.modelSizeLabel}
            onProceed={handleProceed}
            onDowngrade={handleDowngrade}
            onSelectModel={ai.loadCustomModel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoading && (
          <LoadingOverlay
            key="loading"
            progress={ai.progress}
            text={ai.progressText}
            modelLabel={ai.modelLabel}
            sizeLabel={ai.modelSizeLabel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showError && (
          <ErrorOverlay
            key="error"
            errorMessage={ai.errorMessage}
            onRetry={handleRetry}
            onDowngrade={handleErrorDowngrade}
            onCustomModel={ai.loadCustomModel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMain && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            {/* Face */}
            <motion.div
              animate={{ y: subtitle ? -24 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              className="flex flex-col items-center gap-8"
            >
              <AgentFace state={chatError ? "error" : conversation.agentState} size={124} isVoiceMode={listening} />

              {/* Conversation Status Indicator (Conversation Mode Only) */}
              {conversationMode && ai.status === "ready" && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                  {/* Subtle animated dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      conversation.state === "listening"
                        ? "bg-emerald-400 animate-pulse"
                        : conversation.state === "thinking"
                        ? "bg-amber-400 animate-ping"
                        : conversation.state === "speaking"
                        ? "bg-blue-400 animate-pulse"
                        : "bg-white/30"
                    }`}
                  />
                  <span
                    className={`text-xs tracking-wide font-medium ${
                      conversation.state === "listening"
                        ? "text-emerald-300/90 animate-pulse"
                        : conversation.state === "thinking"
                        ? "text-amber-300/90 animate-pulse"
                        : conversation.state === "speaking"
                        ? "text-blue-300/90"
                        : "text-white/40"
                    }`}
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  >
                    {conversation.state === "listening" && "Listening..."}
                    {conversation.state === "thinking" && "Thinking..."}
                    {conversation.state === "speaking" && "Speaking..."}
                    {conversation.state === "idle" && "Idle"}
                  </span>
                </div>
              )}

              {/* Phase 1 Temporary VAD Indicator */}
              <AnimatePresence>
                {userSpeechConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Hearing you...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subtitle */}
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p
                    key={subtitle.slice(0, 20)}
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    className="max-w-[600px] text-white/80 text-[16px] leading-relaxed px-6"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  >
                    <Typewriter text={subtitle} />
                  </motion.p>
                ) : !conversationMode && (isProcessing || conversation.isThinking) ? (
                  <motion.p
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/40 text-sm tracking-wide animate-pulse"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  >
                    Thinking…
                  </motion.p>
                ) : !conversationMode || ai.status === "idle" ? (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white/20 text-[13px] tracking-wide"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  >
                    {ai.status === "idle" ? "Initialising…" : "Ask me anything."}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>

            {/* Input bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[620px] px-5"
            >
              <form onSubmit={handleSubmit}>
                <div
                  className="relative flex items-center gap-3 rounded-[22px] px-4 py-3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: listening
                      ? "1.5px solid rgba(255,255,255,0.45)"
                      : "1.5px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  {/* Mic */}
                  {!conversationMode && (
                    <>
                      <button
                        type="button"
                        onClick={listening ? stopMic : startMic}
                        disabled={ai.status !== "ready"}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                        style={{
                          color:      listening ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                          background: listening ? "rgba(255,255,255,0.12)" : "transparent",
                        }}
                      >
                        {listening ? <MicOff size={16} strokeWidth={2} /> : <Mic size={16} strokeWidth={2} />}
                      </button>

                      {/* Mic pulse ring */}
                      <AnimatePresence>
                        {listening && (
                          <motion.div
                            className="absolute left-[18px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-white/30 pointer-events-none"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 2.4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                          />
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={
                      listening          ? "Listening…"
                      : ai.status !== "ready" ? "Model loading…"
                      : "What do you want to learn?"
                    }
                    disabled={listening || ai.status !== "ready"}
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/25 text-[15px] tracking-[-0.01em] disabled:opacity-40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); }}
                    autoFocus
                  />

                  {/* Send */}
                  <AnimatePresence>
                    {input.trim() && ai.status === "ready" && (
                      <motion.button
                        type="submit"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                        disabled={ai.status !== "ready"}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black disabled:opacity-40 transition-opacity"
                      >
                        <ArrowUp size={15} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              {/* Badge */}
              <div className="flex justify-center mt-3 gap-2 items-center">
                <ModelOverrideMenu
                  currentLabel={ai.modelLabel}
                  onSelectModel={ai.loadCustomModel}
                />
                <span className="text-white/15 text-[11px] font-mono tracking-wide">
                  · {ai.tier ?? "detecting"} tier · local
                </span>
                {ai.isFastConnection === false && (
                  <span className="flex items-center gap-1 text-yellow-400/30 text-[11px]">
                    <WifiOff size={10} /> slow wifi
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
