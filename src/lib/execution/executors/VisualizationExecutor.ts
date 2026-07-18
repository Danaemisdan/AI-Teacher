import { EventBus } from '../EventBus';
import { ExecutionEventPayload } from '../types';
import { TimelineEvent } from '../../intelligence/types';
import { CapabilityRegistry, VisualizationPayload } from '../../visualization/CapabilityRegistry';
import { AssetManager } from '../../AssetManager';

export class VisualizationExecutor {
    private static isInitialized = false;

    static initialize() {
        if (this.isInitialized) return;
        EventBus.subscribe('EventStarted', this.handleEventStarted.bind(this));
        EventBus.subscribe('EventSkipped', this.handleEventSkipped.bind(this));
        
        // Let's also listen for any generic "VisualizationRendered" events coming from the UI
        // so we can formally complete the TimelineEvent if needed. (Though for now, the executor might simulate the render wait).
        this.isInitialized = true;
    }

    private static async handleEventStarted(payload: ExecutionEventPayload) {
        const evt = payload.timelineEvent;
        if (!evt) return;

        // Determine if this event is visualization-related based on capability required.
        // For phase 6, we're hooking into 'interactive-flowchart' (Mermaid) as the test case,
        // or any event that specifically requires visualization.
        if (evt.type === 'Visualization Preparation' || evt.type === 'Visualization Display') {
            await this.executeVisualizationLifecycle(evt);
        }
    }

    private static handleEventSkipped(payload: ExecutionEventPayload) {
        // Handle cleanup if needed
    }

    private static async executeVisualizationLifecycle(evt: TimelineEvent) {
        try {
            EventBus.publish({ type: 'VisualizationRequested', timelineEvent: evt, timestamp: Date.now() });

            // 1. Planning/Generating
            EventBus.publish({ type: 'VisualizationGenerating', timelineEvent: evt, timestamp: Date.now() });
            
            let finalPayload: string | null = null;
            let finalCapability = 'interactive-flowchart';

            // Simulate asset caching & generation (In a real system, this talks to LLM or DB)
            const topic = evt.metadata?.topic || 'Concept';
            const cachedId = await AssetManager.findBestRegistryMatch(topic, 'General');
            
            if (cachedId) {
                const existingData = await AssetManager.getAssetData(cachedId);
                if (existingData) finalPayload = existingData;
            }

            if (!finalPayload) {
                // Generate fallback Mermaid for this phase
                const safeTopic = topic.replace(/"/g, "'");
                const mermaidCode = `graph TD;\nA["${safeTopic}"] --> B["Core Principle"];`;
                const visPayload: VisualizationPayload = {
                    type: finalCapability as any,
                    capability: finalCapability as any,
                    renderer: 'mermaid',
                    payload: { code: mermaidCode }
                };
                finalPayload = JSON.stringify(visPayload);
                AssetManager.registerNewAsset(topic, finalCapability, finalPayload);
            }

            // 2. Loading Assets (Mocking network delay)
            EventBus.publish({ type: 'VisualizationLoading', timelineEvent: evt, timestamp: Date.now() });
            await new Promise(r => setTimeout(r, 800));

            // 3. Ready
            // We publish VisualizationReady so that LessonBoard can react and mount the canvas.
            // We pass the finalPayload so the UI knows what to render.
            EventBus.publish({ 
                type: 'VisualizationReady', 
                timelineEvent: evt, 
                message: finalPayload, // Passing the stringified payload via message
                timestamp: Date.now() 
            });

            // 4. Rendered (Simulating the time it takes the UI to render)
            // Ideally the UI would publish VisualizationRendered, but since we want the Execution Engine
            // completely decoupled, we can let the UI fire it, OR we wait here.
            // For now, we will assume if the UI gets Ready, it renders immediately.
            await new Promise(r => setTimeout(r, 200));
            EventBus.publish({ type: 'VisualizationRendered', timelineEvent: evt, timestamp: Date.now() });

            // Finally, mark the Timeline Event as Completed so the scheduler continues (e.g. to Speech)
            EventBus.publish({
                type: 'EventCompleted',
                timelineEvent: evt,
                timestamp: Date.now()
            });

        } catch (error: any) {
            console.error('[VisualizationExecutor] Error:', error);
            EventBus.publish({ 
                type: 'VisualizationFailed', 
                timelineEvent: evt, 
                error: error,
                message: error.message,
                timestamp: Date.now() 
            });
            
            EventBus.publish({
                type: 'EventFailed',
                timelineEvent: evt,
                message: 'Visualization failed: ' + error.message,
                timestamp: Date.now()
            });
        }
    }
}
