/**
 * LLM Model Config per Device Tier
 *
 * WebLLM model IDs → https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
 *
 * Tier → Model mapping:
 *   high  → Phi-4-Mini-Instruct-q4f16_1-MLC        (~2.5GB)
 *   mid   → SmolLM2-360M-Instruct-q4f16_1-MLC      (~220MB)
 *   low   → SmolLM2-135M-Instruct-q4f16_1-MLC      (~90MB)
 */

import type { DeviceTier } from './device-tier';
import { classifyPedagogicalIntent, getPedagogicalRules } from './pedagogy';

export interface LLMModel {
  id: string;           // WebLLM model ID
  label: string;        // Human-readable
  sizeLabel: string;    // e.g. "2.5 GB"
  contextLength: number;
  /** Short note about best use */
  note: string;
}

export const LLM_MODELS: Record<DeviceTier, LLMModel> = {
  high: {
    // Best quality, Phi-4's small model — still elite at instruction following
    id: 'Phi-4-mini-instruct-q4f16_1-MLC',
    label: 'Phi-4 Mini',
    sizeLabel: '2.5 GB',
    contextLength: 16384,
    note: 'Best quality. 16GB+ RAM / 100Mbps+ WiFi.',
  },
  mid: {
    // SmolLM2 360M — decent teacher quality, very fast download
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    label: 'SmolLM2 360M',
    sizeLabel: '~220 MB',
    contextLength: 4096,
    note: 'Good balance. 8GB+ RAM / 50Mbps+.',
  },
  low: {
    // SmolLM2 135M - the absolute tiniest model available.
    id: 'SmolLM2-135M-Instruct-q0f16-MLC',
    label: 'SmolLM2 135M',
    sizeLabel: '~100 MB',
    contextLength: 2048,
    note: 'Absolute smallest footprint.',
  },
};

/** Returns the model config for a given tier */
export function getModelForTier(tier: DeviceTier): LLMModel {
  return LLM_MODELS[tier];
}

/**
 * Teaching harness system prompt.
 * Injected into every conversation, adapted per model tier.
 * Smaller models get stricter / shorter constraints.
 */
export function buildSystemPrompt(tier: DeviceTier, context: TeachingContext, userMessage?: string): string {
  const intent = classifyPedagogicalIntent(userMessage || "", context.phase);
  const pedagogyRules = getPedagogicalRules(intent);

  return `You are a professional teacher. Sharp, witty, zero fluff.
You teach like a genius friend who knows everything — never like a textbook.
Never say "Great question!", "Certainly!", "As an AI", or hedge with disclaimers.
Never output roleplay actions, stage directions, emotions in asterisks, or narration. Respond only with natural spoken language.
You use casual language. You challenge the user. You ask questions back.

CURRENT CONTEXT:
Topic: ${context.topic || userMessage || 'General Learning'}
User knows: ${context.priorKnowledge?.join(', ') || 'unknown'}
Session phase: ${context.phase}
Last struggle: ${context.weakPoint || 'none'}
Active Intent Category: ${intent}

${pedagogyRules}

OUTPUT RULES (STRICT):
- Respond ONLY in this exact JSON format, nothing else:
{
  "speech": "...",
  "face_state": "idle | speaking | thinking | excited | disappointed",
  "canvas_action": "none | draw_diagram | show_code | show_equation | show_analogy",
  "canvas_content": "...",
  "phase": "hook | scaffold | drill | feynman | challenge | next",
  "question": "..."
}

CONSTRAINTS:
- "speech" must target 30–90 seconds of speech (~60–140 words max). Concise, conversational, incremental. Do NOT dump information.
- Never output roleplay actions, stage directions, emotions in asterisks, or narration. Respond only with natural spoken language.
- Do NOT repeat yourself or loop sentences. Provide fresh, direct explanations.
- "question" must ALWAYS be non-empty. Always end with a question or challenge verifying student understanding (e.g., "Does that make sense?", "Would you like an example?", "Can you tell me what you understood?").
- "canvas_content" is plain text / pseudocode. No markdown inside JSON strings.
- If user is wrong, do NOT say "wrong". Ask "walk me through that" or "are you sure?".
- One wild analogy per new concept.
- If user struggles twice on same thing, flip the teaching method entirely.
`;
}

export interface TeachingContext {
  topic?: string;
  priorKnowledge?: string[];
  phase: 'hook' | 'scaffold' | 'drill' | 'feynman' | 'challenge' | 'next';
  weakPoint?: string;
  turnCount?: number;
}

/** Builds context object from session state */
export function buildTeachingContext(overrides: Partial<TeachingContext>): TeachingContext {
  return {
    topic: overrides.topic,
    priorKnowledge: overrides.priorKnowledge ?? [],
    phase: overrides.phase ?? 'hook',
    weakPoint: overrides.weakPoint,
    turnCount: overrides.turnCount ?? 0,
  };
}
