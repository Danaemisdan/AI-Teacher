import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface IPedagogicalPattern {
    id: string;
    name: string;
    description: string;
    flow: string[]; // Sequential steps of the pattern (e.g. ["Concept", "Example", "Practice"])
}

const seedPatterns: IPedagogicalPattern[] = [
    {
        id: "pattern-direct-instruction",
        name: "Direct Instruction",
        description: "Standard flow for introducing a new topic.",
        flow: ["Hook", "Concept", "Example", "Practice", "Summary"]
    },
    {
        id: "pattern-inquiry-based",
        name: "Inquiry Based Learning",
        description: "Encourages students to explore and discover.",
        flow: ["Observe", "Hypothesize", "Experiment", "Analyze", "Conclude"]
    },
    {
        id: "pattern-problem-based",
        name: "Problem Based Learning",
        description: "Starts with a problem, introduces theory to solve it.",
        flow: ["Problem", "Theory", "Solution", "Reflection"]
    }
];

export class PedagogicalPatternRegistry {
    private repository: IRepository<IPedagogicalPattern>;

    constructor(repository?: IRepository<IPedagogicalPattern>) {
        this.repository = repository || new InMemoryRepository<IPedagogicalPattern>(seedPatterns);
    }

    async getPattern(id: string): Promise<IPedagogicalPattern | null> {
        return this.repository.findById(id);
    }

    async getAllPatterns(): Promise<IPedagogicalPattern[]> {
        return this.repository.findAll();
    }
}

export const pedagogicalPatternRegistry = new PedagogicalPatternRegistry();
