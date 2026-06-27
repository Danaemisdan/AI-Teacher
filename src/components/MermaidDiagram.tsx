'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
});

interface MermaidDiagramProps {
    chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            try {
                if (!chart) return;
                
                // Try to parse the chart to ensure it's valid mermaid syntax before rendering
                try {
                    await mermaid.parse(chart);
                } catch (parseError) {
                    console.error("Mermaid Parse Error:", parseError);
                    setError("Failed to parse diagram syntax.");
                    return;
                }

                setError(null);
                const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
            } catch (err) {
                console.error("Mermaid Render Error:", err);
                setError("Failed to render diagram.");
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div className="w-full h-full relative bg-[#1a1a24] rounded-xl shadow-inner flex items-center justify-center p-4 overflow-auto border-4 border-white/30">
            {/* Chalkboard corners */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-white/50 z-10 pointer-events-none"></div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-white/50 z-10 pointer-events-none"></div>
            
            {error ? (
                <div className="text-red-400 text-center flex flex-col items-center gap-2 font-mono">
                    <span className="text-2xl">⚠️</span>
                    <p>{error}</p>
                </div>
            ) : svg ? (
                <div 
                    ref={containerRef}
                    className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                    dangerouslySetInnerHTML={{ __html: svg }} 
                />
            ) : (
                <div className="text-white/40 animate-pulse text-xl">Drawing...</div>
            )}
        </div>
    );
}
