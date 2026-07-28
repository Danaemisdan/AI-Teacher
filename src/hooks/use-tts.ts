"use client";

/**
 * useTTS — Client-side Edge TTS hook
 *
 * Calls /api/tts (Next.js route → msedge-tts → Microsoft neural voices).
 * Returns speak / stop / isSpeaking.
 *
 * Usage:
 *   const { speak, stop, isSpeaking } = useTTS({ voice: 'en-US-AriaNeural' });
 *   speak("Hello, let's learn recursion.");
 */

import { useCallback, useRef, useState } from 'react';
import { DEFAULT_VOICE } from '@/lib/tts-voices';
import { logPipeline } from "@/lib/logger";

interface UseTTSOptions {
  voice?: string;
  rate?: string;   // e.g. '+10%', '-5%'
  pitch?: string;  // e.g. '+5Hz', '-2Hz'
}

interface UseTTSReturn {
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
  isSpeaking: boolean;
}

export function useTTS({
  voice = DEFAULT_VOICE,
  rate = '+12%',
  pitch = '+0Hz',
}: UseTTSOptions = {}): UseTTSReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // Abort any in-flight fetch
    abortRef.current?.abort();
    abortRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      // Stop anything currently playing
      stop();

      const controller = new AbortController();
      abortRef.current = controller;

      setIsSpeaking(true);

      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, rate, pitch }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`TTS API error: ${res.status}`);

          // Read the full audio blob from the stream
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);

          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(url);
            setIsSpeaking(false);
            logPipeline("TTS stopped");
            onEnd?.();
          };

          audio.onerror = () => {
            logPipeline("playback error", { error: "audio.onerror fired" });
            URL.revokeObjectURL(url);
            setIsSpeaking(false);
            logPipeline("TTS stopped");
            onEnd?.();
          };

          audio.play().then(() => {
            logPipeline("TTS started");
          }).catch((err) => {
            logPipeline("playback error", { error: err.message || err.toString() });
            setIsSpeaking(false);
            logPipeline("TTS stopped");
            onEnd?.();
          });
        })
        .catch((err) => {
          if (err.name === 'AbortError') return; // intentional stop
          console.error('[useTTS] fetch error:', err);
          logPipeline("playback error", { error: "fetch error " + err.message });
          setIsSpeaking(false);
          onEnd?.();
        });
    },
    [voice, rate, pitch, stop]
  );

  return { speak, stop, isSpeaking };
}
