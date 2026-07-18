type EventHandler = (payload: any) => void;

export class EducationalEventBus {
    private listeners: Record<string, EventHandler[]> = {};

    subscribe(event: string, handler: EventHandler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    unsubscribe(event: string, handler: EventHandler) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }

    publish(event: string, payload: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(handler => {
            try {
                handler(payload);
            } catch (e) {
                console.error(`Error in event handler for ${event}`, e);
            }
        });
    }
}

export const eventBus = new EducationalEventBus();
