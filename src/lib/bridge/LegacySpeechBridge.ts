import { EventBus } from '../execution/EventBus';
import { ExecutionEventPayload } from '../execution/types';

type SpeechCallback = () => void;

export class LegacySpeechBridge {
    private static pendingSpeechCallback: SpeechCallback | null = null;
    private static isInitialized = false;

    static initialize() {
        if (this.isInitialized) return;
        
        EventBus.subscribe('VisualizationReady', this.handleVisualizationReady.bind(this));
        
        this.isInitialized = true;
    }

    /**
     * Called by ClientPage when it wants to trigger speech, 
     * but we want to hold it until the visualization is ready.
     */
    static queueSpeechTrigger(callback: SpeechCallback) {
        // If we want to hold speech until VisualizationReady, we store the callback.
        // For safety, in case there is no visualization in this lesson, we could add a timeout,
        // but the strict requirement is Visualization must happen before speech.
        this.pendingSpeechCallback = callback;
    }

    private static handleVisualizationReady(payload: ExecutionEventPayload) {
        if (this.pendingSpeechCallback) {
            console.log('[LegacySpeechBridge] Visualization Ready. Triggering speech generation...');
            this.pendingSpeechCallback();
            this.pendingSpeechCallback = null;
        }
    }
}
