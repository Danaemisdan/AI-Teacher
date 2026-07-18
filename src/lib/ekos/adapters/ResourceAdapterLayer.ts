import { ResourceAdapterConfig } from '../core/IResource';

export interface ExecutionAdapter {
    execute(config: ResourceAdapterConfig, context: any): Promise<any>;
}

export class InternalRendererAdapter implements ExecutionAdapter {
    async execute(config: ResourceAdapterConfig, context: any): Promise<any> {
        return {
            type: "RENDER_COMPONENT",
            componentId: config.internalComponentId,
            props: config.parameters || context
        };
    }
}

export class ExternalApiAdapter implements ExecutionAdapter {
    async execute(config: ResourceAdapterConfig, context: any): Promise<any> {
        // In a real implementation, this would make a fetch() call
        return {
            type: "API_CALL",
            endpoint: config.endpoint,
            params: config.parameters || context
        };
    }
}

export class ResourceAdapterLayer {
    private adapters: Record<string, ExecutionAdapter> = {};

    constructor() {
        // Register default adapters for convenience, but architecture is fully open
        this.registerAdapter("internal_renderer", new InternalRendererAdapter());
        this.registerAdapter("external_api", new ExternalApiAdapter());
    }

    registerAdapter(type: string, adapter: ExecutionAdapter) {
        this.adapters[type] = adapter;
    }

    async executeResource(config: ResourceAdapterConfig, context: any): Promise<any> {
        const adapter = this.adapters[config.adapterType];
        if (!adapter) {
            throw new Error(`No adapter found for type: ${config.adapterType}`);
        }
        return adapter.execute(config, context);
    }
}

export const resourceAdapterLayer = new ResourceAdapterLayer();
