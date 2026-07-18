import { IVizProvider } from '../IVizProvider';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import ReactECharts from 'echarts-for-react';

export class EchartsProvider implements IVizProvider {
    private root: Root | null = null;
    private container: HTMLElement | null = null;
    private currentSpec: any = null;

    render(container: HTMLElement, payload: any): void {
        if (this.container !== container) {
            if (this.root) {
                setTimeout(() => this.root?.unmount(), 0);
            }
            this.root = createRoot(container);
            this.container = container;
        }
        
        this.currentSpec = payload;
        const option = payload; // ECharts options object

        // Set transparent background for sleek dark mode look if not specified
        if (!option.backgroundColor) {
            option.backgroundColor = 'transparent';
        }

        // Render the ECharts React component into the container
        this.root?.render(
            React.createElement('div', { className: 'w-full h-full relative p-4 flex items-center justify-center' },
                React.createElement(ReactECharts, { 
                    option: option,
                    style: { height: '100%', width: '100%', minHeight: '400px' },
                    opts: { renderer: 'canvas' },
                    theme: 'dark'
                })
            )
        );
    }

    highlightElement(id: string): void {
        console.log(`[EchartsProvider] Highlighting ${id}`);
        // Requires dispatching action down to echarts instance
    }

    clearHighlights(): void {
        console.log(`[EchartsProvider] Clearing highlights`);
    }

    focusElement(id: string): void {
        console.log(`[EchartsProvider] Focusing ${id}`);
    }

    zoomToElement(id: string): void {
        console.log(`[EchartsProvider] Zooming to ${id}`);
    }

    resetView(): void {
        if (this.container && this.currentSpec) {
            this.render(this.container, this.currentSpec);
        }
    }

    animateElement(id: string): void {
        console.log(`[EchartsProvider] Animating ${id}`);
    }

    select(id: string): void {
        console.log(`[EchartsProvider] Selecting ${id}`);
    }

    supports(capability: string): boolean {
        return capability === 'interactive-finance-chart' || capability === 'interactive-chart';
    }

    validate(payload: any): boolean {
        return payload && (payload.series || payload.xAxis || payload.yAxis);
    }

    dispose(): void {
        if (this.root) {
            const root = this.root;
            setTimeout(() => {
                root.unmount();
            }, 0);
            this.root = null;
        }
    }
}
