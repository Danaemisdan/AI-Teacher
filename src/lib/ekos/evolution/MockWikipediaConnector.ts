import { ISourceConnector, RawKnowledgePayload, SourceConnectorConfig } from './ISourceConnector';

export class MockWikipediaConnector implements ISourceConnector {
    getConfig(): SourceConnectorConfig {
        return {
            id: "src-wikipedia-mock",
            name: "Wikipedia Knowledge Connector",
            description: "Mock connector simulating Wikipedia ingestion",
            sourceType: "API"
        };
    }

    async fetchNewKnowledge(): Promise<RawKnowledgePayload[]> {
        // Simulating the discovery of new educational content
        return [
            {
                sourceId: this.getConfig().id,
                rawContent: {
                    title: "Cellular Respiration",
                    extract: "Cellular respiration is a set of metabolic reactions...",
                    categories: ["Biology", "Metabolism"]
                },
                fetchedAt: Date.now(),
                metadata: {
                    url: "https://en.wikipedia.org/wiki/Cellular_respiration",
                    authoritySignal: "high"
                }
            }
        ];
    }
}
