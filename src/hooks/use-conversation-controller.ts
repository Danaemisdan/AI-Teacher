"use client";

import { useState, useCallback, useMemo } from "react";
import type { AgentState } from "@/components/AgentFace";

// ── Internal Feature Flag: Conversation Mode ─────────────────────────────────
// false = Push-to-Talk Mode (current default behavior)
// true  = Continuous Conversation Mode (future automated turn-taking)
export const conversationMode = true;

export type ConversationState = "idle" | "listening" | "thinking" | "speaking";
export type ConversationMode = "push-to-talk" | "continuous";

export interface ConversationController {
  state: ConversationState;
  mode: ConversationMode;
  isContinuousMode: boolean;
  isIdle: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  enterIdle: () => void;
  enterListening: () => void;
  enterThinking: () => void;
  enterSpeaking: () => void;
  /** Direct state setter for compatibility */
  setState: (state: ConversationState) => void;
  /** State cast for UI components expecting AgentState */
  agentState: AgentState;
}

/**
 * useConversationController — Lightweight conversation loop state controller.
 *
 * Manages the high-level conversational turn lifecycle (idle -> listening -> thinking -> speaking)
 * within the existing React state architecture, preparing the foundation for continuous voice mode
 * without introducing third-party state machines or altering current UI/processing behaviors.
 */
export function useConversationController(
  initialState: ConversationState = "idle"
): ConversationController {
  const [state, setState] = useState<ConversationState>(initialState);

  const enterIdle = useCallback(() => setState("idle"), []);
  const enterListening = useCallback(() => setState("listening"), []);
  const enterThinking = useCallback(() => setState("thinking"), []);
  const enterSpeaking = useCallback(() => setState("speaking"), []);

  return useMemo(
    () => ({
      state,
      mode: conversationMode ? "continuous" : "push-to-talk",
      isContinuousMode: conversationMode,
      isIdle: state === "idle",
      isListening: state === "listening",
      isThinking: state === "thinking",
      isSpeaking: state === "speaking",
      enterIdle,
      enterListening,
      enterThinking,
      enterSpeaking,
      setState,
      agentState: state as AgentState,
    }),
    [state, enterIdle, enterListening, enterThinking, enterSpeaking]
  );
}
