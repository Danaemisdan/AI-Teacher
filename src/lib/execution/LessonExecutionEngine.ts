import { TimelineEvent } from '../intelligence/types';
import { EventBus } from './EventBus';
import { ExecutionContext } from './ExecutionContext';
import { ExecutionEventPayload } from './types';

export class LessonExecutionEngine {
    private timeline: TimelineEvent[] = [];
    private completedEventIds: Set<string> = new Set();
    private isRunning = false;

    constructor() {
        // Subscribe to completion events from executors to advance the timeline
        EventBus.subscribe('EventCompleted', this.handleEventCompleted.bind(this));
        EventBus.subscribe('EventFailed', this.handleEventFailed.bind(this));
    }

    public loadTimeline(timeline: TimelineEvent[]) {
        this.timeline = timeline;
        this.completedEventIds.clear();
        this.isRunning = false;
        
        ExecutionContext.initialize(
            timeline.length, 
            timeline.map(e => e.id)
        );

        EventBus.publish({
            type: 'TimelineStarted',
            timestamp: Date.now(),
            message: `Loaded timeline with ${timeline.length} events`
        });
    }

    public start() {
        if (this.timeline.length === 0) return;
        
        this.isRunning = true;
        ExecutionContext.setEngineState('Running');
        
        EventBus.publish({
            type: 'ExecutionStarted',
            timestamp: Date.now()
        });
        
        ExecutionContext.log({
            transition: 'Idle -> Running',
            executor: 'ExecutionEngine',
            result: 'INFO',
            message: 'Execution started.'
        });

        this.scheduleNext();
    }

    public pause() {
        this.isRunning = false;
        ExecutionContext.setEngineState('Paused');
        EventBus.publish({ type: 'LessonPaused', timestamp: Date.now() });
    }

    private scheduleNext() {
        if (!this.isRunning) return;

        let hasPending = false;
        let blockingIsRunning = false;

        // Check if any blocking events are currently running
        for (const evt of this.timeline) {
            const state = ExecutionContext.getState().eventStates[evt.id];
            if (state === 'Running' && evt.isBlocking) {
                blockingIsRunning = true;
                break;
            }
        }

        // Iterate timeline to find events that can start
        for (const evt of this.timeline) {
            const state = ExecutionContext.getState().eventStates[evt.id];
            
            if (state === 'Pending' || state === 'Ready') {
                hasPending = true;
                
                // Can only start if all dependencies are completed
                const depsMet = evt.dependencies.every(depId => this.completedEventIds.has(depId));
                
                if (depsMet) {
                    // If it's a blocking event, wait until no other blocking events are running
                    if (evt.isBlocking && blockingIsRunning) {
                        continue;
                    }

                    this.startEvent(evt);
                    if (evt.isBlocking) {
                        // We just started a blocking event, so we can't start any more blocking events in this tick
                        blockingIsRunning = true;
                    }
                }
            }
        }

        // If no pending events remain and nothing is running, we are done
        const ctx = ExecutionContext.getState();
        if (!hasPending && ctx.runningEvents.length === 0 && ctx.failedEvents.length === 0) {
            this.completeExecution();
        }
    }

    private startEvent(evt: TimelineEvent) {
        ExecutionContext.setEventState(evt.id, 'Running');
        
        EventBus.publish({
            type: 'EventStarted',
            timelineEvent: evt,
            timestamp: Date.now()
        });

        if (evt.isBlocking) {
            EventBus.publish({ type: 'BlockingEventStarted', timelineEvent: evt, timestamp: Date.now() });
        }

        if (evt.milestone) {
            ExecutionContext.setMilestone(evt.milestone);
            EventBus.publish({ type: 'MilestoneReached', message: evt.milestone, timestamp: Date.now() });
        }
        
        if (evt.checkpoint) {
            ExecutionContext.setCheckpoint(evt.checkpoint);
            EventBus.publish({ type: 'CheckpointReached', message: evt.checkpoint, timestamp: Date.now() });
        }

        ExecutionContext.log({
            eventId: evt.id,
            eventType: evt.type,
            transition: 'Ready -> Running',
            executor: 'ExecutionEngine',
            result: 'INFO',
            message: `Started ${evt.isBlocking ? 'Blocking' : 'Background'} event.`
        });
    }

    private handleEventCompleted(payload: ExecutionEventPayload) {
        const evt = payload.timelineEvent;
        if (!evt) return;

        this.completedEventIds.add(evt.id);
        ExecutionContext.setEventState(evt.id, 'Completed');
        
        if (evt.isBlocking) {
            EventBus.publish({ type: 'BlockingEventCompleted', timelineEvent: evt, timestamp: Date.now() });
        }

        ExecutionContext.log({
            eventId: evt.id,
            eventType: evt.type,
            transition: 'Running -> Completed',
            executor: 'Subsystem',
            result: 'SUCCESS',
            message: `Event completed successfully.`
        });

        // Trigger the next scheduling cycle
        this.scheduleNext();
    }

    private handleEventFailed(payload: ExecutionEventPayload) {
        const evt = payload.timelineEvent;
        if (!evt) return;

        ExecutionContext.setEventState(evt.id, 'Failed');
        
        ExecutionContext.log({
            eventId: evt.id,
            eventType: evt.type,
            transition: 'Running -> Failed',
            executor: 'Subsystem',
            result: 'ERROR',
            message: payload.message || 'Execution failed.'
        });

        // Handle Failure Strategy
        if (evt.failureStrategy === 'abort') {
            this.abortExecution(payload.message || 'Fatal event failure.');
        } else if (evt.failureStrategy === 'skip') {
            this.completedEventIds.add(evt.id); // Treat as passed so deps can continue
            ExecutionContext.setEventState(evt.id, 'Skipped');
            this.scheduleNext();
        }
        // retry logic would go here, omitting for simplicity in simulator unless needed
    }

    private completeExecution() {
        this.isRunning = false;
        ExecutionContext.setEngineState('Completed');
        EventBus.publish({ type: 'LessonCompleted', timestamp: Date.now() });
        
        ExecutionContext.log({
            transition: 'Running -> Completed',
            executor: 'ExecutionEngine',
            result: 'SUCCESS',
            message: 'Lesson completed successfully.'
        });
    }

    private abortExecution(reason: string) {
        this.isRunning = false;
        ExecutionContext.setEngineState('Failed');
        EventBus.publish({ type: 'LessonFailed', message: reason, timestamp: Date.now() });
        
        ExecutionContext.log({
            transition: 'Running -> Failed',
            executor: 'ExecutionEngine',
            result: 'ERROR',
            message: `Lesson aborted: ${reason}`
        });
    }

    public cleanup() {
        EventBus.clearAll();
    }
}
