'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CapabilityRegistry, VisualizationPayload } from '@/lib/visualization/CapabilityRegistry';
import { IVizProvider } from '@/lib/visualization/IVizProvider';

// Register the providers we just built
import { JsxGraphProvider } from '@/lib/visualization/providers/JsxGraphProvider';
import { MermaidProvider } from '@/lib/visualization/providers/MermaidProvider';
import { ThreeJsProvider } from '@/lib/visualization/providers/ThreeJsProvider';
import { EchartsProvider } from '@/lib/visualization/providers/EchartsProvider';
import { ConceptDiagramProvider } from '@/lib/visualization/providers/ConceptDiagramProvider';

// Perform registration once
if (!CapabilityRegistry.hasCapability('interactive-graph')) {
    CapabilityRegistry.registerProvider('jsxgraph', new JsxGraphProvider());
    CapabilityRegistry.registerProvider('mermaid', new MermaidProvider());
    CapabilityRegistry.registerProvider('threejs', new ThreeJsProvider());
    CapabilityRegistry.registerProvider('echarts', new EchartsProvider());
    CapabilityRegistry.registerProvider('concept_diagram', new ConceptDiagramProvider());
}

interface VisualizationCanvasProps {
    payload: VisualizationPayload;
    highlightId?: string | null;
}

export default function VisualizationCanvas({ payload, highlightId }: VisualizationCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const providerRef = useRef<IVizProvider | null>(null);
    const [error, setError] = useState<string | null>(null);

    const payloadStr = JSON.stringify(payload);

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            const currentPayload = JSON.parse(payloadStr);
            const match = CapabilityRegistry.getBestProvider(currentPayload);
            
            if (!match) {
                setError(`No provider available for capability: ${currentPayload.capability} (${currentPayload.type})`);
                return;
            }

            const { provider } = match;
            providerRef.current = provider;

            const wrapper = document.createElement('div');
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            containerRef.current.appendChild(wrapper);

            // Render it
            provider.render(wrapper, currentPayload.payload);
            setError(null);
            
        } catch (e: any) {
            console.error("VisualizationCanvas Error:", e);
            setError(`Failed to render visualization: ${e.message}`);
        }

        return () => {
            if (providerRef.current) {
                providerRef.current.dispose();
                providerRef.current = null;
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [payloadStr]);

    // Handle highlighting updates dynamically without a full re-render mount cycle if possible
    useEffect(() => {
        if (providerRef.current && highlightId) {
            providerRef.current.highlightElement(highlightId);
        } else if (providerRef.current && !highlightId) {
            providerRef.current.clearHighlights();
        }
    }, [highlightId]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center text-red-400">
                <div>
                    <span className="text-2xl block mb-2">⚠️</span>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative" ref={containerRef}>
            {/* The VisualizationProvider will attach its UI into this ref */}
        </div>
    );
}
