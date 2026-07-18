import { TeachingStrategyMetadata } from './TeachingStrategyRegistry';
import { TaskContext } from '../../ekos/agents/TaskContext';

export interface ScoredStrategy {
    strategy: TeachingStrategyMetadata;
    score: number;
    rationale: string;
}

export interface ITeachingStrategyEvaluator {
    evaluate(candidates: TeachingStrategyMetadata[], context: Readonly<TaskContext>): Promise<ScoredStrategy[]>;
}

export class DeterministicStrategyEvaluator implements ITeachingStrategyEvaluator {
    
    async evaluate(candidates: TeachingStrategyMetadata[], context: Readonly<TaskContext>): Promise<ScoredStrategy[]> {
        const targetCompetency = context.competencyContext?.targetCompetency || "comp-critical-thinking";

        const scored = candidates.map(strategy => {
            let score = 0;
            let rationale = "Selected based on base heuristics.";

            if (strategy.compatibleCompetencyGoals.includes(targetCompetency)) {
                score += 10;
                rationale = `Strongly aligns with target competency: ${targetCompetency}.`;
            } else {
                score += 5;
                rationale = "General alignment with learner profile.";
            }

            return { strategy, score, rationale };
        });

        // Sort by highest score
        return scored.sort((a, b) => b.score - a.score);
    }
}

// In the future, LLMStrategyEvaluator can implement the same interface
export const teachingStrategyEvaluator = new DeterministicStrategyEvaluator();
