export interface ExecutionTraceNode {
    step: string;
    decision: string;
    reasoning: string;
    metadata?: any;
    timestamp: number;
}

export interface ExecutionTrace {
    intent: string;
    knowledgeRequirements: any[];
    teachingStrategy: string;
    capabilitiesRequested: string[];
    candidateResources: string[];
    rankingDecisions: any[];
    selectedResources: string[];
    lessonPlan: any;
    executionPlan: any;
    nodes: ExecutionTraceNode[];
    startTime: number;
    endTime?: number;
}
