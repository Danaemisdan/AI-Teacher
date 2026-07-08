'use client';
import React, { useEffect, useState } from 'react';
import { AdapterProps } from '../types';
import { RendererHealthManager } from '@/lib/RendererHealthManager';

export default function PlotlyAdapter({ spec, onError, animationStep }: AdapterProps) {
    const [PlotComponent, setPlotComponent] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                // Lazy load
                const Plotly = (await import('plotly.js-dist-min')).default;
                const createPlotlyComponent = (await import('react-plotly.js/factory')).default;
                
                if (!isMounted) return;
                
                const Plot = createPlotlyComponent(Plotly);
                setPlotComponent(() => Plot);
            } catch (e: any) {
                RendererHealthManager.markRendererFailed('plotly', e);
                onError(e);
            }
        };
        init();
        return () => { isMounted = false; };
    }, [onError]);

    if (!PlotComponent) return <div className="animate-pulse w-full h-[500px] bg-slate-100/5 rounded-xl flex items-center justify-center">Loading Plotly...</div>;

    try {
        const mappedData = spec.curves?.filter((_, index) => {
            if (animationStep === undefined) return true;
            return index < animationStep;
        }).map(curve => {
            const isArea = curve.type === 'area';
            const isBar = curve.type === 'bar';
            
            let x: any[] = [];
            let y: any[] = [];
            if (curve.points) {
                x = curve.points.map(p => p[0]);
                y = curve.points.map(p => p[1]);
            }
            
            return {
                type: isBar ? 'bar' : 'scatter',
                mode: isBar ? undefined : (curve.type === 'scatter' ? 'markers' : 'lines+markers'),
                fill: isArea ? 'tozeroy' : 'none',
                name: curve.name || 'Trace',
                x,
                y,
                marker: { color: curve.color }
            };
        }) || [];

        const mappedLayout = {
            title: spec.title,
            xaxis: { title: spec.axes?.x, color: '#94a3b8' },
            yaxis: { title: spec.axes?.y, color: '#94a3b8' },
            autosize: true,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#cbd5e1' }
        };

        return (
            <div className="w-full h-[500px] flex justify-center">
                <PlotComponent
                    data={mappedData}
                    layout={mappedLayout}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    onError={(e: Error) => {
                        RendererHealthManager.markRendererFailed('plotly', e);
                        onError(e);
                    }}
                />
            </div>
        );
    } catch (e: any) {
        setTimeout(() => {
            RendererHealthManager.markRendererFailed('plotly', e);
            onError(e);
        }, 0);
        return null;
    }
}
