'use client';
import React, { useState } from 'react';

export default function JsonViewer({ data }: { data: any }) {
    const [view, setView] = useState<'formatted' | 'raw'>('formatted');

    return (
        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="flex bg-slate-900 border-b border-slate-800">
                <button 
                    onClick={() => setView('formatted')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${view === 'formatted' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Formatted View
                </button>
                <button 
                    onClick={() => setView('raw')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${view === 'raw' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Raw JSON
                </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-auto">
                {view === 'raw' ? (
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : (
                    <div className="space-y-4">
                        {/* We will leave formatted view up to the parent component, so if they use JsonViewer for just raw viewing, we render children, else stringify */}
                        <pre className="text-sm text-emerald-300 font-mono">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
