import { ExecutionEventPayload, ExecutionEventType } from './types';

type EventCallback = (payload: ExecutionEventPayload) => void;

export class EventBus {
    private static listeners: Map<ExecutionEventType, EventCallback[]> = new Map();

    static subscribe(type: ExecutionEventType, callback: EventCallback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)!.push(callback);
    }

    static unsubscribe(type: ExecutionEventType, callback: EventCallback) {
        if (!this.listeners.has(type)) return;
        const filtered = this.listeners.get(type)!.filter(cb => cb !== callback);
        this.listeners.set(type, filtered);
    }

    static publish(payload: ExecutionEventPayload) {
        // console.log(`[EventBus] ${payload.type}`, payload.timelineEvent?.id || payload.message || '');
        if (this.listeners.has(payload.type)) {
            this.listeners.get(payload.type)!.forEach(cb => {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`[EventBus] Error in listener for ${payload.type}:`, e);
                }
            });
        }
    }

    static clearAll() {
        this.listeners.clear();
    }
}
