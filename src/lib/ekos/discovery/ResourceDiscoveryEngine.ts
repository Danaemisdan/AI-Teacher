import { resourceRegistry } from '../registries/EducationalResourceRegistry';
import { IResource } from '../core/IResource';
import { CapabilityRequirement } from '../core/ICapability';
import { rankingEngine, RankingContext } from './RankingEngine';

export class ResourceDiscoveryEngine {
    
    /**
     * Deterministically discovers and ranks resources for a given set of capabilities.
     * It does not use an LLM, but relies entirely on metadata matching and ranking plugins.
     */
    async discover(requirements: CapabilityRequirement[], context: RankingContext = {}): Promise<Record<string, IResource[]>> {
        const resolvedResources: Record<string, IResource[]> = {};

        for (const req of requirements) {
            // Find all candidates from the registry
            const candidates = await resourceRegistry.findCapableResources(req.capabilityId);
            
            // Rank candidates
            const ranked = rankingEngine.rank(candidates, context);
            
            resolvedResources[req.capabilityId] = ranked;
        }

        return resolvedResources;
    }
}

export const discoveryEngine = new ResourceDiscoveryEngine();
