import React, { useEffect, useState } from 'react';

interface SimulationEngineProps {
    query: string;
}

export default function SimulationEngine({ query }: SimulationEngineProps) {
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        
        async function fetchSimulation() {
            try {
                setLoading(true);
                const res = await fetch(`/api/assets/phet?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Failed to fetch simulation');
                
                const data = await res.json();
                if (mounted && data.embedUrl) {
                    setEmbedUrl(data.embedUrl);
                } else if (mounted) {
                    setError('No simulation found.');
                }
            } catch (err: any) {
                if (mounted) setError(err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        
        fetchSimulation();
        return () => { mounted = false; };
    }, [query]);

    return (
        <div className="w-full h-full relative bg-[#1a1a24] rounded-xl shadow-inner overflow-hidden border-4 border-white/30 flex items-center justify-center group">
            {/* Header Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 z-20 flex gap-2 items-center shadow-lg transition-opacity opacity-100 group-hover:opacity-10">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                SIMULATION ENGINE | {query}
            </div>

            {loading && (
                <div className="text-white/40 animate-pulse font-mono flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    <p>Loading Physics Lab...</p>
                </div>
            )}
            
            {error && (
                <div className="text-red-400 font-mono text-center p-8 bg-red-500/10 rounded-lg">
                    ⚠️ {error}
                </div>
            )}
            
            {embedUrl && !loading && (
                <iframe 
                    src={embedUrl}
                    className="w-full h-full border-none"
                    allowFullScreen
                    title="Interactive Simulation"
                />
            )}
        </div>
    );
}
