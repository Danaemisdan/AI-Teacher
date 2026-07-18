'use client';

import React, { useState, useEffect } from 'react';
import { TopicAnalyzer } from '@/lib/intelligence/TopicAnalyzer';
import { LessonPlanner } from '@/lib/intelligence/LessonPlanner';
import { CapabilityHealthManager } from '@/lib/intelligence/CapabilityHealthManager';
import { bootstrapCapabilities } from '@/lib/intelligence/bootstrapCapabilities';
import { EducationalBlueprint } from '@/lib/intelligence/types';
import { useWebLLM } from '@/lib/useWebLLM';

import Dashboard from '@/components/debug-console/Dashboard';
import RegistryInspector from '@/components/debug-console/RegistryInspector';
import ResultCard from '@/components/debug-console/ResultCard';
import SystemReadinessDashboard from '@/components/debug-console/SystemReadinessDashboard';
import CapabilityMatrix from '@/components/debug-console/CapabilityMatrix';
import DependencyGraph from '@/components/debug-console/DependencyGraph';
import ExecutionSimulator from '@/components/debug-console/ExecutionSimulator';

// Pre-register all capabilities for the Debug Console
bootstrapCapabilities();

const EXPANDED_TOPICS = [
    "Explain Supply and Demand",
    "Explain Binary Trees",
    "Explain the Human Heart",
    "Explain Newton's Laws",
    "Explain the Solar System",
    "Explain World War II",
    "Explain TCP/IP",
    "Explain Bubble Sort",
    "Quadratic Equations",
    "Human Skeleton",
    "DNA Structure",
    "Photosynthesis",
    "GDP vs Inflation",
    "OSI Model",
    "Binary Search Tree",
    "SQL JOIN",
    "French Revolution",
    "Indian Constitution",
    "Solar Eclipse",
    "Heart Blood Flow",
    "Cell Division",
    "Machine Learning",
    "Neural Networks",
    "Blockchain",
    "Microeconomics",
    "Operating Systems",
    "Computer Networks"
];

export default function DebugConsole() {
    const [results, setResults] = useState<Record<string, EducationalBlueprint>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'validation' | 'health' | 'execution'>('validation');
    const { isLoaded, generateResponse, progressText } = useWebLLM();

    const runTests = async () => {
        if (!isLoaded) {
            alert("Please wait for WebLLM to initialize first!");
            return;
        }

        setIsRunning(true);
        const newResults: Record<string, EducationalBlueprint> = {};

        for (const topic of EXPANDED_TOPICS) {
            setCurrentTopic(topic);
            console.log(`[DEBUG CONSOLE] Starting analysis for: ${topic}`);
            
            try {
                // Mock Knowledge Retrieval Timing
                const krStart = performance.now();
                await new Promise(resolve => setTimeout(resolve, 50)); // Simulating DB lookup
                const krTime = performance.now() - krStart;

                // Topic Analysis Timing
                const taStart = performance.now();
                const analysis = await TopicAnalyzer.analyze(topic, generateResponse);
                const taTime = performance.now() - taStart;

                // Synthesis
                const blueprint = LessonPlanner.generateBlueprint(analysis, {
                    knowledgeRetrievalTimeMs: krTime,
                    topicAnalysisTimeMs: taTime
                });

                // Validate System Capability Execution
                CapabilityHealthManager.validateBlueprintExecution(blueprint);
                
                newResults[topic] = blueprint;
                setResults({ ...newResults }); // Update UI incrementally
            } catch (error) {
                console.error(`Failed to analyze ${topic}:`, error);
            }
        }

        setCurrentTopic(null);
        setIsRunning(false);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ai_teacher_blueprints_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const resultsArray = EXPANDED_TOPICS.map(t => results[t]).filter(Boolean);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-emerald-400 mb-2">Educational Intelligence Console</h1>
                        <p className="text-slate-400 max-w-3xl">
                            Developer environment for isolating, inspecting, and validating the structural planning layer of AI Teacher 3.0.
                            Generates complete lesson blueprints and performs pre-flight capability checks.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleExport}
                            disabled={resultsArray.length === 0}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold rounded-lg border border-slate-700 transition-colors"
                        >
                            Export JSON
                        </button>
                    </div>
                </header>

                {/* Main Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800">
                    <button 
                        onClick={() => setActiveTab('validation')}
                        className={`pb-4 px-2 font-bold transition-colors ${activeTab === 'validation' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Intelligence Validation
                    </button>
                    <button 
                        onClick={() => setActiveTab('health')}
                        className={`pb-4 px-2 font-bold transition-colors ${activeTab === 'health' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        System Health & Capabilities
                    </button>
                    <button 
                        onClick={() => setActiveTab('execution')}
                        className={`pb-4 px-2 font-bold transition-colors flex items-center gap-2 ${activeTab === 'execution' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        ▶ Simulated Execution
                    </button>
                </div>

                {activeTab === 'health' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SystemReadinessDashboard />
                        <CapabilityMatrix />
                        <DependencyGraph />
                    </div>
                )}

                {activeTab === 'execution' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {resultsArray.length > 0 ? (
                            <ExecutionSimulator blueprint={resultsArray[0]} />
                        ) : (
                            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">No Blueprint Available</h3>
                                <p className="text-slate-500">Please run the Intelligence Validation suite first to generate a blueprint for execution.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'validation' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 p-6 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Engine Status</h2>
                                <p className="text-sm text-slate-400">
                                    {!isLoaded ? progressText : "WebLLM Intelligence Engine is online and ready for planning."}
                                </p>
                            </div>
                            <button 
                                onClick={runTests} 
                                disabled={!isLoaded || isRunning}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-blue-900/50 transition-colors"
                            >
                                {isRunning ? `Analyzing: ${currentTopic}...` : "Run Complete Validation Suite"}
                            </button>
                        </div>

                        {resultsArray.length > 0 && <Dashboard results={resultsArray} />}

                        <RegistryInspector />

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-300 mb-6 border-b border-slate-800 pb-2">Validation Execution Log</h2>
                            {EXPANDED_TOPICS.map(topic => (
                                <ResultCard 
                                    key={topic} 
                                    topic={topic} 
                                    result={results[topic]} 
                                    isRunning={isRunning && currentTopic === topic} 
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
