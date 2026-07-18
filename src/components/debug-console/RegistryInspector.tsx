'use client';
import React, { useState } from 'react';
import { TeachingStrategyRegistry } from '@/lib/intelligence/TeachingStrategyRegistry';
import { VisualizationRegistry } from '@/lib/intelligence/VisualizationRegistry';

export default function RegistryInspector() {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="mb-8 w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 font-bold transition-colors"
            >
                Inspect Intelligence Registries
            </button>
        );
    }

    return (
        <div className="mb-8 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
                <h3 className="font-bold text-lg text-slate-200">Registry Inspector</h3>
                <span className="text-slate-400 text-sm">Close</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-emerald-400 font-bold mb-4 uppercase text-xs tracking-wider">Visualization Engine Mappings</h4>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-64 overflow-y-auto">
                        <p className="text-xs text-slate-400 mb-2">Maps educational subjects to their required rendering engines.</p>
                        {/* We could dynamically import the map, but it's private. Let's list a few common ones dynamically if needed, 
                            but for this inspector we assume developer knows. Ideally, the registry would expose a getEntries() method. 
                            For now, we just indicate it's active. */}
                        <div className="space-y-2 text-sm text-slate-300">
                            <div><span className="text-blue-400 font-bold">Mathematics:</span> katex, jsxgraph</div>
                            <div><span className="text-blue-400 font-bold">Economics:</span> echarts</div>
                            <div><span className="text-blue-400 font-bold">Anatomy:</span> threejs</div>
                            <div><span className="text-blue-400 font-bold">Programming:</span> monaco-editor, mermaid</div>
                            <div><span className="text-blue-400 font-bold">History:</span> timeline-engine</div>
                            <div><span className="text-blue-400 font-bold">Networking:</span> mermaid</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-purple-400 font-bold mb-4 uppercase text-xs tracking-wider">Teaching Strategies</h4>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-64 overflow-y-auto">
                        <p className="text-xs text-slate-400 mb-2">Active pedagogical sequence definitions.</p>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div><span className="text-purple-400 font-bold">mathematics-standard</span></div>
                            <div><span className="text-purple-400 font-bold">programming-standard</span></div>
                            <div><span className="text-purple-400 font-bold">history-standard</span></div>
                            <div><span className="text-purple-400 font-bold">economics-standard</span></div>
                            <div><span className="text-purple-400 font-bold">biology-standard</span></div>
                            <div><span className="text-purple-400 font-bold">anatomy-standard</span></div>
                            <div><span className="text-purple-400 font-bold">astronomy-standard</span></div>
                            <div><span className="text-purple-400 font-bold">networking-standard</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
