import { IEducationalAgent, EducationalAgentMetadata } from '../../ekos/agents/EducationalAgentRegistry';
import { TaskContext } from '../../ekos/agents/TaskContext';
import { teachingStrategyResolver } from './TeachingStrategyResolver';
import { teachingStrategyEvaluator } from './TeachingStrategyEvaluator';
import { teachingRecipePlanner, TeachingRecipe } from './TeachingRecipePlanner';

export interface TeachingPlan {
    lessonObjective: string;
    prerequisiteReview: string;
    teachingRecipe: TeachingRecipe;
    expectedLearningOutcomes: string[];
    visualizationRecommendations?: string[];
    competencyTargets: string[];
}

export interface TeachingDecision {
    teachingPlan: TeachingPlan;
    rationale: string;
    confidenceScore: number;
    alternativeStrategies: string[];
    expectedLearningOutcomes: string[];
    selectedStrategy?: string;
}

export class TeachingAgent implements IEducationalAgent {
    
    getMetadata(): EducationalAgentMetadata {
        return {
            id: "agent-teaching-core",
            name: "Core Teaching Agent",
            version: "2.0.0",
            capabilities: ["capability:educational-planning"],
            supportedInputs: ["TaskContext"],
            supportedOutputs: ["TeachingDecision"],
            dependencies: [],
            latencyMetadata: "low",
            executionPriority: 100 // High priority
        };
    }

    async execute(context: Readonly<TaskContext>): Promise<Partial<TaskContext>> {
        console.log("[TeachingAgent] Analyzing Task Context...");

        // 1. Resolve candidates deterministically
        const candidates = await teachingStrategyResolver.resolveCandidates(context);

        // 2. Evaluate candidates (Deterministic for now)
        const scored = await teachingStrategyEvaluator.evaluate(candidates, context);
        if (scored.length === 0) {
            throw new Error("No teaching strategies resolved for this context.");
        }

        const topPick = scored[0];
        const alternativeStrategies = scored.slice(1).map(s => s.strategy.id);

        // 3. Select Blueprint Workflow
        // In a real implementation, this is resolved via EducationalWorkflowRegistry metadata matching.
        // For this demonstration, we assume "workflow-inquiry-based" was selected.
        const selectedWorkflowId = "workflow-inquiry-based"; 

        // 4. Generate the structured Teaching Recipe using the planner
        const teachingRecipe = await teachingRecipePlanner.buildRecipe(scored, selectedWorkflowId);

        // 5. Construct the final Teaching Plan
        const teachingPlan: TeachingPlan = {
            lessonObjective: context.studentIntent || "Master current topic",
            prerequisiteReview: "Review prior knowledge based on curriculum graph",
            teachingRecipe,
            expectedLearningOutcomes: ["Concept Comprehension", "Applied Analysis"],
            competencyTargets: topPick.strategy.compatibleCompetencyGoals
        };

        const decision: TeachingDecision = {
            teachingPlan,
            rationale: `Recipe built using blueprint '${selectedWorkflowId}' and anchored on strategy '${topPick.strategy.name}'.`,
            confidenceScore: topPick.score,
            alternativeStrategies,
            expectedLearningOutcomes: teachingPlan.expectedLearningOutcomes
        };

        console.log(`[TeachingAgent] Generated Teaching Recipe based on ${topPick.strategy.name}`);

        // 6. Return modifications to the immutable TaskContext
        return {
            executionPlan: {
                ...context.executionPlan,
                teachingDecision: decision
            }
        };
    }
}

export const teachingAgent = new TeachingAgent();
