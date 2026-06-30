import { useState, useRef, useCallback } from 'react';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam, prebuiltAppConfig } from '@mlc-ai/web-llm';

export function useWebLLM() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [hasWebGPUError, setHasWebGPUError] = useState(false);
    
    const engineRef = useRef<MLCEngine | null>(null);
    const initInProgressRef = useRef(false);

    const init = useCallback(async () => {
        if (isLoaded || initInProgressRef.current) return;
        initInProgressRef.current = true;
        setIsLoading(true);
        
        // Explicitly check for WebGPU support before initializing the WebWorker!
        if (!navigator || !(navigator as any).gpu) {
            console.warn("WebGPU not found. Emitting WebGPU error.");
            setHasWebGPUError(true);
            setIsLoaded(true);
            setProgressText('WebGPU Error');
            return;
        }

        try {
            // Using Qwen2-0.5B which is the absolute smallest model available (~350MB) for ultra-fast downloads!
            const selectedModel = 'Qwen2-0.5B-Instruct-q4f16_1-MLC';
            setProgressText(`Loading ${selectedModel}...`);
            
            const engine = await CreateMLCEngine(selectedModel, {
                initProgressCallback: (info) => {
                    setProgress(info.progress);
                    setProgressText(info.text);
                },
                appConfig: {
                    ...prebuiltAppConfig,
                    cacheBackend: "indexeddb"
                }
            });
            
            engineRef.current = engine;
            setIsLoaded(true);
            setProgressText('Ready');
        } catch (error: any) {
            console.error('Failed to initialize WebLLM:', error);
            
            if (error.message?.includes('Cache') || error.toString().includes('Cache')) {
                try {
                    await caches.delete('tvmjs');
                    console.warn("Cleared corrupted TVMJS cache.");
                } catch(e) {}
            }

            if (error.message?.includes('WebGPU') || error.toString().includes('WebGPU') || error.message?.includes('gpu')) {
                console.warn("WebGPU error detected. Emitting WebGPU error.");
                setHasWebGPUError(true);
                setIsLoaded(true);
                setProgressText('WebGPU Error');
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

        const executeCompletion = async () => {
            const chunks = await engineRef.current!.chat.completions.create({
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
        };

        try {
            return await executeCompletion();
        } catch (error: any) {
            console.warn("AI generation crashed. Attempting to fall back to a smaller model...", error);
            
            const fallbackModel = 'SmolLM2-135M-Instruct-q0f16-MLC';
            setProgressText(`Recovering: Loading ${fallbackModel}...`);
            try {
                await engineRef.current.reload(fallbackModel);
                setProgressText('Ready (Fallback Mode)');
                return await executeCompletion();
            } catch (fallbackError: any) {
                console.warn("Fallback model also failed.", fallbackError);
                throw fallbackError;
            }
        }
    }, []);

    const interrupt = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.interruptGenerate();
        }
    }, []);

    return {
        init,
        isLoaded,
        isLoading,
        progress,
        progressText,
        generateResponse,
        interrupt,
        hasWebGPUError
    };
}
