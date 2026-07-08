export interface AssetRegistryEntry {
    asset: string;
    renderer: string;
}

export class AssetManager {
    private static registryCache: Record<string, AssetRegistryEntry> | null = null;

    private static async getRegistry(): Promise<Record<string, AssetRegistryEntry>> {
        try {
            const res = await fetch('/assets/index.json?t=' + Date.now());
            if (!res.ok) throw new Error("Failed to load registry index");
            return await res.json();
        } catch (e) {
            console.error("AssetManager: getRegistry error", e);
            return {};
        }
    }

    public static async getRegistryEntry(id: string): Promise<AssetRegistryEntry | null> {
        const registry = await this.getRegistry();
        const idLower = id.toLowerCase();
        
        // Exact match
        if (registry[idLower]) {
            return registry[idLower];
        }

        // Fuzzy match for keywords
        const bestMatchId = await this.findBestRegistryMatch(id);
        if (bestMatchId && registry[bestMatchId]) {
            return registry[bestMatchId];
        }
        
        return null;
    }

    public static async findBestRegistryMatch(topic: string, moduleName?: string): Promise<string | null> {
        const registry = await this.getRegistry();
        const fullQuery = (topic + " " + (moduleName || "")).toLowerCase();
        
        // Exact match on topic
        if (registry[topic.toLowerCase()]) return topic.toLowerCase();

        let bestMatchId: string | null = null;
        let bestScore = 0;
        
        for (const key in registry) {
            const keyLower = key.toLowerCase();
            
            // Check if the registry key appears as a discrete word/phrase in the query
            const exactWordMatch = new RegExp(`\\b${keyLower}\\b`, 'i').test(fullQuery);
            
            // Stemming-like check for plurals or forms (e.g. "volcano" matching "volcanic")
            const baseKey = keyLower.replace(/ic\b|es\b|s\b|ion\b/, '');
            const partialWordMatch = baseKey.length > 3 && new RegExp(`\\b${baseKey}[a-z]*\\b`, 'i').test(fullQuery);

            if (exactWordMatch || partialWordMatch || fullQuery.includes(keyLower) || keyLower.includes(topic.toLowerCase())) {
                const score = exactWordMatch ? 100 : (partialWordMatch ? 50 : keyLower.length);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatchId = key;
                }
            }
        }
        return bestMatchId;
    }

    public static async getVersion(assetPath: string): Promise<string> {
        // In a real server environment, we could scan for v1, v2. 
        // For static hosting, we default to v1 unless specified otherwise.
        return 'v1';
    }

    public static async getRenderer(id: string): Promise<string | null> {
        const entry = await this.getRegistryEntry(id);
        return entry ? entry.renderer : null;
    }

    public static async getAsset(id: string): Promise<string | null> {
        const entry = await this.getRegistryEntry(id);
        if (!entry) return null;
        const version = await this.getVersion(entry.asset);
        return `/assets/${entry.asset}/${version}`;
    }

    public static async getMetadata(assetPath: string): Promise<any | null> {
        try {
            const res = await fetch(`${assetPath}/metadata.json?t=` + Date.now());
            if (res.ok) return await res.json();
        } catch (e) {}
        return null;
    }

    public static async getLesson(assetPath: string): Promise<any | null> {
        try {
            const res = await fetch(`${assetPath}/lesson.json?t=` + Date.now());
            if (res.ok) return await res.json();
        } catch (e) {}
        return null;
    }

    public static async getDiagramSVG(assetPath: string): Promise<string | null> {
        try {
            const res = await fetch(`${assetPath}/diagram.svg?t=` + Date.now());
            if (res.ok) return await res.text();
        } catch (e) {}
        return null;
    }

    public static async getRegistryPromptContext(): Promise<string> {
        const registry = await this.getRegistry();
        let context = "";
        for (const [id, entry] of Object.entries(registry)) {
            context += `- ID: ${id} | Type: ${entry.renderer}\n`;
        }
        return context;
    }
}
