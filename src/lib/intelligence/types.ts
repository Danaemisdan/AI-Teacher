export type SubjectType = 
    | 'Mathematics'
    | 'Physics'
    | 'Chemistry'
    | 'Biology'
    | 'Anatomy'
    | 'Astronomy'
    | 'Programming'
    | 'Computer Science'
    | 'Networking'
    | 'History'
    | 'Geography'
    | 'Civics'
    | 'Economics'
    | 'Finance'
    | 'Business'
    | 'Architecture'
    | 'AI/Machine Learning'
    | 'General';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type EducationLevel = 'Elementary' | 'Middle School' | 'High School' | 'College' | 'Professional';
export type QuizType = 'multiple_choice' | 'graph' | 'coding' | 'diagram' | 'none';

export interface ConfidenceScores {
    subject: number;
    visualization: number;
    teachingStrategy: number;
    quiz: number;
    notes: number;
    overall: number;
}

export interface DecisionReasons {
    visualization: string;
    teachingStrategy: string;
}

export interface TopicAnalysis {
    subject: SubjectType;
    topic: string;
    subtopic: string;
    difficulty: DifficultyLevel;
    educationLevel: EducationLevel;
    visualization: string;
    notesTemplate: string;
    quizType: QuizType;
    teachingStrategy: string;
    confidenceScores: ConfidenceScores;
    decisionReasons: DecisionReasons;
}

export type LessonPhaseType = 
    | 'intro'
    | 'concept'
    | 'formula'
    | 'equation'
    | 'graph'
    | 'visual'
    | 'interactive'
    | 'practice'
    | 'quiz'
    | 'summary'
    | 'challenge'
    | 'timeline'
    | 'map'
    | 'events'
    | 'causes'
    | 'effects'
    | 'real_world_example'
    | 'structure'
    | 'function'
    | 'clinical_relevance'
    | 'orbital_explanation'
    | 'packet_flow'
    | 'protocol_explanation';

export interface LessonPhase {
    name: string;
    type: LessonPhaseType;
}

export interface TeachingStrategy {
    strategyId: string;
    phases: LessonPhase[];
}

export interface LessonPlanNode {
    id: string;
    phaseType: LessonPhaseType;
    name: string;
    details: {
        requiresVisualization?: boolean;
        requiresInteraction?: boolean;
        requiresSpeech?: boolean;
    };
    timelineEvents?: any[];
    speechSegments?: any[];
    diagramStatus?: string;
    renderingStatus?: string;
    highlightEvents?: any[];
    audioSynchronization?: any;
}

export interface PlanningMetrics {
    knowledgeRetrievalTimeMs: number;
    topicAnalysisTimeMs: number;
    registryLookupTimeMs: number;
    lessonPlanningTimeMs: number;
    validationTimeMs: number;
    totalPlanningTimeMs: number;
}

export interface ValidationResult {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
}

export interface ContentPreview {
    notesPreview: string;
    quizExample: string;
}

// ----- CAPABILITY HEALTH TYPES ----- //

export type CapabilityCategory = 'Core' | 'Teaching' | 'Visualization' | 'Presentation';
export type CapabilityStatus = 'READY' | 'PARTIAL' | 'NOT_AVAILABLE';

export interface CapabilityFeatures {
    supportsInteraction?: boolean;
    supportsHighlighting?: boolean;
    supportsDisposal?: boolean;
    supportsCaching?: boolean;
    supportsAnimation?: boolean;
    supportsAssetLoading?: boolean;
    supportsAudioSync?: boolean;
}

export interface ICapability {
    id: string;
    name: string;
    category: CapabilityCategory;
    status: CapabilityStatus;
    healthScore: number;
    features: CapabilityFeatures;
    fallbacks: string[];
    reason?: string;
}

export interface CapabilityHierarchy {
    Core: ICapability[];
    Teaching: ICapability[];
    Visualization: ICapability[];
    Presentation: ICapability[];
}

export interface SystemReadinessReport {
    hierarchy: CapabilityHierarchy;
    scores: {
        core: number;
        teaching: number;
        visualization: number;
        presentation: number;
        overall: number;
    };
    isExecutionReady: boolean;
}

// ----- TIMELINE ENGINE TYPES ----- //

export type TimelineEventType = 
    | 'Knowledge Retrieval'
    | 'Topic Analysis'
    | 'Planning'
    | 'Introduction'
    | 'Visualization Preparation'
    | 'Visualization Ready'
    | 'Visualization Display'
    | 'Highlight Begin'
    | 'Highlight End'
    | 'Speech Begin'
    | 'Speech End'
    | 'Pause'
    | 'Interaction'
    | 'Assessment Preparation'
    | 'Notes Preparation'
    | 'Notes Display'
    | 'Quiz Preparation'
    | 'Quiz Display'
    | 'Summary'
    | 'Review'
    | 'Completion';

export type RetryPolicyType = 'none' | 'retry-1x' | 'retry-3x' | 'infinite';
export type FailureStrategyType = 'skip' | 'abort' | 'fallback';

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    parentEvent?: string; // ID of the parent event (if hierarchical)
    childEvents: string[]; // IDs of child events
    dependencies: string[]; // IDs of events that MUST complete before this starts
    isBlocking: boolean;
    priority: number; // 0 = lowest, 100 = highest
    estimatedDurationMs: number;
    retryPolicy: RetryPolicyType;
    failureStrategy: FailureStrategyType;
    milestone?: string; // Optional string if this event triggers a milestone
    checkpoint?: string; // Optional string if this event triggers a resumable checkpoint
    payload: any;
    metadata: Record<string, any>;
}

export interface LessonGraphRepresentation {
    nodes: TimelineEvent[];
    entryPoints: string[];
}

// ------------------------------------ //

export interface EducationalBlueprint {
    topicAnalysis: TopicAnalysis;
    strategy: TeachingStrategy;
    visualizations: string[];
    lessonStructure: LessonPlanNode[];
    metrics: PlanningMetrics;
    validation: ValidationResult;
    previews: ContentPreview;
    capabilityValidation?: {
        canExecute: boolean;
        missingCapabilities: string[];
        fallbackRoutes: string[];
        message: string;
    };
    // Added in Phase 4
    lessonGraph?: LessonGraphRepresentation;
    compiledTimeline?: TimelineEvent[];
}

// ----- LESSON PACKAGE TYPES ----- //
export interface NotesSection {
    id: string;
    timelineEventId: string;
    title: string;
    bulletPoints: string[];
    summary: string;
    keyFormulae: string[];
    definitions: Record<string, string>;
    importantFacts: string[];
    memoryTips: string[];
    diagramReferences: string[];
    highlightReferences: string[];
    difficulty: DifficultyLevel;
    estimatedReadingTime: number;
    metadata: Record<string, any>;
}

export interface NotesPlan {
    sections: NotesSection[];
}

export interface LessonPackage {
    blueprint: EducationalBlueprint;
    notesPlan: NotesPlan;
    // other plans like SpeechPlan, VisualizationPlan would go here eventually
}
