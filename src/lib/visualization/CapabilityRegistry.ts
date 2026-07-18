import { IVizProvider } from './IVizProvider';

export type CapabilityType = 
    | 'interactive-graph' 
    | 'interactive-timeline' 
    | 'interactive-map' 
    | 'interactive-molecule' 
    | 'interactive-anatomy' 
    | 'interactive-flowchart' 
    | 'interactive-tree' 
    | 'interactive-network' 
    | 'interactive-chart' 
    | 'interactive-equation' 
    | 'interactive-geometry' 
    | 'interactive-solar-system' 
    | 'interactive-circuit' 
    | 'interactive-process-diagram' 
    | 'interactive-dna' 
    | 'interactive-cell' 
    | 'interactive-finance-chart' 
    | 'interactive-organization-chart' 
    | 'interactive-gis' 
    | 'interactive-simulation'
    | 'static-image'; // Fallback

export interface VisualizationPayload {
    type: CapabilityType;
    capability: string; // E.g., 'economics', 'biology'
    renderer?: string;  // E.g., 'jsxgraph', 'threejs' (Optional override)
    payload: any;       // The actual data to be passed to the provider
}

export class CapabilityRegistry {
    private static providers: Map<string, IVizProvider> = new Map();

    // The mapping from a capability to a prioritized list of provider IDs
    private static capabilityMap: Record<CapabilityType, string[]> = {
        'interactive-graph': ['jsxgraph', 'plotly', 'd3'],
        'interactive-timeline': ['timelinejs'],
        'interactive-map': ['leaflet', 'cesium'],
        'interactive-molecule': ['3dmol', 'molstar'],
        'interactive-anatomy': ['threejs', 'gltf'],
        'interactive-flowchart': ['reactflow', 'mermaid'],
        'interactive-tree': ['reactflow', 'mermaid'],
        'interactive-network': ['reactflow', 'cytoscape'],
        'interactive-chart': ['echarts', 'plotly'],
        'interactive-equation': ['katex'],
        'interactive-geometry': ['jsxgraph', 'geogebra'],
        'interactive-solar-system': ['threejs'],
        'interactive-circuit': ['simulation'],
        'interactive-process-diagram': ['mermaid'],
        'interactive-dna': ['3dmol'],
        'interactive-cell': ['threejs'],
        'interactive-finance-chart': ['echarts', 'jsxgraph'],
        'interactive-organization-chart': ['mermaid'],
        'interactive-gis': ['leaflet'],
        'interactive-simulation': ['p5js', 'matterjs'],
        'static-image': ['imageviewer']
    };

    /**
     * Registers a new provider into the system.
     */
    public static registerProvider(id: string, provider: IVizProvider): void {
        this.providers.set(id, provider);
    }

    /**
     * Returns the best available provider for a given visualization payload.
     */
    public static getBestProvider(visData: VisualizationPayload): { id: string, provider: IVizProvider } | null {
        // If a specific renderer was requested and is available/supports it
        if (visData.renderer && this.providers.has(visData.renderer)) {
            const provider = this.providers.get(visData.renderer)!;
            if (provider.supports(visData.type)) {
                return { id: visData.renderer, provider };
            }
        }

        // Fallback to the capability prioritization list
        const preferredEngineIds = this.capabilityMap[visData.type];
        if (!preferredEngineIds) return null;

        for (const engineId of preferredEngineIds) {
            const provider = this.providers.get(engineId);
            if (provider && provider.supports(visData.type)) {
                return { id: engineId, provider };
            }
        }

        return null; // No suitable provider found
    }

    /**
     * Checks if we have at least one registered provider for this capability.
     */
    public static hasCapability(type: CapabilityType): boolean {
        const preferredEngineIds = this.capabilityMap[type] || [];
        return preferredEngineIds.some(id => this.providers.has(id));
    }
}
