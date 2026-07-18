import { educationalWorkflowRegistry } from '../../ekos/workflow/EducationalWorkflowRegistry';
import { learningActivityRegistry } from '../../ekos/activity/LearningActivityRegistry';
import { teachingStrategyRegistry } from './TeachingStrategyRegistry';
import { ScoredStrategy } from './TeachingStrategyEvaluator';

export interface TeachingRecipeStep {
    strategyId: string;
    purpose: string;
    activities: string[];
    expectedOutcome: string;
    successCriteria: string;
    checkpointRequired: boolean;
}

export interface AdaptiveBranch {
    triggerCondition: string;
    strategyId: string;
    activities: string[];
}

export interface CheckpointAction {
    checkpointId: string;
    remediation: AdaptiveBranch;
    enrichment: AdaptiveBranch;
}

export interface TeachingRecipe {
    blueprintWorkflowId: string;
    sequence: TeachingRecipeStep[];
    adaptiveCheckpoints: CheckpointAction[];
}

export class TeachingRecipePlanner {
    
    async buildRecipe(rankedStrategies: ScoredStrategy[], workflowId: string): Promise<TeachingRecipe> {
        // 1. Fetch the blueprint workflow
        const workflow = await educationalWorkflowRegistry.getWorkflow(workflowId);
        if (!workflow) {
            throw new Error("Invalid workflow ID passed to TeachingRecipePlanner.");
        }

        const topStrategy = rankedStrategies[0].strategy;
        const alternativeStrategy = rankedStrategies.length > 1 ? rankedStrategies[1].strategy : topStrategy;

        // 2. Customize the workflow into a Teaching Recipe
        // In a fully dynamic implementation, this would match each workflow activity 
        // to a strategy that best supports it. For this demonstration, we build a structured 
        // sequence based on the workflow's ordered activities.
        
        const sequence: TeachingRecipeStep[] = workflow.orderedLearningActivities.map((activityId, index) => {
            const isLast = index === workflow.orderedLearningActivities.length - 1;
            return {
                strategyId: topStrategy.id,
                purpose: `Fulfill workflow step ${index + 1}`,
                activities: [activityId],
                expectedOutcome: `Successfully complete activity ${activityId}`,
                successCriteria: `Demonstrates understanding via evidence mapped to ${activityId}`,
                checkpointRequired: isLast // Automatically require a checkpoint at the end of the sequence
            };
        });

        // 3. Build Adaptive Branches (Remediation & Enrichment)
        const adaptiveCheckpoints: CheckpointAction[] = [];
        
        sequence.filter(step => step.checkpointRequired).forEach((step, index) => {
            adaptiveCheckpoints.push({
                checkpointId: `chk-${index}`,
                remediation: {
                    triggerCondition: "Learner scores below mastery threshold",
                    strategyId: "strategy-direct-instruction", // Fall back to simpler direct instruction
                    activities: ["activity-reading", "activity-practicing"]
                },
                enrichment: {
                    triggerCondition: "Learner exceeds expectations rapidly",
                    strategyId: alternativeStrategy.id, // Introduce advanced strategy
                    activities: ["activity-reflecting", "activity-project-work"]
                }
            });
        });

        return {
            blueprintWorkflowId: workflow.id,
            sequence,
            adaptiveCheckpoints
        };
    }
}

export const teachingRecipePlanner = new TeachingRecipePlanner();
