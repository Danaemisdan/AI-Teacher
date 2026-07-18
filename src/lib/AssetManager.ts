export interface AssetRegistryEntry {
    asset: string;
    renderer: string;
}

export class AssetManager {
    private static registryCache: Record<string, AssetRegistryEntry> | null = null;
    private static inMemoryAssets: Record<string, string> = {};

    private static async getRegistry(): Promise<Record<string, AssetRegistryEntry>> {
        if (this.registryCache) return this.registryCache;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('/assets/index.json?t=' + Date.now(), { signal: controller.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error("Failed to load registry index");
            this.registryCache = await res.json();
            return this.registryCache!;
        } catch (e) {
            console.warn("AssetManager: getRegistry error or timeout", e);
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
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        const fullQuery = normalize(topic + " " + (moduleName || ""));
        const normalizedTopic = normalize(topic);
        
        // Exact match on topic
        if (registry[normalizedTopic]) return normalizedTopic;
        
        // Match against raw keys just in case
        if (registry[topic.toLowerCase()]) return topic.toLowerCase();

        let bestMatchId: string | null = null;
        let bestScore = 0;
        
        for (const key in registry) {
            const keyLower = key.toLowerCase();
            const keyNormalized = normalize(keyLower);
            
            // Check if the registry key appears as a discrete word/phrase in the query
            const exactWordMatch = new RegExp(`\\b${keyNormalized}\\b`, 'i').test(fullQuery);
            
            // Stemming-like check for plurals or forms (e.g. "volcano" matching "volcanic")
            const baseKey = keyNormalized.replace(/ic\b|es\b|s\b|ion\b/, '');
            const partialWordMatch = baseKey.length > 3 && new RegExp(`\\b${baseKey}[a-z]*\\b`, 'i').test(fullQuery);

            if (exactWordMatch || partialWordMatch || fullQuery.includes(keyNormalized) || keyNormalized.includes(normalizedTopic) || normalizedTopic.includes(keyNormalized)) {
                const score = exactWordMatch ? 100 : (fullQuery.includes(keyNormalized) ? 75 : (partialWordMatch ? 50 : keyNormalized.length));
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
        if (this.inMemoryAssets[assetPath]) return this.inMemoryAssets[assetPath];
        try {
            const res = await fetch(`${assetPath}/diagram.svg?t=` + Date.now());
            if (res.ok) return await res.text();
        } catch (e) {}
        return null;
    }

    public static async getAssetData(id: string): Promise<string | null> {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, '_').trim();
        const idLower = normalize(id);
        const memKey = `/assets/${idLower}/v1`;
        if (this.inMemoryAssets[memKey]) return this.inMemoryAssets[memKey];
        
        if (this.registryCache && this.registryCache[id]) {
            const entry = this.registryCache[id];
            const payload = {
                type: id,
                capability: entry.renderer === 'concept_diagram' ? 'concept-diagram' : entry.renderer,
                renderer: entry.renderer,
                payload: { path: `/assets/${entry.asset}/v1` }
            };
            return JSON.stringify(payload);
        }
        return null;
    }

    public static registerNewAsset(id: string, renderer: string, assetData?: string): void {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, '_').trim();
        const idLower = normalize(id);
        
        if (!this.registryCache) {
            this.registryCache = {}; // best effort cache creation
        }
        
        // Only register if it doesn't already exist
        if (!this.registryCache[idLower]) {
            this.registryCache[idLower] = { asset: idLower, renderer };
        }
        
        if (assetData) {
            // For in-memory diagrams, use the id as the asset path essentially
            this.inMemoryAssets[`/assets/${idLower}/v1`] = assetData;
        }
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
