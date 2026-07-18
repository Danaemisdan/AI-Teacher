export interface ContentBlueprint {
    educationalObjective: string;
    targetAudience: string;
    explanationDepth: "Level 1" | "Level 2" | "Level 3" | "Level 4";
    teachingPurpose: string;
    requiredConcepts: string[];
    conceptsToAvoid: string[];
    expectedLearningEvidence: string;
    desiredOutputFormat: string;
    maximumLengthWords: number;
    competencyTargets: string[];
}

export interface GeneratedContentPiece {
    type: "Explanation" | "Analogy" | "Example" | "CounterExample" | "Misconception" | "ReflectionPrompt" | "LearnerPrompt" | "Summary" | "Notes" | "MiniChallenge";
    content: string;
    metadata: Record<string, any>;
}

export interface StepContent {
    blueprint: ContentBlueprint;
    generatedPieces: GeneratedContentPiece[];
}

export interface LessonContent {
    lessonOverview: string;
    steps: StepContent[];
    lessonSummary: string;
    revisionNotes: string;
    keyTakeaways: string[];
    suggestedVisualAssets: string[];
}

export interface TeachingReflection {
    anchorStrategy: string;
    teachingRecipeEffectiveness: number;
    learnerProgression: string;
    checkpointOutcomes: any[];
    remediationCount: number;
    enrichmentCount: number;
    lessonCompletionTimeMs: number;
    learnerConfidenceProgression: number[];
    difficultConceptsEncountered: string[];
    recommendedImprovements: string[];
    confidenceScore: number; // confidence in the generated content
}
