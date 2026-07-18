import { teachingStrategyRegistry, TeachingStrategyMetadata } from './TeachingStrategyRegistry';
import { TaskContext } from '../../ekos/agents/TaskContext';

export class TeachingStrategyResolver {
    
    /**
     * Deterministically filters candidate teaching strategies based on the current context.
     */
    async resolveCandidates(context: Readonly<TaskContext>): Promise<TeachingStrategyMetadata[]> {
        const allStrategies = await teachingStrategyRegistry.getAllStrategies();
        
        // Extract heuristics from context
        // (Assuming these are passed via context in a real implementation)
        const learnerLevel = context.learningState?.learnerLevel || "Intermediate";
        const targetCompetency = context.competencyContext?.targetCompetency || "comp-critical-thinking";
        const complexity = context.curriculumContext?.conceptComplexity || "Medium";
        const visualizationAvailable = context.capabilityRequirements?.includes("needs_visualization") || false;
        const simulationAvailable = context.capabilityRequirements?.includes("needs_simulation") || false;

        // Filter out incompatible strategies
        const candidates = allStrategies.filter(strategy => {
            if (!strategy.optimalLearnerLevels.includes(learnerLevel)) return false;
            
            // If the strategy requires a simulation but none is available/requested, it's invalid
            if (strategy.requiresSimulation && !simulationAvailable) return false;
            
            // If the strategy requires visualization but none is available, it's invalid
            if (strategy.requiresVisualization && !visualizationAvailable) return false;

            return true;
        });

        return candidates;
    }
}

export const teachingStrategyResolver = new TeachingStrategyResolver();
