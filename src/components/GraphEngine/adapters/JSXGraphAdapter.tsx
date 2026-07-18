'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AdapterProps } from '../types';
import { RendererHealthManager } from '@/lib/RendererHealthManager';

export default function JSXGraphAdapter({ spec, onError }: AdapterProps) {
    const jsxgraphRef = useRef<HTMLDivElement>(null);
    const [randomId, setRandomId] = useState('');

    useEffect(() => {
        setRandomId(Math.random().toString(36).substr(2, 9));
    }, []);

    useEffect(() => {
        let board: any = null;
        let isMounted = true;

        const init = async () => {
            if (jsxgraphRef.current && randomId) {
                try {
                    // Lazy import to decouple dependencies
                    const JXG = (await import('jsxgraph')).default;
                    
                    if (!isMounted) return;

                    board = JXG.JSXGraph.initBoard(jsxgraphRef.current.id, { boundingbox: [-10, 10, 10, -10], axis: true, showCopyright: false });
                    
                    let generatedScript = '';
                    spec.curves?.forEach(curve => {
                        if (curve.func) {
                            generatedScript += `board.create('functiongraph', [function(x){ return ${curve.func}; }], { strokeColor: '${curve.color || '#3b82f6'}', strokeWidth: 2 });\n`;
                        } else if (curve.points) {
                            const xs = JSON.stringify(curve.points.map(p => p[0]));
                            const ys = JSON.stringify(curve.points.map(p => p[1]));
                            generatedScript += `board.create('curve', [${xs}, ${ys}], { strokeColor: '${curve.color || '#ef4444'}', strokeWidth: 2 });\n`;
                        }
                    });

                    if (generatedScript) {
                        const func = new Function('board', 'JXG', generatedScript);
                        func(board, JXG);
                    } else if ((spec as any).script) {
                        const func = new Function('board', 'JXG', (spec as any).script);
                        func(board, JXG);
                    }
                } catch (e: any) {
                    RendererHealthManager.markRendererFailed('jsxgraph', e);
                    onError(e);
                }
            }
        };

        const t = setTimeout(init, 100);

        return () => {
            isMounted = false;
            clearTimeout(t);
            if (board) {
                try {
                    import('jsxgraph').then(m => m.default.JSXGraph.freeBoard(board)).catch(() => {});
                } catch(e) {}
            }
        };
    }, [spec, randomId, onError]);

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css" />
            <div id={`jxgbox-${randomId}`} ref={jsxgraphRef} className="jxgbox rounded-lg border border-slate-200" style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}></div>
        </div>
    );
}
