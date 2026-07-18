'use client';
import React, { useState } from 'react';
import { EducationalBlueprint } from '@/lib/intelligence/types';
import JsonViewer from './JsonViewer';

interface ResultCardProps {
    topic: string;
    result?: EducationalBlueprint;
    isRunning?: boolean;
}

export default function ResultCard({ topic, result, isRunning }: ResultCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [jsonMode, setJsonMode] = useState(false);
    const [timelineTab, setTimelineTab] = useState<'graph' | 'compiled'>('graph');

    if (!result) {
        return (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-4">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {isRunning && <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>}
                        <h3 className="font-bold text-lg text-slate-300">{topic}</h3>
                    </div>
                    {isRunning ? (
                        <span className="text-blue-400 text-sm animate-pulse font-bold">Running...</span>
                    ) : (
                        <span className="text-slate-500 text-sm">Pending</span>
                    )}
                </div>
            </div>
        );
    }

    const statusColor = result.validation.status === 'PASS' ? 'text-emerald-400' : result.validation.status === 'WARNING' ? 'text-orange-400' : 'text-red-400';
    const statusBg = result.validation.status === 'PASS' ? 'bg-emerald-900/20 border-emerald-800' : result.validation.status === 'WARNING' ? 'bg-orange-900/20 border-orange-800' : 'bg-red-900/20 border-red-800';

    return (
        <div className={`rounded-xl border overflow-hidden mb-4 transition-colors ${isExpanded ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
            <div 
                className={`px-6 py-4 flex justify-between items-center cursor-pointer ${isExpanded ? 'border-b border-slate-800 bg-slate-800/50' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${statusColor}`}>
                        {result.validation.status === 'PASS' ? '✔' : result.validation.status === 'WARNING' ? '⚠' : '✖'}
                    </span>
                    <h3 className="font-bold text-lg text-slate-200">{topic}</h3>
                </div>
                <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-400">Execution Time: <span className="text-slate-200 font-mono">{result.metrics.totalPlanningTimeMs} ms</span></span>
                    <span className={`font-bold px-3 py-1 rounded-full border ${statusBg} ${statusColor}`}>
                        {result.validation.status}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6">
                    <div className="flex justify-end mb-4 border-b border-slate-800 pb-4">
                        <button 
                            onClick={() => setJsonMode(!jsonMode)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 font-mono transition-colors"
                        >
                            {jsonMode ? 'Switch to Formatted View' : 'Switch to Raw JSON'}
                        </button>
                    </div>

                    {jsonMode ? (
                        <JsonViewer data={result} />
                    ) : (
                        <div className="space-y-8">
                            {/* Topic Analysis */}
                            <section>
                                <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Topic Analysis</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-slate-500 mb-1">Subject</div>
                                        <div className="font-bold text-blue-400">{result.topicAnalysis.subject}</div>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-slate-500 mb-1">Topic</div>
                                        <div className="font-bold text-emerald-400">{result.topicAnalysis.topic}</div>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-slate-500 mb-1">Difficulty</div>
                                        <div className="font-bold text-slate-300">{result.topicAnalysis.difficulty}</div>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="text-slate-500 mb-1">Education Level</div>
                                        <div className="font-bold text-slate-300">{result.topicAnalysis.educationLevel}</div>
                                    </div>
                                </div>
                            </section>

                            {/* Confidence Scores */}
                            <section>
                                <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Decision Confidence</h4>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {Object.entries(result.topicAnalysis.confidenceScores).map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded border border-slate-800">
                                            <span className="text-slate-400 capitalize">{k}:</span>
                                            <span className={`font-bold ${v as number > 90 ? 'text-emerald-400' : v as number > 75 ? 'text-orange-400' : 'text-red-400'}`}>{v as number}%</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Visualization Decision */}
                                <section>
                                    <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Visualization Decision</h4>
                                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                        <div className="mb-4">
                                            <div className="text-slate-500 text-xs mb-1">Primary Engine</div>
                                            <div className="font-bold text-teal-400 text-lg capitalize">{result.visualizations[0]}</div>
                                        </div>
                                        {result.visualizations.length > 1 && (
                                            <div className="mb-4">
                                                <div className="text-slate-500 text-xs mb-1">Fallbacks</div>
                                                <div className="text-slate-300 text-sm capitalize">{result.visualizations.slice(1).join(', ')}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-slate-500 text-xs mb-1">Reason</div>
                                            <div className="text-slate-300 text-sm italic border-l-2 border-slate-700 pl-3 py-1">
                                                {result.topicAnalysis.decisionReasons.visualization}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Previews */}
                                <section>
                                    <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Content Previews</h4>
                                    <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-4">
                                        <div className="text-slate-500 text-xs mb-2 font-bold">Notes Template: <span className="text-blue-400">{result.topicAnalysis.notesTemplate}</span></div>
                                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                                            {result.previews.notesPreview}
                                        </pre>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                        <div className="text-slate-500 text-xs mb-2 font-bold">Quiz Type: <span className="text-purple-400">{result.topicAnalysis.quizType}</span></div>
                                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                                            {result.previews.quizExample}
                                        </pre>
                                    </div>
                                </section>
                            </div>

                            {/* Timeline Engine Output */}
                            {result.lessonGraph && result.compiledTimeline && (
                                <section>
                                    <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Timeline Engine Output</h4>
                                    
                                    <div className="bg-slate-950 rounded border border-slate-800 overflow-hidden">
                                        <div className="flex bg-slate-900 border-b border-slate-800">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setTimelineTab('graph'); }}
                                                className={`flex-1 py-2 text-xs font-bold transition-colors ${timelineTab === 'graph' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                Lesson Graph (DAG)
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setTimelineTab('compiled'); }}
                                                className={`flex-1 py-2 text-xs font-bold transition-colors ${timelineTab === 'compiled' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                Compiled Timeline
                                            </button>
                                        </div>

                                        <div className="p-4 max-h-[400px] overflow-auto">
                                            {timelineTab === 'graph' ? (
                                                <div className="space-y-3">
                                                    {result.lessonGraph.nodes.map(node => (
                                                        <div key={node.id} className="bg-slate-900 p-3 rounded border border-slate-700">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                                                    {node.type}
                                                                    {!node.isBlocking && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">BACKGROUND</span>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 font-mono">{node.id}</div>
                                                            </div>
                                                            {node.dependencies.length > 0 && (
                                                                <div className="text-xs text-slate-400 mt-2">
                                                                    <span className="text-slate-500 font-bold mr-2">Depends On:</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {node.dependencies.map(d => (
                                                                            <span key={d} className="bg-slate-950 px-1.5 py-0.5 rounded font-mono border border-slate-800 text-[10px]">{d}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {node.milestone && (
                                                                <div className="text-[10px] text-yellow-400/80 mt-2 font-bold flex items-center gap-1">
                                                                    <span>★</span> {node.milestone}
                                                                </div>
                                                            )}
                                                            {node.checkpoint && (
                                                                <div className="text-[10px] text-blue-400/80 mt-1 font-bold flex items-center gap-1">
                                                                    <span>💾</span> {node.checkpoint}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-0 relative pl-4 border-l-2 border-slate-800 ml-2 py-2">
                                                    {result.compiledTimeline.map((node, i) => (
                                                        <div key={node.id} className="relative pb-6 last:pb-0">
                                                            <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-slate-950 ${node.isBlocking ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                                            <div className="pl-4">
                                                                <div className="font-bold text-slate-300 text-sm">{node.type}</div>
                                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                                    {node.isBlocking ? 'Blocks Execution' : 'Executes in Background'} | Priority: {node.priority}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}


                            {/* Validation & Metrics */}
                            <section>
                                <h4 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 border-b border-slate-800 pb-2">Metrics & Validation</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                        <div className="text-slate-500 text-xs mb-3 font-bold">Timing Breakdown</div>
                                        <div className="space-y-1 text-sm font-mono text-slate-400">
                                            <div className="flex justify-between"><span>Knowledge Retrieval:</span> <span className="text-slate-200">{result.metrics.knowledgeRetrievalTimeMs.toFixed(0)} ms</span></div>
                                            <div className="flex justify-between"><span>Topic Analysis (LLM):</span> <span className="text-slate-200">{result.metrics.topicAnalysisTimeMs.toFixed(0)} ms</span></div>
                                            <div className="flex justify-between"><span>Registry Lookup:</span> <span className="text-slate-200">{result.metrics.registryLookupTimeMs.toFixed(2)} ms</span></div>
                                            <div className="flex justify-between"><span>Structure Assembly:</span> <span className="text-slate-200">{result.metrics.lessonPlanningTimeMs.toFixed(2)} ms</span></div>
                                            <div className="flex justify-between"><span>Rule Validation:</span> <span className="text-slate-200">{result.metrics.validationTimeMs.toFixed(2)} ms</span></div>
                                            <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 font-bold"><span>Total:</span> <span className="text-emerald-400">{result.metrics.totalPlanningTimeMs.toFixed(2)} ms</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className={`p-4 rounded border ${statusBg}`}>
                                        <div className="text-slate-500 text-xs mb-2 font-bold">Pedagogical Rule Output</div>
                                        <div className={`font-bold text-lg mb-1 ${statusColor}`}>{result.validation.status}</div>
                                        <div className="text-sm text-slate-300 leading-relaxed">{result.validation.message}</div>
                                    </div>

                                    {result.capabilityValidation && (
                                        <div className={`p-4 rounded border ${result.capabilityValidation.canExecute ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
                                            <div className="text-slate-500 text-xs mb-2 font-bold">Capability Execution Check</div>
                                            <div className={`font-bold text-lg mb-1 ${result.capabilityValidation.canExecute ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {result.capabilityValidation.canExecute ? 'EXECUTION READY' : 'EXECUTION FAILED'}
                                            </div>
                                            <div className="text-sm text-slate-300 leading-relaxed">{result.capabilityValidation.message}</div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
