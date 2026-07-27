"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentFace, AgentState } from "@/components/AgentFace";
import { useAITeacher, ChatMessage, TeacherResponse, TeachingContext } from "@/hooks/use-ai-teacher";
import { useTTS } from "@/hooks/use-tts";
import { Mic, MicOff, ArrowUp, RefreshCw, WifiOff } from "lucide-react";

// ── Speech recognition hook ────────────────────────────────────────────────────
function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    rec.onend  = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

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
  return <>{shown}</>;
}

// ── Slow-connection gate ──────────────────────────────────────────────────────
function SlowConnectionWarning({ modelLabel, sizeLabel, onProceed, onDowngrade }: {
  modelLabel: string; sizeLabel: string;
  onProceed: () => void; onDowngrade: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#070708] px-8"
    >
      <AgentFace state="thinking" size={100} />
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
            className="w-full py-2.5 rounded-xl border border-white/15 text-white/70 text-sm hover:border-white/30 hover:text-white/90 transition-all"
          >
            Download anyway ({sizeLabel})
          </button>
          <button
            onClick={onDowngrade}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] hover:text-white/70 transition-all"
          >
            Use lighter model instead (~400 MB)
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
      <AgentFace state="sleeping" size={120} />
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
      <AgentFace state="error" size={80} />
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

  const [agentState, setAgentState]     = useState<AgentState>("idle");
  const [subtitle, setSubtitle]         = useState("");
  const [input, setInput]               = useState("");
  const [history, setHistory]           = useState<ChatMessage[]>([]);
  const [context, setContext]           = useState<TeachingContext>({ phase: "hook" });
  const [streamBuffer, setStreamBuffer] = useState("");

  // Tracks whether we've made the connection decision yet
  // null = waiting for detection, true = show warning, false = proceed
  const [showSlowWarning, setShowSlowWarning] = useState<boolean | null>(null);

  const inputRef   = useRef<HTMLInputElement>(null);
  const isProcessing = agentState === "thinking" || isSpeaking;

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
  const handleMicResult = useCallback((text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.form?.requestSubmit(), 150);
  }, []);
  const { listening, start: startMic, stop: stopMic } = useSpeechRecognition(handleMicResult);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isProcessing || ai.status !== "ready") return;

    setInput("");
    stopTTS();
    setStreamBuffer("");
    setAgentState("thinking");
    setSubtitle("");

    const newHistory: ChatMessage[] = [...history, { role: "user", content: text }];
    setHistory(newHistory);

    ai.chat(
      text,
      context,
      newHistory,
      // onChunk — live stream preview
      (partial) => {
        setStreamBuffer(partial);
      },
      // onDone — structured response
      (response: TeacherResponse) => {
        setStreamBuffer("");
        setSubtitle(response.speech);
        setContext(prev => ({ ...prev, phase: response.phase as TeachingContext["phase"] }));
        setHistory(prev => [...prev, { role: "assistant", content: response.speech }]);
        setAgentState("speaking");
        speak(response.speech, () => {
          setSubtitle(response.question || "");
          setAgentState("idle");
        });
      },
      // onError
      (err) => {
        console.error("[chat error]", err);
        setAgentState("error");
        setSubtitle("Couldn't generate a response.");
        setTimeout(() => { setAgentState("idle"); setSubtitle(""); }, 3000);
      }
    );
  }, [input, isProcessing, ai, context, history, speak, stopTTS]);

  // ── Sync agent state with listening / speaking ────────────────────────────
  useEffect(() => {
    if (listening) setAgentState("listening");
    else if (isSpeaking && agentState !== "thinking") setAgentState("speaking");
  }, [listening, isSpeaking, agentState]);

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
              <AgentFace state={agentState} size={220} isVoiceMode={listening} />

              {/* Subtitle */}
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p
                    key={subtitle.slice(0, 20)}
                    initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    className="max-w-[500px] text-center text-white/70 text-[15px] leading-relaxed px-6"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  >
                    <Typewriter text={subtitle} />
                  </motion.p>
                ) : streamBuffer ? (
                  <motion.p
                    key="stream"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-[500px] text-center text-white/20 text-xs font-mono px-6 leading-relaxed"
                  >
                    {streamBuffer.slice(-120)}
                  </motion.p>
                ) : (
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
                )}
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
                  <button
                    type="button"
                    onClick={listening ? stopMic : startMic}
                    disabled={isProcessing}
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
                    disabled={isProcessing || listening || ai.status !== "ready"}
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
                        disabled={isProcessing}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black disabled:opacity-40 transition-opacity"
                      >
                        <ArrowUp size={15} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              {/* Badge */}
              <div className="flex justify-center mt-3 gap-3 items-center">
                <span className="text-white/15 text-[11px] font-mono tracking-wide">
                  {ai.modelLabel} · {ai.tier ?? "detecting"} tier · local
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
