import { EducationalBlueprint, TimelineEvent, LessonGraphRepresentation } from './types';

export class LessonGraph {
    private nodes: Map<string, TimelineEvent> = new Map();

    public addNode(event: TimelineEvent) {
        this.nodes.set(event.id, event);
    }

    public getNode(id: string): TimelineEvent | undefined {
        return this.nodes.get(id);
    }

    public getRepresentation(): LessonGraphRepresentation {
        const entryPoints = Array.from(this.nodes.values())
            .filter(node => node.dependencies.length === 0)
            .map(node => node.id);

        return {
            nodes: Array.from(this.nodes.values()),
            entryPoints
        };
    }

    /**
     * Helper to link two nodes (creates dependency)
     */
    public link(fromId: string, toId: string) {
        const toNode = this.nodes.get(toId);
        if (toNode && !toNode.dependencies.includes(fromId)) {
            toNode.dependencies.push(fromId);
        }
    }
}
