'use client';

export type RendererHealthStatus = 'Healthy' | 'Missing' | 'Error' | 'Unknown';

export interface RendererCapability {
    domain: 'graph' | 'molecular' | 'concept_diagram' | 'anatomy' | 'maps' | 'timeline';
    features: string[];
}

export interface RendererInfo {
    id: string;
    name: string;
    status: RendererHealthStatus;
    version?: string;
    capabilities: RendererCapability;
    dependenciesOk: boolean;
    cssFound: boolean;
    errorMsg?: string;
    recommendedAction?: string;
    fallbacks: string[];
}

class RendererHealthManagerImpl {
    private renderers: Map<string, RendererInfo> = new Map();
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.initializeRegistry();
    }

    private initializeRegistry() {
        // Register known renderers with their capabilities and fallback chain
        this.register({
            id: 'jsxgraph',
            name: 'JSXGraph',
            status: 'Unknown',
            capabilities: {
                domain: 'graph',
                features: ['coordinate', 'geometry', 'functions', 'calculus', 'economics']
            },
            dependenciesOk: true,
            cssFound: false,
            fallbacks: ['plotly', 'echarts']
        });

        this.register({
            id: 'plotly',
            name: 'Plotly',
            status: 'Unknown',
            capabilities: {
                domain: 'graph',
                features: ['statistics', 'scatter', "histogram", 'regression', 'heatmaps']
            },
            dependenciesOk: true,
            cssFound: true,
            fallbacks: ['echarts']
        });

        this.register({
            id: 'echarts',
            name: 'Apache ECharts',
            status: 'Unknown',
            capabilities: {
                domain: 'graph',
                features: ['finance', 'dashboards', 'pie', 'bar', 'line']
            },
            dependenciesOk: true,
            cssFound: true,
            fallbacks: ['plotly']
        });

        this.register({
            id: '3dmol',
            name: '3Dmol.js',
            status: 'Unknown',
            capabilities: { domain: 'molecular', features: ['3d', 'protein', 'small_molecule'] },
            dependenciesOk: true,
            cssFound: true,
            fallbacks: ['molstar']
        });

        this.register({
            id: 'cesium',
            name: 'Cesium',
            status: 'Missing',
            capabilities: { domain: 'maps', features: ['3d_globe', 'gis'] },
            dependenciesOk: false,
            cssFound: false,
            errorMsg: 'Module not found',
            recommendedAction: 'npm install cesium',
            fallbacks: ['leaflet']
        });
    }

    private register(info: RendererInfo) {
        this.renderers.set(info.id, info);
    }

    public async performStartupCheck() {
        // Simulate dynamic import checks to avoid Next.js hard crashes on missing modules
        // In a real advanced setup, this could use API routes to read node_modules/package.json
        
        // Check ECharts
        try {
            const echarts = await import('echarts-for-react');
            this.updateStatus('echarts', 'Healthy', 'Installed');
        } catch (e) {
            this.updateStatus('echarts', 'Missing', undefined, 'Module not found', 'npm install echarts echarts-for-react');
        }

        // Check Plotly
        try {
            const plotly = await import('react-plotly.js');
            this.updateStatus('plotly', 'Healthy', 'Installed');
        } catch (e) {
            this.updateStatus('plotly', 'Missing', undefined, 'Module not found', 'npm install plotly.js-dist-min react-plotly.js');
        }

        // Check JSXGraph
        try {
            const jxg = await import('jsxgraph');
            this.updateStatus('jsxgraph', 'Healthy', '1.12+'); // Assume healthy if import passes
            const info = this.renderers.get('jsxgraph');
            if (info) {
                // Next.js exports map prevents importing CSS directly. CDN is used instead.
                info.cssFound = true; 
            }
        } catch (e) {
            this.updateStatus('jsxgraph', 'Missing', undefined, 'Module not found', 'npm install jsxgraph');
        }
    }

    public updateStatus(id: string, status: RendererHealthStatus, version?: string, errorMsg?: string, recommendedAction?: string) {
        const info = this.renderers.get(id);
        if (info) {
            info.status = status;
            if (version) info.version = version;
            if (errorMsg) info.errorMsg = errorMsg;
            if (recommendedAction) info.recommendedAction = recommendedAction;
            this.renderers.set(id, info);
            this.notifyListeners();
        }
    }

    public markRendererFailed(id: string, error: Error) {
        this.updateStatus(id, 'Error', undefined, error.message);
        console.warn(`[RendererHealthManager] Renderer ${id} failed at runtime:`, error);
    }

    public getInstalledRenderers(): RendererInfo[] {
        return Array.from(this.renderers.values());
    }

    public getRendererStatus(id: string): RendererHealthStatus {
        return this.renderers.get(id)?.status || 'Unknown';
    }

    public isRendererHealthy(id: string): boolean {
        return this.getRendererStatus(id) === 'Healthy';
    }

    public recommendFallback(domain: string, preferredId: string): string {
        const preferred = this.renderers.get(preferredId);
        
        if (preferred && preferred.status === 'Healthy') {
            return preferredId;
        }

        if (preferred && preferred.fallbacks) {
            for (const fallbackId of preferred.fallbacks) {
                if (this.isRendererHealthy(fallbackId)) {
                    console.warn(`[RendererHealthManager] ${preferredId} is ${preferred.status}. Falling back to ${fallbackId}.`);
                    return fallbackId;
                }
            }
        }

        // Ultimate fallback: return the first healthy renderer in the domain
        for (const [id, info] of this.renderers.entries()) {
            if (info.capabilities.domain === domain && info.status === 'Healthy') {
                console.warn(`[RendererHealthManager] No registered fallbacks worked. Using domain fallback: ${id}.`);
                return id;
            }
        }

        console.error(`[RendererHealthManager] CRITICAL: No healthy renderers found for domain ${domain}.`);
        return preferredId; // Return preferred and let the error boundary catch it
    }

    public subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }
}

export const RendererHealthManager = new RendererHealthManagerImpl();
