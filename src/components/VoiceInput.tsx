'use client'

import React, { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoiceInputProps {
  onProcessText: (text: string) => void;
}

export function VoiceInput({ onProcessText }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        onProcessText(transcript);
      };
      
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      
      setRecognition(rec);
    }
  }, [onProcessText])

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  }

  if (!recognition) return null; // Hide if browser doesn't support

  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute h-10 w-10 p-2 rounded-full bg-nexmart-cyan blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
            className="absolute h-10 w-10 p-2 rounded-full bg-nexmart-orange blur-lg"
          />
        </>
      )}
      <button 
        onClick={toggleListen}
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
           isListening 
           ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
           : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
    </div>
  )
}
