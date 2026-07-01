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
            // Hardware Heuristic: Proactively detect lower-end devices to assign the tiny model instantly
            let isLowEnd = false;
            
            // Check RAM (Supported on Chrome/Android)
            if ('deviceMemory' in navigator && (navigator as any).deviceMemory <= 4) {
                isLowEnd = true;
            }
            
            // Check CPU Cores
            if (!isLowEnd && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
                isLowEnd = true;
            }
            
            // Aggressive mobile check
            const isMobile = window.innerWidth < 1024 || navigator.maxTouchPoints > 0;
            if (isMobile && isLowEnd) {
                console.log("Low-end mobile device detected. Defaulting to tiny 135M model.");
            } else if (isMobile && !('deviceMemory' in navigator) && navigator.hardwareConcurrency <= 6) {
                // Older iOS devices
                isLowEnd = true;
            }

            let selectedModel = isLowEnd ? 'Qwen2-0.5B-Instruct-q4f16_1-MLC' : 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
            setProgressText(`Hardware Profile: ${isLowEnd ? 'Low-End' : 'High-End'} | Loading ${selectedModel}...`);
            
            // 1. Check for custom dedicated server override
            // 2. Fallback to fast global mirror (hf-mirror.com) to bypass ISP throttling
            const customHost = process.env.NEXT_PUBLIC_MODEL_HOST;
            
            const customAppConfig = {
                ...prebuiltAppConfig,
                model_list: prebuiltAppConfig.model_list.map(model => {
                    let newUrl = model.model;
                    if (newUrl && customHost) {
                        const repoName = newUrl.split('/').pop();
                        newUrl = `${customHost}/${repoName}`;
                    }
                    return { ...model, model: newUrl };
                }),
                cacheBackend: "indexeddb" as any
            };

            let engine;
            try {
                engine = await CreateMLCEngine(selectedModel, {
                    initProgressCallback: (info) => {
                        setProgress(info.progress);
                        setProgressText(info.text);
                    },
                    appConfig: customAppConfig
                });
            } catch (engineError: any) {
                console.warn(`Failed to load ${selectedModel} (Shader/WebGPU crash). Falling back to 135M model...`, engineError);
                selectedModel = 'SmolLM2-135M-Instruct-q0f16-MLC';
                setProgressText(`Recovering: Loading ${selectedModel}...`);
                
                try {
                    engine = await CreateMLCEngine(selectedModel, {
                        initProgressCallback: (info) => {
                            setProgress(info.progress);
                            setProgressText(info.text);
                        },
                        appConfig: customAppConfig
                    });
                } catch (fallbackError: any) {
                    console.warn(`Failed to load ${selectedModel} (f16 unsupported). Falling back to f32 model...`, fallbackError);
                    selectedModel = isLowEnd ? 'Qwen2-0.5B-Instruct-q4f32_1-MLC' : 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
                    setProgressText(`Recovering: Loading ${selectedModel} (f32 Compatibility Mode)...`);
                    
                    engine = await CreateMLCEngine(selectedModel, {
                        initProgressCallback: (info) => {
                            setProgress(info.progress);
                            setProgressText(info.text);
                        },
                        appConfig: customAppConfig
                    });
                }
            }
            
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
