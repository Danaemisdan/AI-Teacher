'use client';
import React, { useEffect, useState } from 'react';
import { EducationalBlueprint } from '@/lib/intelligence/types';
import { ExecutionContext } from '@/lib/execution/ExecutionContext';
import { LessonExecutionEngine } from '@/lib/execution/LessonExecutionEngine';
import { MockExecutors } from '@/lib/execution/MockExecutors';
import { IExecutionContext } from '@/lib/execution/types';
import { NotesExecutor } from '@/lib/execution/executors/NotesExecutor';
import { NotesPlanner } from '@/lib/intelligence/NotesPlanner';

interface Props {
    blueprint: EducationalBlueprint;
}

export default function ExecutionSimulator({ blueprint }: Props) {
    const [ctx, setCtx] = useState<IExecutionContext>(ExecutionContext.getState());
    const [engine, setEngine] = useState<LessonExecutionEngine | null>(null);
    const [visState, setVisState] = useState({ lastEvent: 'None', timestamp: 0, payloadPreview: '' });

    useEffect(() => {
        // Subscribe to React state updates
        const handler = (newCtx: IExecutionContext) => {
            setCtx(newCtx);
        };
        ExecutionContext.subscribe(handler);

        // Visualization Inspector listener
        const handleVisEvent = (payload: any) => {
            setVisState(prev => ({
                ...prev,
                lastEvent: payload.type,
                timestamp: payload.timestamp,
                payloadPreview: payload.message ? (typeof payload.message === 'string' ? payload.message.substring(0, 50) + '...' : 'Object') : prev.payloadPreview
            }));
        };

        import('@/lib/execution/EventBus').then(({ EventBus }) => {
            EventBus.subscribe('VisualizationRequested', handleVisEvent);
            EventBus.subscribe('VisualizationGenerating', handleVisEvent);
            EventBus.subscribe('VisualizationLoading', handleVisEvent);
            EventBus.subscribe('VisualizationReady', handleVisEvent);
            EventBus.subscribe('VisualizationRendered', handleVisEvent);
            EventBus.subscribe('VisualizationFailed', handleVisEvent);
        });

        // Init Engine and Mocks
        const execEngine = new LessonExecutionEngine();
        MockExecutors.register();
        setEngine(execEngine);

        if (blueprint.compiledTimeline) {
            execEngine.loadTimeline(blueprint.compiledTimeline);
            
            // Initialize Notes subsystem
            NotesPlanner.generateNotesPlan(blueprint).then(plan => {
                const notesExecutor = new NotesExecutor();
                notesExecutor.initialize();
                notesExecutor.loadNotesPlan(plan);
            });
        }

        return () => {
            ExecutionContext.unsubscribe(handler);
            execEngine.cleanup();
            import('@/lib/execution/EventBus').then(({ EventBus }) => {
                EventBus.unsubscribe('VisualizationRequested', handleVisEvent);
                EventBus.unsubscribe('VisualizationGenerating', handleVisEvent);
                EventBus.unsubscribe('VisualizationLoading', handleVisEvent);
                EventBus.unsubscribe('VisualizationReady', handleVisEvent);
                EventBus.unsubscribe('VisualizationRendered', handleVisEvent);
                EventBus.unsubscribe('VisualizationFailed', handleVisEvent);
            });
        };
    }, [blueprint]);

    const handleStart = () => engine?.start();
    const handlePause = () => engine?.pause();

    if (!blueprint.compiledTimeline) return <div className="p-4 text-red-400">No compiled timeline available. Run Phase 4 first.</div>;

    return (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-200">Execution Simulator</h3>
                    <p className="text-sm text-slate-400">Event-driven runtime orchestrator. (Mock Executors)</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right mr-4">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">State</div>
                        <div className={`text-lg font-bold ${
                            ctx.engineState === 'Running' ? 'text-emerald-400' :
                            ctx.engineState === 'Completed' ? 'text-blue-400' :
                            'text-slate-300'
                        }`}>{ctx.engineState}</div>
                    </div>
                    {ctx.engineState !== 'Running' && ctx.engineState !== 'Completed' && (
                        <button onClick={handleStart} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg transition-colors">
                            ▶ START EXECUTION
                        </button>
                    )}
                    {ctx.engineState === 'Running' && (
                        <button onClick={handlePause} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-lg transition-colors">
                            ⏸ PAUSE
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Context & State */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Execution Context</h4>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-emerald-400 font-bold">{ctx.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${ctx.progressPercent}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Milestone</span>
                                <span className="text-yellow-400 font-bold text-right">{ctx.currentMilestone || 'None'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Checkpoint</span>
                                <span className="text-blue-400 font-bold text-right">{ctx.currentCheckpoint || 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Active Events</span>
                                <span className="text-slate-200 font-bold">{ctx.runningEvents.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Visualization Inspector</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Lifecycle State</span>
                                <span className="text-purple-400 font-bold text-right">{visState.lastEvent}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Last Update</span>
                                <span className="text-slate-300 text-right">{visState.timestamp ? new Date(visState.timestamp).toISOString().split('T')[1].slice(0,-1) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Payload</span>
                                <span className="text-slate-400 text-right text-xs truncate max-w-[150px]">{visState.payloadPreview || 'None'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Avatar Inspector</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Presentation State</span>
                                <span className="text-pink-400 font-bold text-right">{ctx.currentAvatarState || 'None'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Expression / Gesture</span>
                                <span className="text-slate-300 text-right">{ctx.currentExpression || '-'} / {ctx.currentGesture || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Look Target</span>
                                <span className="text-slate-300 text-right">{ctx.currentLookTarget || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Lip Sync / Animation</span>
                                <span className="text-slate-400 text-right text-xs truncate">{ctx.lipSyncStatus || 'inactive'} / {ctx.currentAnimation || '-'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Notes Inspector</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Current Section</span>
                                <span className="text-blue-400 font-bold text-right truncate max-w-[150px]">{ctx.currentNotesSection || 'None'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Displayed / Remaining</span>
                                <span className="text-slate-300 text-right">{ctx.displayedNotes.length} / {ctx.remainingNotes.length}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Visibility</span>
                                <span className="text-slate-300 text-right">{ctx.notesVisibility}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-emerald-400 text-right">{ctx.readingProgress.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded border border-slate-800 max-h-[400px] flex flex-col">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Execution Log</h4>
                        <div className="overflow-y-auto space-y-2 flex-1 font-mono text-[10px]">
                            {ctx.logs.map((log, i) => (
                                <div key={i} className={`p-2 rounded border ${
                                    log.result === 'SUCCESS' ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' :
                                    log.result === 'ERROR' ? 'bg-red-900/10 border-red-900/30 text-red-400' :
                                    'bg-slate-950 border-slate-800 text-slate-400'
                                }`}>
                                    <div className="flex justify-between mb-1 opacity-70">
                                        <span>{new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}</span>
                                        <span>{log.executor}</span>
                                    </div>
                                    <div className="font-bold mb-1">{log.transition}</div>
                                    <div className="text-slate-300">{log.message}</div>
                                </div>
                            ))}
                            {ctx.logs.length === 0 && <div className="text-slate-600 text-center py-4">No logs yet.</div>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline Event States */}
                <div className="lg:col-span-2 bg-slate-900 p-4 rounded border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Timeline Scheduler</h4>
                    
                    <div className="space-y-2">
                        {blueprint.compiledTimeline.map((node) => {
                            const state = ctx.eventStates[node.id] || 'Pending';
                            return (
                                <div key={node.id} className={`p-3 rounded border transition-colors flex items-center justify-between ${
                                    state === 'Running' ? 'bg-blue-900/20 border-blue-500/50' :
                                    state === 'Completed' ? 'bg-emerald-900/10 border-emerald-900/30 opacity-50' :
                                    'bg-slate-950 border-slate-800'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${node.isBlocking ? (state === 'Running' ? 'bg-red-500 animate-pulse' : 'bg-slate-500') : 'bg-purple-500'}`} title={node.isBlocking ? 'Blocking' : 'Background'}></div>
                                        <div>
                                            <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                                {node.type}
                                                {state === 'Running' && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded animate-pulse">EXECUTING</span>}
                                                {state === 'Completed' && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">DONE</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{node.id}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-xs font-bold text-slate-400">{state}</div>
                                        {node.dependencies.length > 0 && (
                                            <div className="text-[9px] text-slate-600 font-mono">
                                                Deps: {node.dependencies.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
