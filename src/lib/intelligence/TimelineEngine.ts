import { EducationalBlueprint, TimelineEvent, TimelineEventType, LessonGraphRepresentation } from './types';
import { LessonGraph } from './LessonGraph';
import { TimelineValidator } from './TimelineValidator';
import { TimelineCompiler } from './TimelineCompiler';

export class TimelineEngine {
    private static idCounter = 0;

    private static generateId(prefix: string): string {
        this.idCounter++;
        return `evt-${prefix}-${this.idCounter}-${Date.now().toString().slice(-4)}`;
    }

    private static createEvent(
        type: TimelineEventType, 
        isBlocking: boolean, 
        priority: number, 
        dependencies: string[], 
        payload: any = {},
        milestone?: string,
        checkpoint?: string
    ): TimelineEvent {
        return {
            id: this.generateId(type.toLowerCase().replace(/\s+/g, '-')),
            type,
            childEvents: [],
            dependencies,
            isBlocking,
            priority,
            estimatedDurationMs: 0, // Would be calculated based on payload size/type
            retryPolicy: isBlocking ? 'retry-3x' : 'none',
            failureStrategy: isBlocking ? 'abort' : 'skip',
            milestone,
            checkpoint,
            payload,
            metadata: {}
        };
    }

    /**
     * Converts a static EducationalBlueprint into an executable LessonGraph and compiled Timeline.
     */
    static build(blueprint: EducationalBlueprint): { graph: LessonGraphRepresentation, timeline: TimelineEvent[] } {
        const graph = new LessonGraph();
        let lastBlockingEventId = '';

        // 1. Initial Prep (Parallelizable)
        const planningEvt = this.createEvent('Planning', true, 100, [], { status: 'complete' });
        graph.addNode(planningEvt);
        lastBlockingEventId = planningEvt.id;

        const bgNotesPrep = this.createEvent('Notes Preparation', false, 10, [planningEvt.id], { template: blueprint.topicAnalysis.notesTemplate });
        const bgQuizPrep = this.createEvent('Quiz Preparation', false, 10, [planningEvt.id], { type: blueprint.topicAnalysis.quizType });
        const bgVisPrep = this.createEvent('Visualization Preparation', false, 50, [planningEvt.id], { engine: blueprint.visualizations[0] });
        
        graph.addNode(bgNotesPrep);
        graph.addNode(bgQuizPrep);
        graph.addNode(bgVisPrep);

        // 2. Iterate through pedagogical structure
        blueprint.lessonStructure.forEach((phase, index) => {
            const isFirst = index === 0;
            const phaseDeps = [lastBlockingEventId];

            if (phase.details.requiresVisualization) {
                // Ensure VisPrep is done before displaying
                const visReadyEvt = this.createEvent('Visualization Ready', true, 90, [...phaseDeps, bgVisPrep.id], {}, `Milestone: ${phase.name} Visualization Ready`, `Checkpoint: ${phase.name}`);
                graph.addNode(visReadyEvt);
                
                const visDispEvt = this.createEvent('Visualization Display', true, 90, [visReadyEvt.id], { engine: blueprint.visualizations[0], phase: phase.name });
                graph.addNode(visDispEvt);
                
                lastBlockingEventId = visDispEvt.id;
            }

            if (phase.details.requiresSpeech) {
                const speechType = isFirst ? 'Introduction' : 'Speech Begin';
                const speechEvt = this.createEvent(speechType, true, 80, [lastBlockingEventId], { phase: phase.name }, isFirst ? 'Milestone: Lesson Started' : undefined);
                graph.addNode(speechEvt);
                
                // If it requires interaction during speech
                if (phase.details.requiresInteraction) {
                    const highlightEvt = this.createEvent('Highlight Begin', false, 70, [speechEvt.id], { target: phase.name });
                    graph.addNode(highlightEvt);
                }

                const speechEndEvt = this.createEvent('Speech End', true, 80, [speechEvt.id], {});
                graph.addNode(speechEndEvt);
                lastBlockingEventId = speechEndEvt.id;
            }

            if (phase.phaseType === 'summary') {
                const summaryEvt = this.createEvent('Summary', true, 80, [lastBlockingEventId], {}, 'Milestone: Explanation Complete', 'Checkpoint: Summary Finished');
                graph.addNode(summaryEvt);
                lastBlockingEventId = summaryEvt.id;
            }
        });

        // 3. Append Notes and Quiz
        const notesEvt = this.createEvent('Notes Display', true, 80, [lastBlockingEventId, bgNotesPrep.id], {}, 'Milestone: Notes Complete', 'Checkpoint: Notes Displayed');
        graph.addNode(notesEvt);
        lastBlockingEventId = notesEvt.id;

        const quizEvt = this.createEvent('Quiz Display', true, 80, [lastBlockingEventId, bgQuizPrep.id], {}, 'Milestone: Quiz Complete', 'Checkpoint: Quiz Started');
        graph.addNode(quizEvt);
        lastBlockingEventId = quizEvt.id;

        // 4. Completion
        const completionEvt = this.createEvent('Completion', true, 100, [lastBlockingEventId], {}, 'Milestone: Lesson Finished');
        graph.addNode(completionEvt);

        // Extract raw graph
        const rawGraph = graph.getRepresentation();

        // Validate pedagogical constraints
        TimelineValidator.validateGraph(rawGraph);

        // Compile to deterministic array
        const compiledTimeline = TimelineCompiler.compile(rawGraph);

        // Mutate the blueprint as requested (attaching to output)
        blueprint.lessonGraph = rawGraph;
        blueprint.compiledTimeline = compiledTimeline;

        return { graph: rawGraph, timeline: compiledTimeline };
    }
}
