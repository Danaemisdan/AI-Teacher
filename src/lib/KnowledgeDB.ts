export interface KnowledgeContext {
    summary: string;
    source: string;
    sourceUrl: string;
}

/**
 * Knowledge DB: Fetches verified facts from authoritative APIs based on the domain.
 * Currently uses Wikipedia REST API (free, no API key required) as the primary factual source.
 */
export async function fetchKnowledge(topic: string, domainKey?: string): Promise<KnowledgeContext | null> {
    if (!topic) return null;
    
    // Clean topic for searching
    const searchTopic = topic.trim().replace(/ /g, '_');
    
    try {
        // We use Wikipedia for almost everything as it's the most robust free factual API.
        // It returns a clean plain-text summary and an extract.
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTopic)}`);
        
        if (!res.ok) {
            // If direct match fails, try a search to get the closest page title
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&utf8=&format=json&origin=*`);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
                    const closestTitle = searchData.query.search[0].title.replace(/ /g, '_');
                    const fallbackRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(closestTitle)}`);
                    if (fallbackRes.ok) {
                        const fallbackData = await fallbackRes.json();
                        return {
                            summary: fallbackData.extract,
                            source: 'Wikipedia',
                            sourceUrl: fallbackData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${closestTitle}`
                        };
                    }
                }
            }
            return null;
        }

        const data = await res.json();
        
        // We only want to inject facts if we found a valid description
        if (data.type === 'standard' && data.extract) {
            return {
                summary: data.extract,
                source: 'Wikipedia',
                sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${searchTopic}`
            };
        }
        
        return null;
    } catch (e) {
        console.error("KnowledgeDB Error: Failed to fetch factual context", e);
        return null;
    }
}
