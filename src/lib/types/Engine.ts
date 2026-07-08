export interface EngineConfig {
    intent: string;
    topic: string;
    strategyId: string;
    assets: any[];
}

export interface VisualizationEngine {
    /**
     * Initializes the engine with configuration and necessary assets.
     */
    initialize(config: EngineConfig): Promise<void>;
    
    /**
     * Prepares the engine before rendering. Often used to preload heavy assets.
     */
    prepare(): Promise<void>;
    
    /**
     * Executes the render logic on the given container.
     */
    render(containerId: string): void;
    
    /**
     * Pauses any ongoing animations or simulations.
     */
    pause(): void;
    
    /**
     * Resumes animations or simulations.
     */
    resume(): void;
    
    /**
     * Cleans up all resources, event listeners, and instances.
     */
    dispose(): void;
    
    /**
     * Checks if this engine supports the specified visualization intent.
     */
    supports(intent: string): boolean;
    
    /**
     * Returns a list of supported capabilities.
     */
    getCapabilities(): string[];
    
    /**
     * Returns a list of asset IDs or types required by this engine to render the intent.
     */
    getAssetRequirements(): string[];
}
