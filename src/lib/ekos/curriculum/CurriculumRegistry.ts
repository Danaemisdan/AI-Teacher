import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface CurriculumNode {
    id: string;
    type: "Course" | "Module" | "Chapter" | "Lesson" | "Concept" | "Objective" | "Assessment";
    title: string;
    description: string;
    metadata: Record<string, any>;
}

export interface CurriculumEdge {
    id: string;
    sourceId: string;
    targetId: string;
    relationType: "prerequisite" | "contains" | "requires" | "depends_on" | "extends" | "reinforces" | "assesses" | "revises" | "recommended_after";
}

export class CurriculumRegistry {
    private nodeRepository: IRepository<CurriculumNode>;
    private edgeRepository: IRepository<CurriculumEdge>;

    constructor(nodeRepo?: IRepository<CurriculumNode>, edgeRepo?: IRepository<CurriculumEdge>) {
        this.nodeRepository = nodeRepo || new InMemoryRepository<CurriculumNode>();
        this.edgeRepository = edgeRepo || new InMemoryRepository<CurriculumEdge>();
    }

    async getPrerequisites(nodeId: string): Promise<CurriculumNode[]> {
        const edges = await this.edgeRepository.find(e => e.targetId === nodeId && e.relationType === "prerequisite");
        const nodes: CurriculumNode[] = [];
        for (const edge of edges) {
            const node = await this.nodeRepository.findById(edge.sourceId);
            if (node) nodes.push(node);
        }
        return nodes;
    }
}

export const curriculumRegistry = new CurriculumRegistry();
