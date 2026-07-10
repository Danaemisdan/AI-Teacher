'use client';
import React, { useEffect, useState } from 'react';
import { GraphSpec } from './types';
import JSXGraphAdapter from './adapters/JSXGraphAdapter';
import PlotlyAdapter from './adapters/PlotlyAdapter';
import EChartsAdapter from './adapters/EChartsAdapter';
import FormulaAdapter from './adapters/FormulaAdapter';
import { RendererHealthManager } from '@/lib/RendererHealthManager';
import { safeJsonParse } from '@/lib/jsonHelper';
import { GraphTemplateRegistry } from '@/lib/templates/GraphTemplateRegistry';
import { GraphDataPopulationEngine } from '@/lib/templates/GraphDataPopulationEngine';
import { GraphSpecificationValidator } from '@/lib/templates/GraphSpecificationValidator';
import { useTeachingInteraction } from '@/components/orchestration/TeachingInteractionLayer';
import { BlockMath } from 'react-katex';

interface GraphEngineProps {
    spec: string;
    autoAdvance?: boolean;
}

export default function GraphEngine({ spec, autoAdvance }: GraphEngineProps) {
    const [parsed, setParsed] = useState<GraphSpec | null>(null);
    const [activeRenderer, setActiveRenderer] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const interactionAPI = useTeachingInteraction();

    useEffect(() => {
        try {
            setHasError(false);
            
            // 1. Classifier / Parser
            const aiData = safeJsonParse<any>(spec, null);
            if (!aiData) throw new Error("Invalid JSON Specification");

            let finalSpec: GraphSpec;

            // 2. Template Loader & 3. Data Population
            if (aiData.templateId) {
                const template = GraphTemplateRegistry.getTemplate(aiData.templateId);
                if (!template) throw new Error(`Template '${aiData.templateId}' not found.`);
                finalSpec = GraphDataPopulationEngine.populate(template, aiData);
            } else {
                // Fallback for legacy static graphs
                finalSpec = aiData as GraphSpec;
            }

            // 4. Specification Validator
            if (!GraphSpecificationValidator.validate(finalSpec)) {
                throw new Error("Validation Failed for GraphSpec");
            }
            
            setParsed(finalSpec);
            
            // 5. Renderer Pipeline
            if (finalSpec.library && finalSpec.library !== 'formula') {
                const safeRenderer = RendererHealthManager.recommendFallback('graph', finalSpec.library);
                setActiveRenderer(safeRenderer);
            } else {
                setActiveRenderer('formula');
            }

            if (autoAdvance) {
                // Skip the manual "Step Forward" interaction for conversational queries
                setTimeout(() => interactionAPI.animateStep(999), 100);
            }
        } catch (e: any) {
            console.warn("Failed to parse/validate Graph spec: " + e.message);
            setErrorMsg(e.message);
            setParsed(null);
            setHasError(true);
        }
    }, [spec, autoAdvance, interactionAPI]);

    const handleAdapterError = (err: Error) => {
        if (!parsed || !activeRenderer) return;
        console.warn(`[GraphEngine] ${activeRenderer} failed. Attempting fallback...`);
        const nextRenderer = RendererHealthManager.recommendFallback('graph', activeRenderer);
        if (nextRenderer !== activeRenderer) {
            setActiveRenderer(nextRenderer);
        } else {
            setErrorMsg("No healthy renderer found.");
            setHasError(true);
        }
    };

    if (hasError) {
        // Silently fallback to a generic placeholder rather than showing a red error
        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img src={`https://source.unsplash.com/1200x800/?math,graph`} alt="Concept Visualization" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                <div className="absolute text-white/50 font-medium text-lg drop-shadow-md">
                    Abstract Representation
                </div>
            </div>
        );
    }

    if (!parsed) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white/50">
                Loading Interactive Graph...
            </div>
        );
    }

    // Wrap adapter with animation step provider
    const step = interactionAPI.state.currentStep;

    return (
        <div className="w-full h-full flex items-center justify-center relative p-8 pointer-events-auto">
            <div className="w-full max-w-4xl max-h-full bg-white rounded-xl shadow-2xl p-6 overflow-hidden relative">
                
                {parsed.title && (
                    <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">{parsed.title}</h2>
                )}

                {activeRenderer === 'echarts' && <EChartsAdapter spec={parsed} onError={handleAdapterError} animationStep={step} />}
                {activeRenderer === 'plotly' && <PlotlyAdapter spec={parsed} onError={handleAdapterError} animationStep={step} />}
                {activeRenderer === 'jsxgraph' && <JSXGraphAdapter spec={parsed} onError={handleAdapterError} />}
                {activeRenderer === 'formula' && <FormulaAdapter spec={parsed} onError={handleAdapterError} />}

                {parsed.formula && activeRenderer !== 'formula' && (
                    <div className="mt-6 border-t border-slate-200 pt-4 text-slate-700 text-lg flex justify-center">
                        <BlockMath math={parsed.formula} />
                    </div>
                )}
                {/* Explanation / Footer */}
                {parsed.explanation && (
                    <div className="mt-4 text-sm text-slate-600 text-center px-4">
                        {parsed.explanation}
                    </div>
                )}
                
                {/* Teaching Interaction Controls */}
                <div className="mt-6 flex items-center justify-between bg-slate-100 rounded-lg p-3">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => interactionAPI.animateStep(Math.max(0, step - 1))}
                            className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            ⏮ Step Back
                        </button>
                        <button 
                            onClick={() => interactionAPI.animateStep(step + 1)}
                            className="px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Step Forward ⏭
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => interactionAPI.startReplay()} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">
                            🔄 Replay
                        </button>
                        <button onClick={() => interactionAPI.showHint("Notice where the curves intersect!")} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200">
                            💡 Hint
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
