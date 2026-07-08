'use client';
import React, { useEffect, useState } from 'react';
import { LessonStrategyRegistry, LessonStrategy, LessonStep } from '@/lib/LessonStrategyRegistry';
import { RendererHealthManager } from '@/lib/RendererHealthManager';
import { TeachingInteractionProvider } from './TeachingInteractionLayer';
import GraphEngine from '../GraphEngine';
import { safeJsonParse } from '@/lib/jsonHelper';

interface EngineOrchestratorProps {
    intent: string; // e.g., "photosynthesis", "supply_demand"
    generateResponse?: any;
    isGenerating?: boolean;
}

export default function EngineOrchestrator({ intent, generateResponse, isGenerating }: EngineOrchestratorProps) {
    const [strategy, setStrategy] = useState<LessonStrategy | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    // Dynamic Graph State
    const [dynamicGraphSpec, setDynamicGraphSpec] = useState<string | null>(null);
    const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);

    useEffect(() => {
        // Map intent to strategy (or directly use a generic strategy)
        let strategyId = LessonStrategyRegistry.determineStrategyForIntent(intent);
        if (intent.toLowerCase().includes('supply') || intent.toLowerCase().includes('demand')) {
            strategyId = 'economic_principle';
        } else if (!strategyId) {
            // Default to generic lesson if no specific strategy matches
            strategyId = 'economic_principle'; 
        }
        
        const strat = LessonStrategyRegistry.getStrategy(strategyId);
        
        if (strat) {
            setStrategy(strat);
            setCurrentStepIndex(0);
            setError(null);
            setDynamicGraphSpec(null); // Reset graph on new intent
        } else {
            setError(`No strategy found for intent: ${intent}`);
        }
    }, [intent]);

    const currentStep = strategy ? strategy.flow[currentStepIndex] : null;
    const isGraphEngine = currentStep?.engineId === 'graph';

    useEffect(() => {
        // Wait until the conversational AI finishes its generation before we hijack the WebLLM engine
        if (!isGraphEngine || dynamicGraphSpec || isGeneratingGraph || !generateResponse || isGenerating) return;
        
        const generateGraph = async () => {
            setIsGeneratingGraph(true);
            const prompt = `Topic: "${intent}"
Output ONLY a JSON block using "Generic_Line", "Generic_Bar", or "Supply_Demand" template.
Format:
[GRAPH: {"templateId": "Generic_Line", "title": "${intent}", "curves": [{"name": "Data", "type": "line", "points": [[1,2], [2,4], [3,8]]}], "axes": {"x": "X-Axis", "y": "Y-Axis"}}]
DO NOT add any conversational text. Just the raw tag.`;
            
            try {
                let fullText = "";
                await generateResponse([
                    { role: 'system', content: 'You are an API that exclusively returns the exact JSON format requested. Do not output anything else.' },
                    { role: 'user', content: prompt }
                ], (chunk: string) => {
                    fullText = chunk;
                });
                
                const match = fullText.match(/\[GRAPH:\s*(\{[\s\S]*\})\s*\]/i);
                if (match && match[1]) {
                    const rawJson = match[1].trim();
                    const parsedSafe = safeJsonParse(rawJson, null);
                    if (!parsedSafe) {
                        console.warn("Extracted graph JSON is entirely invalid and unrecoverable:", rawJson);
                        throw new Error("Extracted JSON is invalid");
                    }
                    // Since safeJsonParse cleans it up (removes trailing commas etc), stringify it back!
                    setDynamicGraphSpec(JSON.stringify(parsedSafe));
                } else {
                    throw new Error("No graph tag found in response");
                }
            } catch (e) {
                console.warn("Dynamic graph generation failed:", e);
                // Deterministic fallback to avoid UI crash
                if (intent.toLowerCase().includes('supply') || intent.toLowerCase().includes('demand')) {
                    setDynamicGraphSpec('{"templateId": "Supply_Demand"}');
                } else {
                    setDynamicGraphSpec('{"templateId": "Generic_Line", "title": "Fallback: ' + intent + '", "curves": [{"type": "line", "name": "Data", "points": [[0,0], [1,1]]}]}');
                }
            } finally {
                setIsGeneratingGraph(false);
            }
        };
        
        generateGraph();
    }, [isGraphEngine, dynamicGraphSpec, isGeneratingGraph, generateResponse, intent, isGenerating]);

    if (error) {
        return <div className="text-rose-500 font-mono text-center p-8 border border-rose-500/30 rounded-xl bg-rose-900/20">{error}</div>;
    }

    if (!strategy || !currentStep) {
        return <div className="text-slate-400 text-center animate-pulse p-8">Analyzing Intent & Constructing Lesson Plan...</div>;
    }

    return (
        <TeachingInteractionProvider onStepChange={(s) => console.log('Animation Step:', s)}>
            <div className="w-full flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {/* Progress Bar Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Lesson: {strategy.name}
                        </h2>
                        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                            Module {currentStepIndex + 1} of {strategy.flow.length}
                        </span>
                    </div>
                </div>

                {/* Active Engine Container */}
                <div className="flex-1 relative p-6 flex flex-col items-center justify-center">
                    {isGraphEngine ? (
                        isGeneratingGraph ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                                <div className="text-slate-400 font-mono text-sm">LLM Generating Graph Data for "{intent}"...</div>
                            </div>
                        ) : dynamicGraphSpec ? (
                            <GraphEngine spec={dynamicGraphSpec} />
                        ) : null
                    ) : (
                        <div className="w-full h-full border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-800/50">
                            <h3 className="text-2xl font-bold text-slate-200 capitalize tracking-wide">
                                {currentStep.engineId.replace('_', ' ')} Engine
                            </h3>
                            <p className="text-slate-400 mt-2 text-sm text-center max-w-md">
                                Lazily mounted as part of the <span className="text-blue-400 font-semibold">{strategy.name}</span> learning strategy.
                            </p>
                        </div>
                    )}
                </div>

                {/* Orchestrator Controls - Replaces the old auto-advance */}
                <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
                    <button 
                        disabled={currentStepIndex === 0}
                        onClick={() => setCurrentStepIndex(prev => prev - 1)}
                        className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-600 transition-colors text-sm font-semibold"
                    >
                        Previous Module
                    </button>
                    
                    <div className="text-sm text-slate-400 flex gap-4">
                        <span>Target: <span className="text-emerald-400 font-mono">{strategy.learningObjectives[0]}</span></span>
                    </div>

                    <button 
                        disabled={currentStepIndex === strategy.flow.length - 1}
                        onClick={() => setCurrentStepIndex(prev => prev + 1)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-500 transition-colors text-sm font-semibold shadow-lg shadow-blue-500/20"
                    >
                        Next Module
                    </button>
                </div>
            </div>
        </TeachingInteractionProvider>
    );
}
