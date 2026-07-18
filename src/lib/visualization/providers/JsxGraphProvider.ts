import { IVizProvider } from '../IVizProvider';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import JSXGraphAdapter from '@/components/GraphEngine/adapters/JSXGraphAdapter';

export class JsxGraphProvider implements IVizProvider {
    private root: Root | null = null;
    private container: HTMLElement | null = null;
    private currentSpec: any = null;

    render(container: HTMLElement, payload: any): void {
        this.container = container;
        this.currentSpec = payload;
        
        if (!this.root) {
            this.root = createRoot(container);
        }

        // Render the existing JSXGraphAdapter React component into the container
        this.root.render(
            React.createElement('div', { className: 'w-full h-full relative' },
                React.createElement(JSXGraphAdapter, { 
                    spec: payload,
                    onError: (err: any) => console.error("JsxGraphProvider error:", err)
                })
            )
        );
    }

    highlightElement(id: string): void {
        console.log(`[JsxGraphProvider] Highlighting ${id}`);
    }

    clearHighlights(): void {
        console.log(`[JsxGraphProvider] Clearing highlights`);
    }

    focusElement(id: string): void {
        console.log(`[JsxGraphProvider] Focusing ${id}`);
    }

    zoomToElement(id: string): void {
        console.log(`[JsxGraphProvider] Zooming to ${id}`);
    }

    resetView(): void {
        if (this.container && this.currentSpec) {
            this.render(this.container, this.currentSpec);
        }
    }

    animateElement(id: string): void {
        console.log(`[JsxGraphProvider] Animating ${id}`);
    }

    select(id: string): void {
        console.log(`[JsxGraphProvider] Selecting ${id}`);
    }

    supports(capability: string): boolean {
        return capability === 'interactive-graph' || capability === 'interactive-geometry' || capability === 'interactive-finance-chart';
    }

    validate(payload: any): boolean {
        return payload && (payload.curves || payload.points || payload.polygons);
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
