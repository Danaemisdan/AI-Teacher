'use client';
import React from 'react';
import { EducationalBlueprint } from '@/lib/intelligence/types';

interface DashboardProps {
    results: EducationalBlueprint[];
}

export default function Dashboard({ results }: DashboardProps) {
    const total = results.length;
    const passed = results.filter(r => r.validation.status === 'PASS').length;
    const warnings = results.filter(r => r.validation.status === 'WARNING').length;
    const failed = results.filter(r => r.validation.status === 'FAIL').length;

    const avgTime = total > 0 
        ? Math.round(results.reduce((acc, r) => acc + r.metrics.totalPlanningTimeMs, 0) / total) 
        : 0;
        
    const avgConfidence = total > 0 
        ? Math.round(results.reduce((acc, r) => acc + r.topicAnalysis.confidenceScores.overall, 0) / total) 
        : 0;

    // Calculate most frequent engine
    const engines = results.map(r => r.visualizations[0]);
    const mostFrequentEngine = engines.sort((a,b) =>
        engines.filter(v => v===a).length - engines.filter(v => v===b).length
    ).pop() || 'N/A';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Tests</div>
                <div className="text-3xl font-bold">{total}</div>
                <div className="text-sm mt-2 flex gap-2">
                    <span className="text-emerald-400">{passed} Pass</span>
                    <span className="text-orange-400">{warnings} Warn</span>
                    <span className="text-red-400">{failed} Fail</span>
                </div>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Avg Planning Time</div>
                <div className="text-3xl font-bold text-blue-400">{avgTime} ms</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Avg Confidence</div>
                <div className="text-3xl font-bold text-purple-400">{avgConfidence}%</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Top Engine</div>
                <div className="text-xl font-bold text-teal-400 capitalize">{mostFrequentEngine}</div>
            </div>
        </div>
    );
}
