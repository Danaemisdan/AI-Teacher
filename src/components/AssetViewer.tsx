'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetViewerProps {
    query: string;
    mode?: 'auto' | '3d' | 'image';
}

const ANIMATED_KEYWORDS = ['heart', 'engine', 'solar', 'planet', 'earth', 'galaxy', 'cell', 'blood'];

export default function AssetViewer({ query, mode = 'auto' }: AssetViewerProps) {
    const [loading, setLoading] = useState(true);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [assetType, setAssetType] = useState<'3d' | 'image' | null>(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setMediaUrl(null);
        setTitle(null);
        setAssetType(null);

        const fetchAsset = async () => {
            try {
                let found3D = false;

                // STEP 1 & 2: Sketchfab Search (Only if mode !== 'image')
                if (mode !== 'image') {
                    const wantsAnimation = ANIMATED_KEYWORDS.some(kw => query.toLowerCase().includes(kw));

                    if (wantsAnimation) {
                        const resAnimated = await fetch(`/api/assets/sketchfab?q=${encodeURIComponent(query)}&animated=true`);
                        if (resAnimated.ok) {
                            const data = await resAnimated.json();
                            if (isMounted) {
                                setMediaUrl(data.embedUrl);
                                setTitle(data.title);
                                setAssetType('3d');
                                found3D = true;
                            }
                        }
                    }

                    if (!found3D) {
                        const resStatic = await fetch(`/api/assets/sketchfab?q=${encodeURIComponent(query)}`);
                        if (resStatic.ok) {
                            const data = await resStatic.json();
                            if (isMounted) {
                                setMediaUrl(data.embedUrl);
                                setTitle(data.title);
                                setAssetType('3d');
                                found3D = true;
                            }
                        }
                    }
                }

                // STEP 3: Ultimate Fallback to 2D Wikipedia Image (Only if mode is not '3d' and we haven't found a 3D model)
                if (!found3D && mode !== '3d') {
                    const resImage = await fetch(`/api/assets/wikipedia?q=${encodeURIComponent(query)}`);
                    if (resImage.ok) {
                        const data = await resImage.json();
                        if (isMounted) {
                            setMediaUrl(data.imageUrl);
                            setTitle(data.title);
                            setAssetType('image');
                        }
                    } else {
                        throw new Error(`Could not find any suitable media for "${query}".`);
                    }
                } else if (!found3D) {
                    throw new Error(`Could not find a 3D model for "${query}".`);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAsset();
        return () => { isMounted = false; };
    }, [query]);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-xl border border-white/20 bg-black/60 shadow-2xl flex items-center justify-center">
            
            {/* Header Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 z-20 flex gap-2 items-center shadow-lg">
                <div className={`w-2 h-2 rounded-full ${assetType === '3d' ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} />
                {assetType === '3d' ? 'INTERACTIVE 3D MODEL' : 'SCIENTIFIC IMAGE'}
                {title && <span className="opacity-50 ml-1">| {title}</span>}
            </div>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                        <p className="text-white/50 text-sm font-mono tracking-widest uppercase">
                            Searching libraries for {query}...
                        </p>
                    </motion.div>
                )}

                {!loading && error && (
                    <motion.div 
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-900/30 border border-red-500/50 p-6 rounded-xl text-red-200 text-center max-w-md"
                    >
                        <div className="text-2xl mb-2">⚠️</div>
                        <p className="font-mono text-sm">{error}</p>
                    </motion.div>
                )}

                {!loading && !error && mediaUrl && (
                    <motion.div
                        key="media"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        {assetType === '3d' ? (
                            <iframe 
                                src={mediaUrl} 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                xr-spatial-tracking="true"
                                execution-while-out-of-viewport="true"
                                execution-while-not-rendered="true"
                                web-share="true"
                                className="w-full h-full bg-black"
                            />
                        ) : (
                            <div className="w-full h-full p-8 flex items-center justify-center">
                                <img 
                                    src={mediaUrl} 
                                    alt={title || query}
                                    className="max-w-full max-h-full object-contain bg-gray-100 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] p-4"
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
