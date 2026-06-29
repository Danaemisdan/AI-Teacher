import { useState, useRef, useCallback, useEffect } from 'react';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

export function useWebLLM() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [hasWebGPUError, setHasWebGPUError] = useState(false);
    const [isCloudFallback, setIsCloudFallback] = useState(false);
    const [groqApiKey, setGroqApiKey] = useState('');
    
    const engineRef = useRef<MLCEngine | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const savedKey = localStorage.getItem('groq_api_key');
        if (savedKey) setGroqApiKey(savedKey);
    }, []);

    const saveGroqKey = (key: string) => {
        setGroqApiKey(key);
        localStorage.setItem('groq_api_key', key);
    };

    const init = useCallback(async () => {
        if (isLoaded || isLoading) return;
        
        // Explicitly check for WebGPU support before initializing the WebWorker!
        if (!navigator || !(navigator as any).gpu) {
            console.warn("WebGPU not found. Falling back to Cloud API.");
            setIsCloudFallback(true);
            setIsLoaded(true);
            setProgressText('Ready (Cloud Fallback)');
            return;
        }

        setIsLoading(true);

        try {
            // Using Qwen2-0.5B which is the absolute smallest model available (~350MB) for ultra-fast downloads!
            const selectedModel = 'Qwen2-0.5B-Instruct-q4f16_1-MLC';
            setProgressText(`Loading ${selectedModel}...`);
            
            const engine = await CreateMLCEngine(selectedModel, {
                initProgressCallback: (info) => {
                    setProgress(info.progress);
                    setProgressText(info.text);
                }
            });
            
            engineRef.current = engine;
            setIsLoaded(true);
            setProgressText('Ready');
        } catch (error: any) {
            console.error('Failed to initialize WebLLM:', error);
            
            if (error.message?.includes('WebGPU') || error.toString().includes('WebGPU') || error.message?.includes('gpu')) {
                console.warn("WebGPU error detected. Falling back to Cloud API.");
                setIsCloudFallback(true);
                setIsLoaded(true);
                setProgressText('Ready (Cloud Fallback)');
            } else {
                setProgressText('Error: ' + (error.message || 'Failed to load AI'));
            }
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isLoading]);

    const generateResponse = useCallback(async (
        messages: { role: string, content: string }[], 
        onUpdate?: (chunk: string) => void
    ) => {
        if (isCloudFallback) {
            if (!groqApiKey) throw new Error("Missing Groq API Key for Cloud Fallback.");
            
            abortControllerRef.current = new AbortController();
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: messages,
                    temperature: 0.4,
                    stream: true
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Groq API Error");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullReply = '';

            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunkStr = decoder.decode(value, { stream: true });
                        const lines = chunkStr.split('\\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                                try {
                                    const parsed = JSON.parse(line.slice(6));
                                    const content = parsed.choices[0]?.delta?.content || '';
                                    fullReply += content;
                                    if (onUpdate) onUpdate(fullReply);
                                } catch (e) {}
                            }
                        }
                    }
                } catch(e: any) {
                    if (e.name === 'AbortError') {
                        console.log("Groq stream aborted.");
                    } else {
                        throw e;
                    }
                }
            }
            return fullReply;
        } else {
            if (!engineRef.current) throw new Error("Engine not initialized");

            const chunks = await engineRef.current.chat.completions.create({
                messages: messages as ChatCompletionMessageParam[],
                temperature: 0.4,
                frequency_penalty: 0.5,
                presence_penalty: 0.5,
                stream: true,
            });

            let fullReply = '';
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullReply += content;
                if (onUpdate) onUpdate(fullReply);
            }
            
            return fullReply;
        }
    }, [isCloudFallback, groqApiKey]);

    const interrupt = useCallback(() => {
        if (isCloudFallback && abortControllerRef.current) {
            abortControllerRef.current.abort();
        } else if (engineRef.current) {
            engineRef.current.interruptGenerate();
        }
    }, [isCloudFallback]);

    return {
        init,
        isLoaded,
        isLoading,
        progress,
        progressText,
        generateResponse,
        interrupt,
        hasWebGPUError,
        isCloudFallback,
        groqApiKey,
        saveGroqKey
    };
}
