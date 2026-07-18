import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface LearningActivity {
    id: string;
    name: string;
    description: string;
    requiredCapabilities: string[];
    supportedLearnerLevels: string[];
    prerequisites: string[];
    estimatedDurationMinutes: number;
    expectedOutcomes: string[];
    compatibleEducationalResources: string[];
    assessmentRecommendations: string[];
}

export class LearningActivityRegistry {
    private repository: IRepository<LearningActivity>;

    constructor(repository?: IRepository<LearningActivity>) {
        this.repository = repository || new InMemoryRepository<LearningActivity>([
            {
                id: "activity-simulating",
                name: "Simulating",
                description: "Interacting with a dynamic model to observe outcomes.",
                requiredCapabilities: ["needs_simulation"],
                supportedLearnerLevels: ["Intermediate", "Advanced"],
                prerequisites: ["Basic Concept Understanding"],
                estimatedDurationMinutes: 15,
                expectedOutcomes: ["Scientific Observation", "Systems Thinking"],
                compatibleEducationalResources: ["res-simulation-engine"],
                assessmentRecommendations: ["Observe and report changes in variables"]
            }
        ]);
    }

    async getActivity(id: string): Promise<LearningActivity | null> {
        return this.repository.findById(id);
    }
    
    async getAllActivities(): Promise<LearningActivity[]> {
        return this.repository.findAll();
    }
}

export const learningActivityRegistry = new LearningActivityRegistry();
