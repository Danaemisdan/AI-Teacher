export interface IVizProvider {
    /**
     * Renders the visualization inside the given container with the provided payload.
     * @param container The DOM element to render into
     * @param payload The engine-specific data (JSON, string, etc.)
     */
    render(container: HTMLElement, payload: any): void;

    /**
     * Highlights a specific element within the visualization.
     * @param id The identifier of the element to highlight.
     */
    highlightElement(id: string): void;

    /**
     * Clears all active highlights.
     */
    clearHighlights(): void;

    /**
     * Focuses the camera or viewport on a specific element.
     * @param id The identifier of the element to focus.
     */
    focusElement(id: string): void;

    /**
     * Zooms the visualization in or out to a specific element.
     * @param id The identifier of the element to zoom to.
     */
    zoomToElement(id: string): void;

    /**
     * Resets the visualization to its original state (zoom, pan, highlights).
     */
    resetView(): void;

    /**
     * Triggers a specific animation sequence.
     * @param id The ID of the element or animation to trigger.
     */
    animateElement(id: string): void;

    /**
     * Selects an element (useful for interactive quizzes or user selection).
     * @param id The identifier of the element.
     */
    select(id: string): void;

    /**
     * Checks if this provider supports the given capability string (e.g., "interactive-graph").
     */
    supports(capability: string): boolean;

    /**
     * Validates if the given payload is strictly compatible with this provider.
     */
    validate(payload: any): boolean;

    /**
     * Cleans up all resources, event listeners, and WebGL contexts.
     */
    dispose(): void;
}
