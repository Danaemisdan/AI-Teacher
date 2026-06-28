import { useState, useRef, useCallback } from 'react';
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

export function useWebLLM() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [hasWebGPUError, setHasWebGPUError] = useState(false);
    
    const engineRef = useRef<WebWorkerMLCEngine | null>(null);

    const init = useCallback(async () => {
        if (isLoaded || isLoading) return;
        
        // Explicitly check for WebGPU support before initializing the WebWorker!
        // iOS Safari and some older browsers do not support this, and might silently hang the worker.
        if (!navigator || !navigator.gpu) {
            setHasWebGPUError(true);
            setProgressText('Error: WebGPU not supported on this device/browser.');
            return;
        }

        setIsLoading(true);

        try {
            // Using Qwen2.5-0.5B-Instruct which is extremely fast and much smarter than Qwen2
            const selectedModel = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
            setProgressText(`Loading ${selectedModel}...`);

            // Initialize worker
            const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
            
            const engine = await CreateWebWorkerMLCEngine(worker, selectedModel, {
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
            
            // Check if it's a WebGPU Error
            if (error.message?.includes('WebGPU') || error.toString().includes('WebGPU') || error.message?.includes('gpu')) {
                setHasWebGPUError(true);
                setProgressText('Error: Safari Blocks WebGPU. Use Google Chrome.');
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
    }, []);

    return {
        init,
        isLoaded,
        isLoading,
        progress,
        progressText,
        generateResponse,
        hasWebGPUError
    };
}
