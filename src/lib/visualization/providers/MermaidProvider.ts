import { IVizProvider } from '../IVizProvider';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import MermaidEngine from '@/components/engines/MermaidEngine';

export class MermaidProvider implements IVizProvider {
    private root: Root | null = null;
    private container: HTMLElement | null = null;
    private currentPayload: any = null;

    render(container: HTMLElement, payload: any): void {
        this.container = container;
        this.currentPayload = payload;
        
        if (!this.root) {
            this.root = createRoot(container);
        }

        const code = typeof payload === 'string' ? payload : (payload.code || '');

        this.root.render(
            React.createElement('div', { className: 'w-full h-full relative' },
                React.createElement(MermaidEngine, { 
                    code: code
                })
            )
        );
    }

    highlightElement(id: string): void {
        console.log(`[MermaidProvider] Highlighting ${id}`);
    }

    clearHighlights(): void {
        console.log(`[MermaidProvider] Clearing highlights`);
    }

    focusElement(id: string): void {
        console.log(`[MermaidProvider] Focusing ${id}`);
    }

    zoomToElement(id: string): void {
        console.log(`[MermaidProvider] Zooming to ${id}`);
    }

    pan(x: number, y: number): void {
        console.log(`[MermaidProvider] Panning by ${x}, ${y}`);
    }

    resetView(): void {
        if (this.container && this.currentPayload) {
            this.render(this.container, this.currentPayload);
        }
    }

    animateElement(id: string): void {
        console.log(`[MermaidProvider] Animating ${id}`);
    }

    select(id: string): void {
        console.log(`[MermaidProvider] Selecting ${id}`);
    }

    supports(capability: string): boolean {
        return capability === 'interactive-flowchart' || capability === 'interactive-tree' || capability === 'interactive-process-diagram' || capability === 'interactive-organization-chart';
    }

    validate(payload: any): boolean {
        return typeof payload === 'string' || (payload && payload.code);
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
