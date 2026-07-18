export interface ResourceRankingMetadata {
    authorityScore: number;
    educationalQuality: number;
    accessibility: number;
    learnerCompatibility: number;
    freshness: number;
    performance: number;
}

export interface ResourceAdapterConfig {
    adapterType: "internal_renderer" | "external_api" | "mcp_server" | "local_library";
    endpoint?: string;
    internalComponentId?: string;
    parameters?: Record<string, any>;
}

export interface IResource {
    id: string;
    name: string;
    description: string;
    capabilities: string[]; // List of capability IDs this resource fulfills
    constraints?: string[];
    supportedInputs: string[];
    supportedOutputs: string[];
    rankingMetadata: ResourceRankingMetadata;
    executionAdapter: ResourceAdapterConfig;
}
