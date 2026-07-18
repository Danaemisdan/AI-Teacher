import { TaskContext } from './TaskContext';
import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface EducationalAgentMetadata {
    id: string;
    name: string;
    version: string;
    capabilities: string[];
    supportedInputs: string[];
    supportedOutputs: string[];
    dependencies: string[];
    latencyMetadata: "low" | "medium" | "high";
    executionPriority: number;
}

export interface IEducationalAgent {
    getMetadata(): EducationalAgentMetadata;
    execute(context: Readonly<TaskContext>): Promise<Partial<TaskContext>>;
}

export class EducationalAgentRegistry {
    private agentInstances: Map<string, IEducationalAgent> = new Map();
    private metadataRepository: IRepository<EducationalAgentMetadata>;

    constructor(metadataRepo?: IRepository<EducationalAgentMetadata>) {
        this.metadataRepository = metadataRepo || new InMemoryRepository<EducationalAgentMetadata>();
    }

    async registerAgent(agent: IEducationalAgent): Promise<void> {
        const metadata = agent.getMetadata();
        await this.metadataRepository.save(metadata);
        this.agentInstances.set(metadata.id, agent);
    }

    async findAgentsByCapability(capability: string): Promise<IEducationalAgent[]> {
        const metadatas = await this.metadataRepository.find(m => m.capabilities.includes(capability));
        // Sort by priority descending
        metadatas.sort((a, b) => b.executionPriority - a.executionPriority);
        
        return metadatas
            .map(m => this.agentInstances.get(m.id))
            .filter((a): a is IEducationalAgent => a !== undefined);
    }
}

export const educationalAgentRegistry = new EducationalAgentRegistry();
