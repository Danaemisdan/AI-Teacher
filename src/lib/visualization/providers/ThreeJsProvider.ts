import { IVizProvider } from '../IVizProvider';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import AnatomyEngine from '@/components/AnatomyEngine';

export class ThreeJsProvider implements IVizProvider {
    private root: Root | null = null;
    private container: HTMLElement | null = null;
    private currentPayload: any = null;

    render(container: HTMLElement, payload: any): void {
        this.container = container;
        this.currentPayload = payload;
        
        if (!this.root) {
            this.root = createRoot(container);
        }

        // We use AnatomyEngine as the stub for our interactive anatomy/3d needs for now.
        // It accepts a path (e.g. to a glTF file) or highlightId.
        const path = typeof payload === 'string' ? payload : (payload.path || 'human_heart');

        this.root.render(
            React.createElement('div', { className: 'w-full h-full relative' },
                React.createElement(AnatomyEngine, { 
                    path: path,
                    highlightId: payload.highlightId || null
                })
            )
        );
    }

    highlightElement(id: string): void {
        console.log(`[ThreeJsProvider] Highlighting ${id}`);
        // We can re-render AnatomyEngine with the new highlightId
        if (this.container && this.currentPayload) {
            const newPayload = { ...this.currentPayload, highlightId: id };
            this.render(this.container, newPayload);
        }
    }

    clearHighlights(): void {
        console.log(`[ThreeJsProvider] Clearing highlights`);
        if (this.container && this.currentPayload) {
            const newPayload = { ...this.currentPayload, highlightId: null };
            this.render(this.container, newPayload);
        }
    }

    focusElement(id: string): void {
        console.log(`[ThreeJsProvider] Focusing on ${id}`);
    }

    zoomToElement(id: string): void {
        console.log(`[ThreeJsProvider] Zooming to ${id}`);
    }

    resetView(): void {
        console.log(`[ThreeJsProvider] Resetting view`);
    }

    animateElement(id: string): void {
        console.log(`[ThreeJsProvider] Animating ${id}`);
    }

    select(id: string): void {
        console.log(`[ThreeJsProvider] Selecting ${id}`);
    }

    supports(capability: string): boolean {
        return capability === 'interactive-anatomy' || capability === 'interactive-solar-system' || capability === 'interactive-cell';
    }

    validate(payload: any): boolean {
        return true; // Very permissive for the stub
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
