import { TimelineEvent, LessonGraphRepresentation } from './types';

export class TimelineValidator {
    /**
     * Validates the generated Lesson Graph for structural and pedagogical integrity.
     */
    static validateGraph(graph: LessonGraphRepresentation): void {
        const nodeMap = new Map<string, TimelineEvent>();
        graph.nodes.forEach(n => nodeMap.set(n.id, n));

        // 1. Dependency Integrity & Orphan checks
        graph.nodes.forEach(node => {
            node.dependencies.forEach(depId => {
                if (!nodeMap.has(depId)) {
                    throw new Error(`Validation Error: Event '${node.id}' depends on missing event '${depId}'`);
                }
            });

            // Orphan check: if it's not an entry point and has no dependencies, it's floating (unless specifically designed that way, but for our DAG, everything should link back to root or start).
            if (node.dependencies.length === 0 && !graph.entryPoints.includes(node.id)) {
                 throw new Error(`Validation Error: Orphaned event detected '${node.id}'`);
            }
        });

        // 2. Circular Dependency Detection (DFS)
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detectCycle = (nodeId: string) => {
            if (recursionStack.has(nodeId)) {
                throw new Error(`Validation Error: Circular dependency detected at event '${nodeId}'`);
            }
            if (visited.has(nodeId)) return;

            visited.add(nodeId);
            recursionStack.add(nodeId);

            // Find all nodes that depend on this node
            const children = graph.nodes.filter(n => n.dependencies.includes(nodeId));
            children.forEach(child => detectCycle(child.id));

            recursionStack.delete(nodeId);
        };

        graph.entryPoints.forEach(ep => detectCycle(ep));

        // 3. Pedagogical Ordering & Presence
        const types = graph.nodes.map(n => n.type);
        
        const hasSummary = types.includes('Summary');
        const hasCompletion = types.includes('Completion');
        
        if (!hasSummary) throw new Error("Validation Error: Every lesson must contain a Summary event.");
        if (!hasCompletion) throw new Error("Validation Error: Every lesson must contain a Completion event.");

        // Check relative ordering
        const getIndex = (type: string) => graph.nodes.findIndex(n => n.type === type);
        
        const summaryIdx = getIndex('Summary');
        const notesIdx = getIndex('Notes Display');
        const quizIdx = getIndex('Quiz Display');
        const completionIdx = getIndex('Completion');

        if (notesIdx !== -1 && summaryIdx > notesIdx) {
            throw new Error("Validation Error: Summary must occur before Notes.");
        }
        if (quizIdx !== -1 && notesIdx !== -1 && notesIdx > quizIdx) {
             throw new Error("Validation Error: Notes must occur before Quiz.");
        }

        // Completion must be last topologically (it should not have any dependents)
        const completionNode = graph.nodes.find(n => n.type === 'Completion');
        if (completionNode) {
            const hasDependents = graph.nodes.some(n => n.dependencies.includes(completionNode.id));
            if (hasDependents) {
                throw new Error("Validation Error: Completion event cannot have dependent events.");
            }
        }
    }
}
