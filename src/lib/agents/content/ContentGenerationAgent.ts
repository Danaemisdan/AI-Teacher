import { IEducationalAgent, EducationalAgentMetadata } from '../../ekos/agents/EducationalAgentRegistry';
import { TaskContext } from '../../ekos/agents/TaskContext';
import { eventBus } from '../../ekos/core/EventBus';
import { TeachingDecision, TeachingPlan } from '../teaching/TeachingAgent';
import { TeachingRecipeStep } from '../teaching/TeachingRecipePlanner';
import { 
    ContentBlueprint, 
    LessonContent, 
    StepContent, 
    TeachingReflection 
} from './ContentSchemas';
import { IContentProvider, MockContentProvider } from './IContentProvider';
import { contentValidator } from './ContentValidator';

export class ContentGenerationAgent implements IEducationalAgent {
    private contentProvider: IContentProvider;

    constructor(provider?: IContentProvider) {
        // By default use Mock. Real implementations will inject an LLM provider here.
        this.contentProvider = provider || new MockContentProvider();
    }

    getMetadata(): EducationalAgentMetadata {
        return {
            id: "agent-content-generator",
            name: "Content Generation Agent",
            version: "1.0.0",
            capabilities: ["capability:content-generation"],
            supportedInputs: ["TaskContext"],
            supportedOutputs: ["LessonContent"],
            dependencies: ["agent-teaching-core"],
            latencyMetadata: "medium", // LLM generation can take some time
            executionPriority: 90
        };
    }

    async execute(context: Readonly<TaskContext>): Promise<Partial<TaskContext>> {
        console.log("[ContentGenerationAgent] Beginning content orchestration...");

        const decision = context.executionPlan?.teachingDecision as TeachingDecision;
        if (!decision || !decision.teachingPlan) {
            throw new Error("ContentGenerationAgent requires a valid TeachingDecision in the TaskContext.");
        }

        const teachingPlan = decision.teachingPlan;
        const recipe = teachingPlan.teachingRecipe;
        const learnerLevel = context.learningState?.learnerLevel || "Beginner";

        const lessonContent: LessonContent = {
            lessonOverview: teachingPlan.lessonObjective,
            steps: [],
            lessonSummary: "Summary of the lesson based on generated steps.",
            revisionNotes: "Key points to remember for exams.",
            keyTakeaways: teachingPlan.expectedLearningOutcomes,
            suggestedVisualAssets: teachingPlan.visualizationRecommendations || []
        };

        // 1. Author Content for Each Step
        for (const step of recipe.sequence) {
            const blueprint = this.createBlueprint(step, teachingPlan, learnerLevel);
            
            // 2. Delegate to interchangeable Content Provider
            const generatedPieces = await this.contentProvider.generateContent(blueprint);

            // 3. Validate generated content
            const isValid = contentValidator.validate(blueprint, generatedPieces);
            if (!isValid) {
                console.error(`[ContentGenerationAgent] Validation failed for step targeting ${step.purpose}.`);
                // Implementation note: could trigger a retry loop here.
            }

            lessonContent.steps.push({
                blueprint,
                generatedPieces
            });
        }

        // 4. Generate Post-Lesson Reflection & Publish Event
        const reflection = this.generateReflection(decision, lessonContent);
        eventBus.publish("EKOS:TeachingReflectionGenerated", reflection);

        // 5. Update Task Context
        return {
            executionPlan: {
                ...context.executionPlan,
                lessonContent
            }
        };
    }

    private createBlueprint(step: TeachingRecipeStep, plan: TeachingPlan, learnerLevel: string): ContentBlueprint {
        // Map learner level to explanation depth
        const depthMap: Record<string, any> = {
            "Novice": "Level 1",
            "Beginner": "Level 2",
            "Intermediate": "Level 3",
            "Advanced": "Level 4"
        };

        return {
            educationalObjective: step.expectedOutcome,
            targetAudience: learnerLevel,
            explanationDepth: depthMap[learnerLevel] || "Level 2",
            teachingPurpose: step.purpose,
            requiredConcepts: plan.competencyTargets, // In reality, this would be specific domain topics
            conceptsToAvoid: [],
            expectedLearningEvidence: step.successCriteria,
            desiredOutputFormat: "Markdown",
            maximumLengthWords: 500,
            competencyTargets: plan.competencyTargets
        };
    }

    private generateReflection(decision: TeachingDecision, content: LessonContent): TeachingReflection {
        return {
            anchorStrategy: decision.selectedStrategy || "default",
            teachingRecipeEffectiveness: 0.9, // This would be evaluated post-lesson
            learnerProgression: "Positive",
            checkpointOutcomes: [],
            remediationCount: 0,
            enrichmentCount: 0,
            lessonCompletionTimeMs: 0, // Recorded at end of actual runtime
            learnerConfidenceProgression: [],
            difficultConceptsEncountered: [],
            recommendedImprovements: ["Consider adding more visual examples."],
            confidenceScore: decision.confidenceScore
        };
    }
}

export const contentGenerationAgent = new ContentGenerationAgent();
