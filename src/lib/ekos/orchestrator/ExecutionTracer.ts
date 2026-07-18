import { ExecutionTrace, ExecutionTraceNode } from '../core/ITrace';

export class ExecutionTracer {
    private trace: ExecutionTrace;

    constructor(intent: string) {
        this.trace = {
            intent,
            knowledgeRequirements: [],
            teachingStrategy: "",
            capabilitiesRequested: [],
            candidateResources: [],
            rankingDecisions: [],
            selectedResources: [],
            lessonPlan: null,
            executionPlan: null,
            nodes: [],
            startTime: Date.now()
        };
    }

    logDecision(step: string, decision: string, reasoning: string, metadata?: any) {
        this.trace.nodes.push({
            step,
            decision,
            reasoning,
            metadata,
            timestamp: Date.now()
        });
    }

    setCapabilitiesRequested(caps: string[]) {
        this.trace.capabilitiesRequested = caps;
    }

    setSelectedResources(resources: string[]) {
        this.trace.selectedResources = resources;
    }

    setExecutionPlan(plan: any) {
        this.trace.executionPlan = plan;
    }

    finish() {
        this.trace.endTime = Date.now();
        console.log("=== EKOS EXECUTION TRACE ===");
        console.log(JSON.stringify(this.trace, null, 2));
    }
}
