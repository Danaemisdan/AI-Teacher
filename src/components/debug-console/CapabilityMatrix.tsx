'use client';
import React from 'react';
import { SubjectType } from '@/lib/intelligence/types';
import { VisualizationRegistry } from '@/lib/intelligence/VisualizationRegistry';
import { CapabilityHealthManager } from '@/lib/intelligence/CapabilityHealthManager';

const SUBJECTS: SubjectType[] = [
    'Mathematics', 'Physics', 'Biology', 'Anatomy', 'Astronomy', 
    'Programming', 'History', 'Economics', 'Networking'
];

export default function CapabilityMatrix() {
    // Get all registered visualization engines
    const report = CapabilityHealthManager.getSystemReadinessReport();
    const visEngines = report.hierarchy.Visualization;

    return (
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4">
                <h3 className="font-bold text-lg text-slate-200">Educational Capability Matrix</h3>
                <p className="text-sm text-slate-400">Maps subjects to dynamically registered visualization engines.</p>
            </div>
            <div className="overflow-x-auto p-6">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg border-b border-slate-800">Subject</th>
                            {visEngines.map(engine => (
                                <th key={engine.id} className="px-4 py-3 border-b border-slate-800 text-center font-mono">
                                    <div className="flex flex-col items-center">
                                        <span>{engine.name}</span>
                                        <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded ${engine.status === 'READY' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                                            {engine.status}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SUBJECTS.map(subject => {
                            const validEngines = VisualizationRegistry.getEnginesForSubject(subject);
                            return (
                                <tr key={subject} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-bold text-slate-300">{subject}</td>
                                    {visEngines.map(engine => {
                                        const isSupported = validEngines.includes(engine.id);
                                        const isPrimary = validEngines[0] === engine.id;
                                        
                                        return (
                                            <td key={engine.id} className="px-4 py-3 text-center">
                                                {isSupported ? (
                                                    <span className={`font-bold ${isPrimary ? 'text-emerald-400' : 'text-blue-400'}`} title={isPrimary ? "Primary Engine" : "Fallback Engine"}>
                                                        ✔
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-700">✖</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><span className="text-emerald-400 font-bold">✔</span> Primary Engine</div>
                    <div className="flex items-center gap-1"><span className="text-blue-400 font-bold">✔</span> Fallback Engine</div>
                    <div className="flex items-center gap-1"><span className="text-slate-700 font-bold">✖</span> Unsupported</div>
                </div>
            </div>
        </div>
    );
}
