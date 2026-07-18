export interface TaskContext {
    studentIntent: string | null;
    learningState: any | null;
    curriculumContext: any | null;
    competencyContext: any | null;
    learningActivities: any[];
    capabilityRequirements: string[];
    resourceSelections: any[];
    assessmentResults: any | null;
    recommendations: any[];
    executionPlan: any | null;
}

export class TaskContextManager {
    private context: TaskContext;

    constructor(initialContext?: Partial<TaskContext>) {
        this.context = {
            studentIntent: null,
            learningState: null,
            curriculumContext: null,
            competencyContext: null,
            learningActivities: [],
            capabilityRequirements: [],
            resourceSelections: [],
            assessmentResults: null,
            recommendations: [],
            executionPlan: null,
            ...initialContext
        };
    }

    get(): Readonly<TaskContext> {
        // Return an immutable snapshot to enforce that agents cannot mutate shared state directly
        return Object.freeze({ ...this.context });
    }

    update(mutations: Partial<TaskContext>): Readonly<TaskContext> {
        this.context = {
            ...this.context,
            ...mutations
        };
        return this.get();
    }
}
