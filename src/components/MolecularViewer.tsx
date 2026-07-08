import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';

interface MolecularViewerProps {
    query: string;
}

export default function MolecularViewer({ query }: MolecularViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        let viewer: any = null;

        const loadMolecule = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure 3Dmol is loaded
                if (typeof window === 'undefined' || !(window as any).$3Dmol) {
                    throw new Error("3Dmol.js not loaded yet");
                }

                const $3Dmol = (window as any).$3Dmol;
                
                if (viewerRef.current) {
                    viewerRef.current.innerHTML = ''; // Clear previous
                    viewer = $3Dmol.createViewer(viewerRef.current, {
                        backgroundColor: 'black'
                    });

                    // Fetch SDF from PubChem
                    const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/SDF`);
                    if (!res.ok) {
                        throw new Error(`Could not find molecule data for "${query}" on PubChem.`);
                    }
                    const sdfData = await res.text();

                    viewer.addModel(sdfData, "sdf");
                    
                    // Apply beautiful styling
                    viewer.setStyle({}, {
                        stick: { radius: 0.15, color: 'spectrum' },
                        sphere: { radius: 0.4, color: 'spectrum' }
                    });
                    
                    viewer.zoomTo();
                    viewer.render();
                    
                    // Add subtle animation
                    viewer.spin("y", 0.5);
                }
            } catch (err: any) {
                console.error("Failed to load molecule:", err);
                setError(err.message || "Failed to load molecule");
            } finally {
                setIsLoading(false);
            }
        };

        // If 3Dmol is already on window, load immediately. Otherwise wait for script.
        const checkInterval = setInterval(() => {
            if ((window as any).$3Dmol) {
                clearInterval(checkInterval);
                loadMolecule();
            }
        }, 100);

        return () => {
            clearInterval(checkInterval);
            if (viewer) viewer.removeAllModels();
        };
    }, [query]);

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,255,128,0.2)] border border-green-500/30 bg-black">
            <Script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js" strategy="lazyOnload" />
            
            {/* 3D Container */}
            <div ref={viewerRef} className="w-full h-full" style={{ position: 'relative' }}></div>

            {/* Overlays */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00] animate-pulse"></span>
                        <span className="text-green-400 font-mono text-sm tracking-widest uppercase">Molecular Viewer</span>
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 capitalize" style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                        {query}
                    </h2>
                </motion.div>
            </div>

            <div className="absolute bottom-6 left-6 z-10 pointer-events-none text-white/40 text-xs font-mono">
                Powered by PubChem & 3Dmol.js
            </div>

            {/* Loading/Error States */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="text-green-500 font-mono flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                            <p className="animate-pulse">Synthesizing {query}...</p>
                        </div>
                    </motion.div>
                )}
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        <div className="text-red-500 font-mono text-center p-8 border border-red-500/30 rounded-xl bg-red-500/5">
                            <h3 className="text-xl font-bold mb-2">Synthesis Failed</h3>
                            <p className="opacity-80">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
