'use client';
import React from 'react';

export default function DependencyGraph() {
    return (
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4">
                <h3 className="font-bold text-lg text-slate-200">Execution Pipeline Dependency Graph</h3>
                <p className="text-sm text-slate-400">Illustrates the data flow from Educational Intelligence to Lesson Execution.</p>
            </div>
            <div className="p-8 flex justify-center overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    
                    {/* Node 1 */}
                    <div className="flex flex-col items-center bg-blue-900/20 border border-blue-800 p-4 rounded-lg w-40 text-center relative">
                        <div className="text-xs text-blue-400 font-bold mb-1">Phase 1</div>
                        <div className="font-bold text-slate-200">Lesson Planner</div>
                        <div className="text-[10px] text-slate-400 mt-2">Generates Blueprint</div>
                    </div>
                    
                    <div className="text-slate-600 font-bold">→</div>

                    {/* Node 2 */}
                    <div className="flex flex-col items-center bg-purple-900/20 border border-purple-800 p-4 rounded-lg w-40 text-center relative">
                        <div className="text-xs text-purple-400 font-bold mb-1">Phase 2</div>
                        <div className="font-bold text-slate-200">Registries</div>
                        <div className="text-[10px] text-slate-400 mt-2">Applies Pedagogical Rules</div>
                    </div>
                    
                    <div className="text-slate-600 font-bold">→</div>

                    {/* Node 3 */}
                    <div className="flex flex-col items-center bg-emerald-900/20 border border-emerald-800 p-4 rounded-lg w-40 text-center relative shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                        <div className="text-xs text-emerald-400 font-bold mb-1">Phase 3</div>
                        <div className="font-bold text-slate-200">Health Manager</div>
                        <div className="text-[10px] text-slate-400 mt-2">Validates Capabilities</div>
                    </div>
                    
                    <div className="text-slate-600 font-bold">→</div>

                    {/* Node 4 */}
                    <div className="flex flex-col items-center bg-orange-900/20 border border-orange-800 p-4 rounded-lg w-40 text-center relative opacity-50">
                        <div className="text-xs text-orange-400 font-bold mb-1">Phase 4 (Pending)</div>
                        <div className="font-bold text-slate-200">Timeline Engine</div>
                        <div className="text-[10px] text-slate-400 mt-2">Orchestrates Playback</div>
                    </div>

                    <div className="text-slate-600 font-bold">→</div>

                    {/* Node 5 */}
                    <div className="flex flex-col items-center bg-red-900/20 border border-red-800 p-4 rounded-lg w-40 text-center relative opacity-50">
                        <div className="text-xs text-red-400 font-bold mb-1">Execution</div>
                        <div className="font-bold text-slate-200">Visuals & Audio</div>
                        <div className="text-[10px] text-slate-400 mt-2">Hardware Rendering</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
