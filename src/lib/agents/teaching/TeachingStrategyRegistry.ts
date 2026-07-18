import { IRepository } from '../../ekos/core/IRepository';
import { InMemoryRepository } from '../../ekos/repositories/InMemoryRepository';

export interface TeachingStrategyMetadata {
    id: string;
    name: string;
    description: string;
    optimalLearnerLevels: string[];
    compatibleCompetencyGoals: string[];
    compatibleComplexity: string[];
    requiresVisualization: boolean;
    requiresSimulation: boolean;
    orderedWorkflowSteps: string[];
}

const seedStrategies: TeachingStrategyMetadata[] = [
    {
        id: "strategy-direct-instruction",
        name: "Direct Instruction",
        description: "Clear, structured, teacher-directed instruction for foundational knowledge.",
        optimalLearnerLevels: ["Novice", "Beginner"],
        compatibleCompetencyGoals: ["Memorization", "Basic Comprehension"],
        compatibleComplexity: ["Low", "Medium"],
        requiresVisualization: false,
        requiresSimulation: false,
        orderedWorkflowSteps: ["Introduction", "Definition", "Example", "Assessment"]
    },
    {
        id: "strategy-socratic",
        name: "Socratic Teaching",
        description: "Dialogue-driven teaching that stimulates critical thinking through questions.",
        optimalLearnerLevels: ["Intermediate", "Advanced"],
        compatibleCompetencyGoals: ["comp-critical-thinking", "comp-scientific-reasoning"],
        compatibleComplexity: ["Medium", "High"],
        requiresVisualization: false,
        requiresSimulation: false,
        orderedWorkflowSteps: ["Provocation", "Questioning", "Reflection", "Synthesis"]
    },
    {
        id: "strategy-simulation-first",
        name: "Simulation-First Learning",
        description: "Starts with an interactive simulation to build intuition before formal theory.",
        optimalLearnerLevels: ["Beginner", "Intermediate", "Advanced"],
        compatibleCompetencyGoals: ["comp-problem-solving", "comp-scientific-reasoning"],
        compatibleComplexity: ["High"],
        requiresVisualization: true,
        requiresSimulation: true,
        orderedWorkflowSteps: ["Exploration", "Hypothesis", "Formal Theory", "Application"]
    }
];

export class TeachingStrategyRegistry {
    private repository: IRepository<TeachingStrategyMetadata>;

    constructor(repository?: IRepository<TeachingStrategyMetadata>) {
        this.repository = repository || new InMemoryRepository<TeachingStrategyMetadata>(seedStrategies);
    }

    async getAllStrategies(): Promise<TeachingStrategyMetadata[]> {
        return this.repository.findAll();
    }
    
    async getStrategy(id: string): Promise<TeachingStrategyMetadata | null> {
        return this.repository.findById(id);
    }
}

export const teachingStrategyRegistry = new TeachingStrategyRegistry();
