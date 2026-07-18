export interface SourceConnectorConfig {
    id: string;
    name: string;
    description: string;
    sourceType: "API" | "Repository" | "Dataset" | "Web";
}

export interface RawKnowledgePayload {
    sourceId: string;
    rawContent: any;
    fetchedAt: number;
    metadata: Record<string, any>;
}

export interface ISourceConnector {
    getConfig(): SourceConnectorConfig;
    fetchNewKnowledge(): Promise<RawKnowledgePayload[]>;
}
