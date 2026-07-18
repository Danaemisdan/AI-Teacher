import { IResource } from '../core/IResource';

export interface RankingContext {
    learnerProfile?: any;
    queryIntent?: any;
}

export interface IRankingStrategy {
    name: string;
    weight: number;
    score(resource: IResource, context: RankingContext): number; // Returns a score between 0 and 1
}

// Concrete Strategies
export class AuthorityRankingStrategy implements IRankingStrategy {
    name = "Authority";
    weight = 1.0;
    
    score(resource: IResource, context: RankingContext): number {
        return (resource.rankingMetadata.authorityScore || 0) / 10;
    }
}

export class EducationalQualityStrategy implements IRankingStrategy {
    name = "EducationalQuality";
    weight = 1.2; // slightly more weight
    
    score(resource: IResource, context: RankingContext): number {
        return (resource.rankingMetadata.educationalQuality || 0) / 10;
    }
}

export class LearnerCompatibilityStrategy implements IRankingStrategy {
    name = "LearnerCompatibility";
    weight = 1.5; // highest weight
    
    score(resource: IResource, context: RankingContext): number {
        // In a real system, this would evaluate context.learnerProfile against the resource
        return (resource.rankingMetadata.learnerCompatibility || 0) / 10;
    }
}

export class RankingEngine {
    private strategies: IRankingStrategy[] = [];

    constructor() {
        // Register default plugins
        this.registerStrategy(new AuthorityRankingStrategy());
        this.registerStrategy(new EducationalQualityStrategy());
        this.registerStrategy(new LearnerCompatibilityStrategy());
    }

    registerStrategy(strategy: IRankingStrategy) {
        this.strategies.push(strategy);
    }

    rank(resources: IResource[], context: RankingContext = {}): IResource[] {
        const scored = resources.map(resource => {
            let totalScore = 0;
            let maxPossibleScore = 0;

            for (const strategy of this.strategies) {
                const s = strategy.score(resource, context);
                totalScore += (s * strategy.weight);
                maxPossibleScore += strategy.weight;
            }

            const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) : 0;
            return { resource, score: normalizedScore };
        });

        // Sort descending by score
        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.resource);
    }
}

export const rankingEngine = new RankingEngine();
