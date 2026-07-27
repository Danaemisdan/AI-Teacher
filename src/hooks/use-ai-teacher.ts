"use client";

import { useMemo, useState, useCallback } from "react";
import { useDeviceTier } from "./use-device-tier";
import { useWebLLM } from "./use-web-llm";
import { getModelForTier, LLM_MODELS } from "@/lib/llm-config";
import type { DeviceTier } from "@/lib/device-tier";
import type { ChatMessage, TeacherResponse, LLMStatus } from "./use-web-llm";
import type { TeachingContext } from "@/lib/llm-config";

export type { ChatMessage, TeacherResponse, LLMStatus };
export type { TeachingContext, DeviceTier };

export interface AITeacherHandle {
  tier: DeviceTier | null;
  tierLoading: boolean;
  isFastConnection: boolean | null;
  status: LLMStatus;
  progress: number;
  progressText: string;
  errorMessage: string;
  modelLabel: string;
  modelSizeLabel: string;
  /** Start loading the tier-appropriate model */
  load: () => void;
  /**
   * Switch to smallest model (Qwen3 0.6B) and load.
   * React 18 batches the two state updates so useWebLLM gets both in one render.
   */
  downgradeAndLoad: () => void;
  /** Load a user-provided custom model ID */
  loadCustomModel: (customId: string) => void;
  /** Reset everything, go back to idle */
  reset: () => Promise<void>;
  chat: (
    userMessage: string,
    context: TeachingContext,
    history: ChatMessage[],
    onChunk: (partial: string) => void,
    onDone:  (response: TeacherResponse) => void,
    onError?: (err: string) => void
  ) => void;
  abort: () => void;
}

const LOW_MODEL_ID = LLM_MODELS.low.id;

export function useAITeacher(): AITeacherHandle {
  const { tier, loading: tierLoading, isFastConnection } = useDeviceTier();

  // shouldLoad: gates the actual WebLLM download
  const [shouldLoad,    setShouldLoad]    = useState(false);
  // Allow overriding the model ID (for downgrade path)
  const [modelOverride, setModelOverride] = useState<string | null>(null);

  // FORCE 'low' tier (Qwen2.5 0.5B) as requested by user to guarantee a working version
  const effectiveTier = "low";
  const baseModel     = useMemo(() => getModelForTier(effectiveTier), [effectiveTier]);

  const activeModelId    = modelOverride ?? baseModel.id;
  const activeModelLabel = modelOverride ? LLM_MODELS.low.label    : baseModel.label;
  const activeModelSize  = modelOverride ? LLM_MODELS.low.sizeLabel : baseModel.sizeLabel;

  // Both props passed to useWebLLM — React 18 batches concurrent setState calls,
  // so changing modelOverride + shouldLoad in the same handler → single render →
  // useWebLLM effect sees both new values at once. No stale closure issues.
  const llm = useWebLLM(activeModelId, activeModelLabel, shouldLoad);

  const load = useCallback(() => setShouldLoad(true), []);

  const downgradeAndLoad = useCallback(async () => {
    // If a download is already in flight, unload it first
    if (llm.status === "loading" || llm.status === "ready") {
      await llm.unload();
    }
    // Both state updates are batched → useWebLLM re-runs with new modelId + shouldLoad=true
    setModelOverride(LOW_MODEL_ID);
    setShouldLoad(true);
  }, [llm]);
  
  const loadCustomModel = useCallback(async (customId: string) => {
    if (llm.status === "loading" || llm.status === "ready") {
      await llm.unload();
    }
    setModelOverride(customId);
    setShouldLoad(true);
  }, [llm]);

  const reset = useCallback(async () => {
    await llm.unload();
    setModelOverride(null);
    setShouldLoad(false);
  }, [llm]);

  return {
    tier,
    tierLoading,
    isFastConnection,
    status:         llm.status,
    progress:       llm.progress,
    progressText:   llm.progressText,
    errorMessage:   llm.errorMessage,
    modelLabel:     activeModelLabel,
    modelSizeLabel: activeModelSize,
    load,
    downgradeAndLoad,
    loadCustomModel,
    reset,
    chat:  llm.chat,
    abort: llm.abort,
  };
}
