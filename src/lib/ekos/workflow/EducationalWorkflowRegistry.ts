import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface EducationalWorkflow {
    id: string;
    name: string;
    description: string;
    orderedLearningActivities: string[];
    requiredCompetencies: string[];
    recommendedTeachingStrategies: string[];
    assessmentCheckpoints: string[];
    completionCriteria: string;
}

export class EducationalWorkflowRegistry {
    private repository: IRepository<EducationalWorkflow>;

    constructor(repository?: IRepository<EducationalWorkflow>) {
        this.repository = repository || new InMemoryRepository<EducationalWorkflow>([
            {
                id: "workflow-inquiry-based",
                name: "Inquiry-Based Learning",
                description: "Encourages students to discover answers through exploration.",
                orderedLearningActivities: ["activity-exploring", "activity-simulating", "activity-reflecting"],
                requiredCompetencies: ["comp-critical-thinking", "comp-problem-solving"],
                recommendedTeachingStrategies: ["Socratic Questioning"],
                assessmentCheckpoints: ["After Simulation"],
                completionCriteria: "Student accurately reflects on observed simulation results."
            }
        ]);
    }

    async getWorkflow(id: string): Promise<EducationalWorkflow | null> {
        return this.repository.findById(id);
    }
}

export const educationalWorkflowRegistry = new EducationalWorkflowRegistry();
