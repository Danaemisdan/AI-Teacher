"use client";

import { useState, useCallback, useEffect } from "react";
import type { TeachingContext } from "@/lib/llm-config";
import { buildSystemPrompt } from "@/lib/llm-config";
import { cleanSpeech } from "@/lib/clean-speech";

export type LLMStatus = "idle" | "loading" | "ready" | "error";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TeacherResponse {
  speech: string;
  face_state: "idle" | "speaking" | "thinking" | "excited" | "disappointed";
  canvas_action: "none" | "draw_diagram" | "show_code" | "show_equation" | "show_analogy";
  canvas_content: string;
  phase: "hook" | "scaffold" | "drill" | "feynman" | "challenge" | "next";
  question: string;
}

export interface UseWebLLMReturn {
  status: LLMStatus;
  progress: number;
  progressText: string;
  errorMessage: string;
  modelLabel: string;
  chat: (
    userMessage: string,
    context: TeachingContext,
    history: ChatMessage[],
    onChunk: (partial: string) => void,
    onDone: (response: TeacherResponse) => void,
    onError?: (err: string) => void
  ) => void;
  abort: () => void;
  unload: () => Promise<void>;
}

// ── Module-level singleton ──────────────────────────────────────────────────
let _engine: any = null;
let _loadedModelId: string | null = null;
let _loadingPromise: Promise<any> | null = null;
let _abortController: AbortController | null = null;

function extractJSON(raw: string): TeacherResponse | null {
  const start = raw.indexOf("{");
  const end   = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    return {
      speech:         typeof obj.speech         === "string" ? cleanSpeech(obj.speech)         : cleanSpeech(raw),
      face_state:     typeof obj.face_state      === "string" ? obj.face_state     : "speaking",
      canvas_action:  typeof obj.canvas_action   === "string" ? obj.canvas_action  : "none",
      canvas_content: typeof obj.canvas_content  === "string" ? obj.canvas_content : "",
      phase:          typeof obj.phase           === "string" ? obj.phase          : "hook",
      question:       typeof obj.question        === "string" ? cleanSpeech(obj.question)       : "",
    };
  } catch { return null; }
}

function fallback(raw: string, ctx: TeachingContext): TeacherResponse {
  return { speech: cleanSpeech(raw).slice(0, 400), face_state: "speaking", canvas_action: "none", canvas_content: "", phase: ctx.phase, question: "" };
}

/**
 * useWebLLM — lower-level hook.
 * shouldLoad is controlled externally (by useAITeacher).
 * When modelId OR shouldLoad changes the loading effect re-runs.
 */
const MAX_RETRIES = 3;

/** Classify WebLLM errors into human-readable categories */
function classifyError(err: Error): string {
  const msg = err?.message ?? "";
  if (msg.includes("Cache") || msg.includes("network error") || msg.includes("fetch")) {
    return "Download failed — HuggingFace CDN unreachable. Check your connection or try a VPN.";
  }
  if (msg.includes("WebGPU") || msg.includes("gpu") || msg.includes("adapter")) {
    return "WebGPU not available. Open chrome://flags and enable WebGPU, or update your browser.";
  }
  if (msg.includes("out of memory") || msg.includes("OOM")) {
    return "Not enough GPU memory. Try the smaller model.";
  }
  return msg.slice(0, 200) || "Unknown error";
}

export function useWebLLM(
  modelId: string,
  modelLabel: string,
  shouldLoad: boolean,
): UseWebLLMReturn {
  const [status,       setStatus]       = useState<LLMStatus>("idle");
  const [progress,     setProgress]     = useState(0);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ── Load effect — fires when modelId + shouldLoad both say go ─────────────
  useEffect(() => {
    if (!modelId || !shouldLoad) return;

    // Already have this model
    if (_engine && _loadedModelId === modelId) {
      setStatus("ready");
      setProgress(100);
      setProgressText("Model ready");
      return;
    }

    // Another load in flight — join it
    if (_loadingPromise) {
      setStatus("loading");
      _loadingPromise
        .then(() => { setStatus("ready"); setProgress(100); setProgressText("Model ready"); })
        .catch((err: Error) => { setStatus("error"); setErrorMessage(err?.message ?? "Unknown error"); });
      return;
    }

    setStatus("loading");
    setProgress(0);
    setProgressText("Initialising…");
    setErrorMessage("");

    // Retry loop — CDN can be flaky, especially on slow connections
    const attemptLoad = async (): Promise<any> => {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      return CreateMLCEngine(modelId, {
        initProgressCallback: (r: { progress: number; text: string }) => {
          setProgress(Math.round((r.progress ?? 0) * 100));
          setProgressText(r.text ?? "Loading…");
        },
      });
    };

    _loadingPromise = (async () => {
      let lastErr: Error | null = null;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 1) {
          const delay = attempt * 2000;
          setProgressText(`Retry ${attempt - 1}/${MAX_RETRIES - 1} — waiting ${delay / 1000}s…`);
          await new Promise(r => setTimeout(r, delay));
          setProgressText(`Retry ${attempt - 1}/${MAX_RETRIES - 1} — downloading…`);
        }
        try {
          const engine = await attemptLoad();
          _engine = engine;
          _loadedModelId = modelId;
          _loadingPromise = null;
          setStatus("ready");
          setProgress(100);
          setProgressText("Model ready");
          return engine;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[useWebLLM] attempt ${attempt}/${MAX_RETRIES} failed:`, err?.message);
        }
      }
      // All retries exhausted
      _loadingPromise = null;
      const friendly = classifyError(lastErr!);
      setStatus("error");
      setErrorMessage(friendly);
      throw lastErr;
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, shouldLoad]);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chat = useCallback(
    (
      userMessage: string,
      context: TeachingContext,
      history: ChatMessage[],
      onChunk: (partial: string) => void,
      onDone:  (response: TeacherResponse) => void,
      onError?: (err: string) => void
    ) => {
      if (!_engine) { onError?.("Engine not ready."); return; }

      _abortController?.abort();
      _abortController = new AbortController();

      const tier = modelId.includes("Phi-4") ? "high" : modelId.includes("1.7B") ? "mid" : "low";
      const chatHistory = history.length > 0 && history[history.length - 1].role === "user"
        ? history.slice(-6)
        : [...history.slice(-5), { role: "user" as const, content: userMessage }];
      const messages = [
        { role: "system" as const, content: buildSystemPrompt(tier, context, userMessage) },
        ...chatHistory,
      ];

      let accumulated = "";
      (async () => {
        try {
          const stream = await _engine.chat.completions.create({ messages, stream: true, temperature: 0.7, max_tokens: 384 });
          for await (const chunk of stream) {
            if (_abortController?.signal.aborted) break;
            accumulated += chunk.choices?.[0]?.delta?.content ?? "";
            onChunk(cleanSpeech(accumulated));
          }
          onDone(extractJSON(accumulated) ?? fallback(accumulated, context));
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          console.error("[useWebLLM] chat error:", err);
          onError?.(err?.message ?? "Generation failed");
        }
      })();
    },
    [modelId]
  );

  const abort = useCallback(() => { _abortController?.abort(); _abortController = null; }, []);

  // ── Unload — clears singleton, resets state ───────────────────────────────
  const unload = useCallback(async () => {
    abort();
    if (_engine) { try { await _engine.unload(); } catch { /* ignore */ } }
    _engine = null; _loadedModelId = null; _loadingPromise = null;
    setStatus("idle"); setProgress(0); setProgressText(""); setErrorMessage("");
  }, [abort]);

  return { status, progress, progressText, errorMessage, modelLabel, chat, abort, unload };
}
