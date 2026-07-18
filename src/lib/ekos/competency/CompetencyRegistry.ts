import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface CompetencyNode {
    id: string;
    name: string;
    description: string;
    proficiencyLevels: string[];
    prerequisiteCompetencies: string[];
    relatedCompetencies: string[];
    assessmentIndicators: string[];
    observableEvidence: string[];
    masteryCriteria: string;
}

export class CompetencyRegistry {
    private repository: IRepository<CompetencyNode>;

    constructor(repository?: IRepository<CompetencyNode>) {
        this.repository = repository || new InMemoryRepository<CompetencyNode>([
            {
                id: "comp-critical-thinking",
                name: "Critical Thinking",
                description: "Ability to analyze facts to form a judgment.",
                proficiencyLevels: ["Novice", "Intermediate", "Advanced", "Master"],
                prerequisiteCompetencies: [],
                relatedCompetencies: ["comp-problem-solving", "comp-scientific-reasoning"],
                assessmentIndicators: ["Identifies biases", "Evaluates evidence"],
                observableEvidence: ["Constructs valid arguments in essays"],
                masteryCriteria: "Consistently evaluates multiple perspectives before concluding."
            }
        ]);
    }

    async getCompetency(id: string): Promise<CompetencyNode | null> {
        return this.repository.findById(id);
    }

    async getAllCompetencies(): Promise<CompetencyNode[]> {
        return this.repository.findAll();
    }
}

export const competencyRegistry = new CompetencyRegistry();
