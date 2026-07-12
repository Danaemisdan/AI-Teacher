import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface IframeEngineHandle {
    sendAction: (action: any) => void;
}

interface IframeEngineProps {
    url: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    allowFullscreen?: boolean;
    onToolEvent?: (eventData: any) => void;
}

export const IframeEngine = forwardRef<IframeEngineHandle, IframeEngineProps>(({ 
    url, 
    title = 'Interactive Tool', 
    width = '100%', 
    height = '100%',
    allowFullscreen = true,
    onToolEvent
}, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
        sendAction: (action: any) => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'AGENT_ACTION', action }, '*');
            }
        }
    }));

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // We can't strictly check origin if we load multiple domains, 
            // but we can check if the message matches our expected format
            if (event.data && event.data.type === 'USER_ACTION') {
                if (onToolEvent) {
                    onToolEvent(event.data.data || event.data.action);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onToolEvent]);

    return (
        <div style={{ position: 'relative', width, height, background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
            {isLoading && (
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#fff', zIndex: 1 
                }}>
                    Loading tool...
                </div>
            )}
            <iframe
                ref={iframeRef}
                src={url}
                title={title}
                style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 2 }}
                allow={allowFullscreen ? "fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : ""}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
});
