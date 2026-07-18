import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IVizProvider } from '../IVizProvider';
import { CapabilityType } from '../CapabilityRegistry';
import ConceptDiagramEngine from '@/components/ConceptDiagramEngine';

export class ConceptDiagramProvider implements IVizProvider {
    private root: Root | null = null;
    private container: HTMLElement | null = null;
    private currentPayload: any = null;

    supports(capability: string): boolean {
        return capability === 'interactive-process-diagram' || capability === 'concept-diagram';
    }

    validate(payload: any): boolean {
        return true; // We accept any payload for now
    }

    render(container: HTMLElement, payload: any): void {
        this.container = container;
        this.currentPayload = payload;
        if (!this.root) {
            this.root = createRoot(container);
        }

        const path = payload.path || '';
        const highlightId = payload.highlightId || null;

        this.root.render(
            React.createElement('div', { className: 'w-full h-full relative' },
                React.createElement(ConceptDiagramEngine, { 
                    path: path,
                    highlightId: highlightId
                })
            )
        );
    }

    highlightElement(id: string): void {
        if (this.currentPayload) {
            this.currentPayload.highlightId = id;
            this.render(this.container!, this.currentPayload);
        }
    }

    clearHighlights(): void {
        if (this.currentPayload) {
            this.currentPayload.highlightId = null;
            this.render(this.container!, this.currentPayload);
        }
    }

    focusElement(id: string): void {}
    zoomToElement(id: string): void {}
    resetView(): void {}
    animateElement(id: string): void {}
    select(id: string): void {}

    dispose(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        this.container = null;
    }
}
