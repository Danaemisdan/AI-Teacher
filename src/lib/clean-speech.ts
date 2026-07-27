/**
 * clean-speech.ts
 * Modular response-cleaning layer that scrubs stage directions, roleplay asterisks,
 * and emote narration before rendering in UI or speech synthesis.
 */

export function cleanSpeech(text: string): string {
  if (!text) return "";
  return text
    // Remove asterisk roleplay actions and emotes (e.g. *nervous laugh*, *sighs*), including unclosed trailing emotes in streams
    .replace(/\*[a-zA-Z][^*]*?(\*|$)/g, "")
    // Remove bracketed stage directions (e.g. [laughs], [taps whiteboard]), including unclosed trailing brackets in streams
    .replace(/\[[a-zA-Z][^\]]*?(\]|$)/g, "")
    // Scrub common isolated stage direction narration words if generated outside asterisks
    .replace(/(\b(?:sighs|chuckles|laughs|smiles|nodding|pacing|taps whiteboard|clears throat)\b)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
