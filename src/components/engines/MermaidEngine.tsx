'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';

interface MermaidEngineProps {
    code: string;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        darkMode: true,
        background: 'transparent',
        primaryColor: 'rgba(139, 92, 246, 0.2)', // Purple tint
        primaryTextColor: '#f8fafc',
        primaryBorderColor: 'rgba(167, 139, 250, 0.5)',
        lineColor: 'rgba(255, 255, 255, 0.6)',
        secondaryColor: 'rgba(59, 130, 246, 0.2)', // Blue tint
        tertiaryColor: 'rgba(236, 72, 153, 0.2)', // Pink tint
        noteBkgColor: 'rgba(255, 255, 255, 0.1)',
        noteTextColor: '#f8fafc',
        noteBorderColor: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'inherit',
    },
    flowchart: {
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 50,
        padding: 15,
    }
});

export default function MermaidEngine({ code }: MermaidEngineProps) {
    const [svgContent, setSvgContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const renderDiagram = async () => {
            if (!code || !code.trim()) return;
            
            try {
                // Ensure unique ID for mermaid to render to
                const id = `mermaid-graph-${Date.now()}`;
                
                // Remove Markdown codeblock backticks if the LLM added them
                let cleanCode = code.trim();
                if (cleanCode.startsWith('\`\`\`mermaid')) {
                    cleanCode = cleanCode.replace(/^\`\`\`mermaid\n/, '').replace(/\n\`\`\`$/, '');
                } else if (cleanCode.startsWith('\`\`\`')) {
                    cleanCode = cleanCode.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
                }
                
                // Try to parse and render
                const { svg } = await mermaid.render(id, cleanCode);
                
                if (isMounted) {
                    setSvgContent(svg);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Mermaid parsing failed:", err);
                if (isMounted) {
                    setError("Failed to render diagram.");
                    setSvgContent('');
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code]);

    return (
        <div className="w-full h-full relative flex flex-col items-center justify-center p-4 lg:p-8">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-purple-500/30 backdrop-blur-md">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse"></span>
                        <span className="text-purple-300 font-mono text-xs tracking-widest uppercase">
                            Concept Engine
                        </span>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .mermaid-container svg {
                    width: 100%;
                    height: 100%;
                    max-height: 80vh;
                    filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));
                    transition: all 0.5s ease;
                }
                .mermaid-container .node rect, 
                .mermaid-container .node circle, 
                .mermaid-container .node ellipse, 
                .mermaid-container .node polygon, 
                .mermaid-container .node path {
                    stroke-width: 2px;
                    transition: all 0.3s ease;
                }
                .mermaid-container .node:hover rect, 
                .mermaid-container .node:hover circle, 
                .mermaid-container .node:hover ellipse, 
                .mermaid-container .node:hover polygon, 
                .mermaid-container .node:hover path {
                    stroke-width: 3px;
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
                }
            `}} />
            
            <motion.div 
                key={code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full h-full flex items-center justify-center mermaid-container relative z-0"
            >
                {error ? (
                    <div className="text-red-400 font-mono text-sm bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                        {error}
                    </div>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full h-full flex justify-center items-center" />
                )}
            </motion.div>
        </div>
    );
}
