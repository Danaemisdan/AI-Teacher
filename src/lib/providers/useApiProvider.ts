import { useState, useCallback, useRef } from 'react';
import { IContentProvider } from './IContentProvider';
import { ApiContentProvider } from './ApiContentProvider';

export function useApiProvider(): IContentProvider & { hasWebGPUError: boolean } {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const providerRef = useRef<ApiContentProvider>(new ApiContentProvider());

    const init = useCallback(async () => {
        setIsLoading(true);
        await providerRef.current.init();
        setIsLoaded(providerRef.current.isLoaded);
        setProgress(providerRef.current.progress);
        setProgressText(providerRef.current.progressText);
        setIsLoading(false);
    }, []);

    const generateResponse = useCallback(async (
        messages: { role: string; content: string }[],
        onUpdate?: (chunk: string) => void
    ) => {
        return await providerRef.current.generateResponse(messages, onUpdate);
    }, []);

    const interrupt = useCallback(() => {
        providerRef.current.interrupt();
    }, []);

    return {
        init,
        isLoaded,
        isLoading,
        progress,
        progressText,
        generateResponse,
        interrupt,
        hasWebGPUError: false // API doesn't use local WebGPU
    };
}
