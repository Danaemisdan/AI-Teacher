import { TimelineEvent, LessonGraphRepresentation } from './types';

export class TimelineCompiler {
    /**
     * Flattens the Directed Acyclic Graph (DAG) into a deterministic linear execution timeline.
     * Uses Topological Sorting (Kahn's Algorithm) combined with priority weights 
     * to guarantee a consistent execution order for non-blocking background tasks.
     */
    static compile(graph: LessonGraphRepresentation): TimelineEvent[] {
        const timeline: TimelineEvent[] = [];
        const inDegree = new Map<string, number>();
        const adjacencyList = new Map<string, string[]>();

        // Initialize structures
        graph.nodes.forEach(node => {
            inDegree.set(node.id, node.dependencies.length);
            if (!adjacencyList.has(node.id)) {
                adjacencyList.set(node.id, []);
            }
        });

        // Build adjacency list (forward edges)
        graph.nodes.forEach(node => {
            node.dependencies.forEach(dep => {
                const edges = adjacencyList.get(dep) || [];
                edges.push(node.id);
                adjacencyList.set(dep, edges);
            });
        });

        // Priority Queue for topological sort (simulated with a sorted array)
        // We sort by priority (descending) so higher priority events are queued first.
        let queue = graph.entryPoints.map(id => graph.nodes.find(n => n.id === id)!);
        
        while (queue.length > 0) {
            // Sort queue to resolve ties deterministically (Priority Desc, then ID Asc for stability)
            queue.sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority;
                return a.id.localeCompare(b.id);
            });

            const current = queue.shift()!;
            timeline.push(current);

            const neighbors = adjacencyList.get(current.id) || [];
            for (const neighborId of neighbors) {
                const currentInDegree = inDegree.get(neighborId)! - 1;
                inDegree.set(neighborId, currentInDegree);

                if (currentInDegree === 0) {
                    const neighborNode = graph.nodes.find(n => n.id === neighborId)!;
                    queue.push(neighborNode);
                }
            }
        }

        if (timeline.length !== graph.nodes.length) {
            throw new Error("Compilation Error: Could not compile all events. Cycle detected or disconnected graph.");
        }

        return timeline;
    }
}
