'use client';
import React, { useEffect, useState } from 'react';
import { AdapterProps } from '../types';
import { RendererHealthManager } from '@/lib/RendererHealthManager';

export default function EChartsAdapter({ spec, onError, animationStep }: AdapterProps) {
    const [ReactECharts, setReactECharts] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                // Lazy load
                const m = await import('echarts-for-react');
                if (!isMounted) return;
                setReactECharts(() => m.default);
            } catch (e: any) {
                RendererHealthManager.markRendererFailed('echarts', e);
                onError(e);
            }
        };
        init();
        return () => { isMounted = false; };
    }, [onError]);

    if (!ReactECharts) return <div className="animate-pulse w-full h-[500px] bg-slate-100/5 rounded-xl flex items-center justify-center">Loading ECharts...</div>;

    try {
        const isBarChart = spec.curves?.[0]?.type === 'bar';
        const xAxisData = isBarChart ? spec.curves?.[0]?.points?.map(p => p[0]) : undefined;

        const mappedSeries = spec.curves?.filter((_, index) => {
            // Animate: show 1 curve per step (step 0 = axes only, step 1 = curve 1, step 2 = curve 2)
            if (animationStep === undefined) return true;
            return index < animationStep;
        }).map(curve => {
            let data: any[] = [];
            if (curve.points) {
                if (isBarChart) {
                    data = curve.points.map(p => p[1]);
                } else {
                    data = curve.points.map(p => [p[0], p[1]]);
                }
            }

            return {
                name: curve.name || 'Trace',
                type: curve.type === 'area' ? 'line' : curve.type,
                areaStyle: curve.type === 'area' ? {} : undefined,
                data,
                itemStyle: { color: curve.color },
                smooth: curve.type === 'line' || curve.type === 'area',
                animationDuration: 1500, // ECharts built-in drawing animation
            };
        }) || [];

        const mappedOption = {
            title: { text: spec.title, textStyle: { color: '#cbd5e1' }, left: 'center' },
            tooltip: { trigger: isBarChart ? 'axis' : 'item' },
            xAxis: {
                name: spec.axes?.x,
                type: isBarChart ? 'category' : 'value',
                data: xAxisData,
                axisLine: { lineStyle: { color: '#94a3b8' } },
                nameTextStyle: { color: '#94a3b8' }
            },
            yAxis: {
                name: spec.axes?.y,
                type: 'value',
                axisLine: { lineStyle: { color: '#94a3b8' } },
                nameTextStyle: { color: '#94a3b8' }
            },
            series: mappedSeries,
            backgroundColor: 'transparent',
            textStyle: { color: '#94a3b8' }
        };

        return (
            <div className="w-full h-[500px] flex justify-center">
                <ReactECharts 
                    option={mappedOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </div>
        );
    } catch (e: any) {
        setTimeout(() => {
            RendererHealthManager.markRendererFailed('echarts', e);
            onError(e);
        }, 0);
        return null;
    }
}
