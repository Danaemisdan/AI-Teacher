import { useState, useCallback, useRef } from 'react';

export function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    const initRecognition = useCallback(() => {
        if (typeof window === 'undefined') return null;
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        return recognition;
    }, []);

    const listen = useCallback((onResult: (text: string) => void) => {
        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
        }

        const recognition = recognitionRef.current;
        if (!recognition) return;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [initRecognition]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    return {
        isListening,
        listen,
        stopListening,
    };
}
