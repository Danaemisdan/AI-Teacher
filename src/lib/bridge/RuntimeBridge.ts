import { TopicAnalyzer } from '../intelligence/TopicAnalyzer';
import { LessonPlanner } from '../intelligence/LessonPlanner';
import { TimelineEngine } from '../intelligence/TimelineEngine';
import { LessonExecutionEngine } from '../execution/LessonExecutionEngine';
import { EventBus } from '../execution/EventBus';
import { VisualizationExecutor } from '../execution/executors/VisualizationExecutor';
import { AvatarExecutor } from '../execution/executors/AvatarExecutor';
import { NotesExecutor } from '../execution/executors/NotesExecutor';
import { NotesPlanner } from '../intelligence/NotesPlanner';

class FallbackExecutor {
    static initialize() {
        EventBus.subscribe('EventStarted', (payload) => {
            const evt = payload.timelineEvent;
            if (!evt) return;

            // These are handled by their real executors that manage their own completion
            const handledByRealExecutors = ['Visualization Preparation', 'Visualization Display'];
            
            if (!handledByRealExecutors.includes(evt.type)) {
                // Auto-complete unhandled events so the timeline doesn't stall
                setTimeout(() => {
                    EventBus.publish({
                        type: 'EventCompleted',
                        timelineEvent: evt,
                        timestamp: Date.now()
                    });
                }, 50);
            }
        });
    }
}

export class RuntimeBridge {
    private static engine: LessonExecutionEngine;
    private static isInitialized = false;

    static initialize() {
        if (this.isInitialized) return;
        this.engine = new LessonExecutionEngine();
        VisualizationExecutor.initialize();
        if (AvatarExecutor) {
            const avatarExecutor = new AvatarExecutor();
            avatarExecutor.initialize();
        }
        const notesExecutor = new NotesExecutor();
        notesExecutor.initialize();
        FallbackExecutor.initialize();
        this.isInitialized = true;
    }

    /**
     * Entry point from the Legacy ClientPage.
     * Starts the AI Teacher 3.0 intelligence pipeline, compiles a timeline,
     * and kicks off the new Execution Engine.
     */
    static async startLesson(topic: string, domain: string, generateResponse: any) {
        if (!this.isInitialized) this.initialize();

        console.log(`[RuntimeBridge] Starting lesson for topic: ${topic}`);

        // 1. Intelligence Layer
        const analysis = await TopicAnalyzer.analyze(topic, generateResponse);
        const blueprint = LessonPlanner.generateBlueprint(analysis, {});

        // 2. Timeline Engine
        const finalBlueprint = TimelineEngine.build(blueprint);

        if (!finalBlueprint.timeline) {
            throw new Error('[RuntimeBridge] Timeline compilation failed.');
        }

        // 3. Prepare Subsystems (like NotesPlan)
        const notesPlan = await NotesPlanner.generateNotesPlan(blueprint);
        const notesExecutor = new NotesExecutor();
        notesExecutor.loadNotesPlan(notesPlan);

        // 4. Execution Engine
        this.engine.loadTimeline(finalBlueprint.timeline);
        this.engine.start();

        return finalBlueprint;
    }

    static cleanup() {
        if (this.engine) {
            this.engine.cleanup();
        }
    }
}
