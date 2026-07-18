import { EventBus } from './EventBus';
import { ExecutionEventPayload } from './types';

export class MockExecutors {
    static register() {
        EventBus.subscribe('EventStarted', this.handleEvent.bind(this));
    }

    private static handleEvent(payload: ExecutionEventPayload) {
        const evt = payload.timelineEvent;
        if (!evt) return;

        // Simulate varying durations based on event priority/blocking status
        // Background tasks take longer to prove they run in parallel without blocking UI
        const duration = evt.isBlocking ? 1500 : 3000;

        setTimeout(() => {
            // 5% chance to simulate a random failure just to prove Failure Strategy works
            // But we'll keep it deterministic for the simulator by only failing if specifically requested,
            // or we'll just succeed everything for a clean demo.
            
            EventBus.publish({
                type: 'EventCompleted',
                timelineEvent: evt,
                timestamp: Date.now()
            });

        }, duration);
    }
}
