import React, { useState } from 'react';

interface IframeEngineProps {
    url: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    allowFullscreen?: boolean;
}

export const IframeEngine: React.FC<IframeEngineProps> = ({ 
    url, 
    title = 'Interactive Tool', 
    width = '100%', 
    height = '100%',
    allowFullscreen = true 
}) => {
    const [isLoading, setIsLoading] = useState(true);

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
                src={url}
                title={title}
                style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 2 }}
                allow={allowFullscreen ? "fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : ""}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
};
