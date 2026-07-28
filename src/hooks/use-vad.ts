"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as vad from "@ricky0123/vad-web";
import * as ort from "onnxruntime-web";
import { logPipeline } from "@/lib/logger";

export function useVAD() {
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const vadRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializingRef = useRef(false);

  const stopVAD = useCallback(() => {
    if (vadRef.current) {
      try { vadRef.current.pause(); } catch(e) {}
      vadRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }
    setIsSpeechDetected(false);
  }, []);

  const startVAD = useCallback(async () => {
    if (vadRef.current || isInitializingRef.current) return;
    isInitializingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      // Hardware recovery: If the microphone is unplugged or permissions revoked
      stream.getTracks().forEach(track => {
        track.onended = () => {
          logPipeline("Hardware disconnected (Mic unplugged)");
          stopVAD();
        };
      });
      
      streamRef.current = stream;

      const myvad = await vad.MicVAD.new({
        getStream: async () => stream,
        onSpeechStart: () => {
          logPipeline("User started speaking");
          setIsSpeechDetected(true);
        },
        onSpeechEnd: (audio: Float32Array) => {
          logPipeline("User stopped speaking");
          setIsSpeechDetected(false);
        },
        onVADMisfire: () => {
          setIsSpeechDetected(false);
        },
      });

      myvad.start();
      vadRef.current = myvad;
      logPipeline("VAD initialized");
    } catch (err: any) {
      console.error("VAD Error:", err);
      logPipeline("VAD initialization failed", { error: err.message });
    } finally {
      isInitializingRef.current = false;
    }
  }, [stopVAD]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopVAD();
  }, [stopVAD]);

  return { startVAD, stopVAD, isSpeechDetected };
}
