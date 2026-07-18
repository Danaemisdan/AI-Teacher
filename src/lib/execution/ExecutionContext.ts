import { IExecutionContext, ExecutionLogEntry, EngineState, EventState, ExecutionEventType, ExecutionEventPayload } from './types';
import { EventBus } from './EventBus';

type ContextChangeListener = (context: IExecutionContext) => void;

export class ExecutionContext {
    private static listeners: ContextChangeListener[] = [];
    
    private static state: IExecutionContext = {
        engineState: 'Idle',
        currentMilestone: null,
        currentCheckpoint: null,
        elapsedTimeMs: 0,
        estimatedRemainingTimeMs: 0,
        progressPercent: 0,
        eventStates: {},
        totalEvents: 0,
        completedEvents: 0,
        runningEvents: [],
        waitingEvents: [],
        failedEvents: [],
        currentSpeechSegment: null,
        currentAvatarState: 'Initializing',
        currentGesture: 'Idle',
        currentExpression: 'Neutral',
        currentAnimation: 'Idle Loop',
        currentLookTarget: 'Student',
        currentEmotion: 'Neutral',
        lipSyncStatus: 'inactive',
        animationQueue: [],
        currentNotesSection: null,
        displayedNotes: [],
        remainingNotes: [],
        readingProgress: 0,
        notesVisibility: 'hidden',
        logs: []
    };

    static initialize(totalEvents: number, eventIds: string[]) {
        const initialStates: Record<string, EventState> = {};
        eventIds.forEach(id => {
            initialStates[id] = 'Pending';
        });

        this.state = {
            engineState: 'Initializing',
            currentMilestone: null,
            currentCheckpoint: null,
            elapsedTimeMs: 0,
            estimatedRemainingTimeMs: 0,
            progressPercent: 0,
            eventStates: initialStates,
            totalEvents,
            completedEvents: 0,
            runningEvents: [],
            waitingEvents: [...eventIds],
            failedEvents: [],
            currentSpeechSegment: null,
            currentAvatarState: 'Initializing',
            currentGesture: 'Idle',
            currentExpression: 'Neutral',
            currentAnimation: 'Idle Loop',
            currentLookTarget: 'Student',
            currentEmotion: 'Neutral',
            lipSyncStatus: 'inactive',
            animationQueue: [],
            currentNotesSection: null,
            displayedNotes: [],
            remainingNotes: [],
            readingProgress: 0,
            notesVisibility: 'hidden',
            logs: []
        };
        this.notify();
    }

    static subscribe(listener: ContextChangeListener) {
        this.listeners.push(listener);
        listener(this.state);
    }

    static unsubscribe(listener: ContextChangeListener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private static notify() {
        // Clone for React reactivity
        const snapshot = { ...this.state, logs: [...this.state.logs], eventStates: { ...this.state.eventStates }, runningEvents: [...this.state.runningEvents], waitingEvents: [...this.state.waitingEvents], failedEvents: [...this.state.failedEvents] };
        this.listeners.forEach(l => l(snapshot));
    }

    static getState(): IExecutionContext {
        return this.state;
    }

    static setEngineState(state: EngineState) {
        this.state.engineState = state;
        this.notify();
    }

    static setEventState(eventId: string, state: EventState) {
        this.state.eventStates[eventId] = state;
        
        // Recompute aggregates
        this.state.runningEvents = Object.keys(this.state.eventStates).filter(id => this.state.eventStates[id] === 'Running');
        this.state.waitingEvents = Object.keys(this.state.eventStates).filter(id => this.state.eventStates[id] === 'Pending' || this.state.eventStates[id] === 'Ready');
        this.state.failedEvents = Object.keys(this.state.eventStates).filter(id => this.state.eventStates[id] === 'Failed');
        this.state.completedEvents = Object.keys(this.state.eventStates).filter(id => this.state.eventStates[id] === 'Completed' || this.state.eventStates[id] === 'Skipped').length;
        
        if (this.state.totalEvents > 0) {
            this.state.progressPercent = Math.round((this.state.completedEvents / this.state.totalEvents) * 100);
        }

        this.notify();
    }

    static setMilestone(milestone: string) {
        this.state.currentMilestone = milestone;
        this.notify();
    }

    static setCheckpoint(checkpoint: string) {
        this.state.currentCheckpoint = checkpoint;
        this.notify();
    }

    static log(entry: Omit<ExecutionLogEntry, 'timestamp'>) {
        this.state.logs.push({
            ...entry,
            timestamp: Date.now()
        });
        this.notify();
    }
}
