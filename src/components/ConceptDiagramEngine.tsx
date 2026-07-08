import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AssetManager } from '@/lib/AssetManager';

interface ConceptDiagramEngineProps {
    path: string;
    highlightId: string | null;
}

export default function ConceptDiagramEngine({ path, highlightId }: ConceptDiagramEngineProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                // Fetch Metadata
                const meta = await AssetManager.getMetadata(path);
                if (meta) {
                    setMetadata(meta);
                }

                // Fetch SVG
                const svgText = await AssetManager.getDiagramSVG(path);
                if (svgText) {
                    setSvgContent(svgText);
                }
            } catch (e) {
                console.error("Failed to load concept diagram assets", e);
            }
        };
        loadAssets();
    }, [path]);

    if (!svgContent) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-2 text-white/50">
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-ping"></div>
                    Loading Diagram...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,200,100,0.1)] border border-orange-500/20 bg-[#111] flex flex-col items-center justify-center p-8">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-orange-500/30 backdrop-blur-md">
                        <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] animate-pulse"></span>
                        <span className="text-orange-400 font-mono text-xs tracking-widest uppercase">
                            Concept Diagram Engine {metadata?.id ? `| ${metadata.id}` : ''}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Dynamic CSS Injection for SVG Highlighting */}
            <style dangerouslySetInnerHTML={{__html: `
                .concept-svg-container svg {
                    width: 100%;
                    max-height: 100%;
                    transition: all 0.5s ease;
                }
                .concept-svg-container svg * {
                    transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
                    transform-origin: center;
                }
                ${highlightId ? `
                    .concept-svg-container svg > *:not(defs):not([id="${highlightId}"]) {
                        opacity: 0.15;
                    }
                    .concept-svg-container svg [id="${highlightId}"] {
                        opacity: 1 !important;
                        filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) brightness(1.2);
                        transform: scale(1.02);
                        animation: pulseHighlight 2s infinite alternate;
                    }
                ` : ''}
                @keyframes pulseHighlight {
                    from { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) brightness(1.1); }
                    to { filter: drop-shadow(0 0 25px rgba(255, 255, 255, 1)) brightness(1.3); }
                }
            `}} />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full h-full flex items-center justify-center concept-svg-container relative z-0"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    );
}
