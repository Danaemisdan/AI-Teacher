import { useState, useRef, useCallback } from 'react';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam, prebuiltAppConfig } from '@mlc-ai/web-llm';

// Helper to hide real model names
const formatProgress = (text: string) => {
    return text.replace(/Llama[^ ]*/gi, 'Momentum-Max')
               .replace(/Qwen[^ ]*/gi, 'Momentum-Standard')
               .replace(/SmolLM[^ ]*/gi, 'Momentum-Tiny');
};

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

        // Define outside try block so it is available in finally block
        const originalConsoleError = console.error;

        try {
            // 3-Tier Hardware & Network Heuristic
            let tier = 1; // 1 = High (Llama), 2 = Mid/Slow-Net (Qwen), 3 = Low (SmolLM)
            
            // Check RAM & CPU
            if (('deviceMemory' in navigator && (navigator as any).deviceMemory <= 4) || 
                ('hardwareConcurrency' in navigator && (navigator as any).hardwareConcurrency <= 4)) {
                tier = 3;
            }

            // Check Mobile
            if (/Mobi|Android/i.test(navigator.userAgent) && window.innerWidth <= 768) {
                tier = 3;
            }

            // Check Internet Speed (if supported)
            if (tier < 3 && 'connection' in navigator) {
                const conn = (navigator as any).connection;
                // If downlink is less than 15Mbps, fall back to Qwen to prevent massive download times
                if (conn.downlink && conn.downlink < 15) {
                    tier = 2;
                }
            } else if (tier < 3) {
                // If we can't detect internet speed, default to Qwen to be safe on bandwidth
                tier = 2;
            }

            let selectedModel = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
            if (tier === 1) selectedModel = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
            if (tier === 3) selectedModel = 'SmolLM2-135M-Instruct-q0f16-MLC';
            
            setProgressText(formatProgress(`Hardware Tier: ${tier} | Loading ${selectedModel}...`));
            
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

            // Suppress Next.js dev overlay for expected GPU crashes during model fallback
            console.error = (...args) => {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('Device was lost')) {
                    console.warn('[WebLLM] Suppressed expected GPU crash error:', ...args);
                    return;
                }
                originalConsoleError.apply(console, args);
            };

            let engine;
            try {
                engine = await CreateMLCEngine(selectedModel, {
                    initProgressCallback: (info) => {
                        setProgress(info.progress);
                        setProgressText(formatProgress(info.text));
                    },
                    appConfig: customAppConfig
                });
            } catch (engineError: any) {
                console.warn(`Failed to load ${selectedModel} (Shader/WebGPU crash). Falling back to lower tier model...`, engineError);
                if (tier === 1) selectedModel = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
                else selectedModel = 'SmolLM2-135M-Instruct-q0f16-MLC';
                
                setProgressText(formatProgress(`Recovering: Loading ${selectedModel}...`));
                
                try {
                    engine = await CreateMLCEngine(selectedModel, {
                        initProgressCallback: (info) => {
                            setProgress(info.progress);
                            setProgressText(formatProgress(info.text));
                        },
                        appConfig: customAppConfig
                    });
                } catch (fallbackError: any) {
                    console.warn(`Failed to load ${selectedModel} (f16 unsupported). Falling back to f32 model...`, fallbackError);
                    if (tier === 1) selectedModel = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
                    else if (tier === 3) selectedModel = 'SmolLM2-135M-Instruct-q0f32-MLC';
                    else selectedModel = 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC';
                    
                    setProgressText(formatProgress(`Recovering: Loading ${selectedModel} (f32 Compatibility Mode)...`));
                    
                    engine = await CreateMLCEngine(selectedModel, {
                        initProgressCallback: (info) => {
                            setProgress(info.progress);
                            setProgressText(formatProgress(info.text));
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
            // Restore console.error
            console.error = originalConsoleError;
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
            setProgressText(formatProgress(`Recovering: Loading ${fallbackModel}...`));
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
