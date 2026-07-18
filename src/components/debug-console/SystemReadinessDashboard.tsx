'use client';
import React from 'react';
import { CapabilityHealthManager } from '@/lib/intelligence/CapabilityHealthManager';

export default function SystemReadinessDashboard() {
    const report = CapabilityHealthManager.getSystemReadinessReport();

    const renderCategory = (title: string, score: number, items: any[]) => (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-300 uppercase tracking-wider text-xs">{title}</h3>
                <span className={`font-bold text-sm ${score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-orange-400' : 'text-red-400'}`}>
                    {score}%
                </span>
            </div>
            <div className="p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="text-sm text-slate-500">No capabilities registered.</div>
                ) : (
                    items.map(cap => (
                        <div key={cap.id} className="flex justify-between items-center border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                            <div>
                                <div className="text-sm font-bold text-slate-200">{cap.name}</div>
                                {cap.status !== 'READY' && <div className="text-xs text-red-400 mt-1">{cap.reason}</div>}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${cap.status === 'READY' ? 'bg-emerald-900/50 text-emerald-400' : cap.status === 'PARTIAL' ? 'bg-orange-900/50 text-orange-400' : 'bg-red-900/50 text-red-400'}`}>
                                    {cap.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-200">Capability Health & Readiness</h2>
                <div className={`px-4 py-2 rounded-lg font-bold border ${report.isExecutionReady ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                    Overall Readiness: {report.scores.overall}%
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderCategory('Core Services', report.scores.core, report.hierarchy.Core)}
                {renderCategory('Teaching Services', report.scores.teaching, report.hierarchy.Teaching)}
                {renderCategory('Visualization Services', report.scores.visualization, report.hierarchy.Visualization)}
                {renderCategory('Presentation Services', report.scores.presentation, report.hierarchy.Presentation)}
            </div>
        </div>
    );
}
