'use client';
import React, { useEffect, useState } from 'react';
import { RendererHealthManager, RendererInfo } from '@/lib/RendererHealthManager';

export default function RendererDashboard() {
    const [renderers, setRenderers] = useState<RendererInfo[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateRenderers = () => {
            setRenderers(RendererHealthManager.getInstalledRenderers());
        };

        updateRenderers();
        const unsubscribe = RendererHealthManager.subscribe(updateRenderers);

        // Toggle dashboard with Ctrl + Shift + R
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            unsubscribe();
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 pointer-events-auto text-white font-sans overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl p-8 flex flex-col max-h-full">
                
                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Renderer Health Dashboard</h1>
                        <p className="text-slate-400 mt-2 text-sm">Real-time status of all visualization adapters.</p>
                    </div>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Close (Ctrl+Shift+R)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8">
                    {renderers.map(r => (
                        <div key={r.id} className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                            r.status === 'Healthy' ? 'bg-emerald-900/20 border-emerald-500/30' :
                            r.status === 'Missing' ? 'bg-amber-900/20 border-amber-500/30' :
                            r.status === 'Error' ? 'bg-rose-900/20 border-rose-500/30' :
                            'bg-slate-800 border-slate-700'
                        }`}>
                            
                            {/* Status Indicator */}
                            <div className={`absolute top-4 right-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                r.status === 'Healthy' ? 'text-emerald-400 bg-emerald-400/10' :
                                r.status === 'Missing' ? 'text-amber-400 bg-amber-400/10' :
                                r.status === 'Error' ? 'text-rose-400 bg-rose-400/10' :
                                'text-slate-400 bg-slate-400/10'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    r.status === 'Healthy' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                                    r.status === 'Missing' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                                    r.status === 'Error' ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]' :
                                    'bg-slate-400'
                                }`} />
                                {r.status}
                            </div>

                            <h3 className="text-xl font-bold mb-1">{r.name}</h3>
                            <div className="text-xs text-slate-400 mb-4 flex gap-3">
                                <span>ID: <code className="text-blue-300">{r.id}</code></span>
                                {r.version && <span>Version: <code className="text-emerald-300">{r.version}</code></span>}
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Capabilities</span>
                                    <div className="flex flex-wrap gap-1">
                                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-indigo-500/30">
                                            {r.capabilities.domain}
                                        </span>
                                        {r.capabilities.features.map(f => (
                                            <span key={f} className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-600/50">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/50">
                                    <div>
                                        <span className="text-slate-500 block text-xs mb-1">Dependencies</span>
                                        <span className={r.dependenciesOk ? "text-emerald-400" : "text-amber-400"}>
                                            {r.dependenciesOk ? "OK" : "Missing"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-xs mb-1">CSS Status</span>
                                        <span className={r.cssFound ? "text-emerald-400" : "text-slate-400"}>
                                            {r.cssFound ? "Found" : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                {r.fallbacks.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                                        <span className="text-slate-500 block text-xs mb-1">Fallback Chain</span>
                                        <div className="flex gap-1 items-center">
                                            <span className="text-blue-300 font-mono text-xs">{r.id}</span>
                                            {r.fallbacks.map(fb => (
                                                <React.Fragment key={fb}>
                                                    <span className="text-slate-600">→</span>
                                                    <span className="text-slate-400 font-mono text-xs">{fb}</span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(r.errorMsg || r.recommendedAction) && (
                                    <div className="mt-4 bg-black/40 rounded-lg p-3 border border-amber-900/50">
                                        {r.errorMsg && (
                                            <div className="text-rose-400 font-mono text-xs mb-2">
                                                Error: {r.errorMsg}
                                            </div>
                                        )}
                                        {r.recommendedAction && (
                                            <div>
                                                <span className="text-amber-300/70 text-xs block mb-1">Recommended Fix:</span>
                                                <code className="block bg-amber-500/10 text-amber-300 px-2 py-1 rounded text-xs border border-amber-500/20">
                                                    {r.recommendedAction}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
