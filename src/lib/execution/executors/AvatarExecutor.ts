import { ISubsystemExecutor } from './ISubsystemExecutor';
import { EventBus } from '../EventBus';
import { ExecutionEventPayload, AvatarPresentationState, PresentationProfile } from '../types';
import { LipSyncController } from '../controllers/LipSyncController';
import { ExpressionController } from '../controllers/ExpressionController';
import { GestureController } from '../controllers/GestureController';
import { AnimationController } from '../controllers/AnimationController';
import { LookTargetController } from '../controllers/LookTargetController';

export class AvatarExecutor implements ISubsystemExecutor {
    private currentState: AvatarPresentationState = 'Initializing';

    initialize(): void {
        this.subscribeToEvents();
        this.transitionTo('Idle');
    }

    private subscribeToEvents() {
        EventBus.subscribe('SpeechStarted', () => this.transitionTo('Speaking'));
        EventBus.subscribe('SpeechPaused', () => this.transitionTo('Paused'));
        EventBus.subscribe('SpeechResumed', () => this.transitionTo('Speaking'));
        EventBus.subscribe('SpeechCompleted', () => this.transitionTo('Idle'));
        
        EventBus.subscribe('HighlightStarted', () => this.transitionTo('Highlighting'));
        EventBus.subscribe('HighlightEnded', () => this.transitionTo('Speaking')); // Fallback to speaking or idle depending on speech state

        EventBus.subscribe('ExecutionStarted', () => this.transitionTo('Idle'));
        EventBus.subscribe('LessonPaused', () => this.transitionTo('Paused'));
        EventBus.subscribe('LessonCompleted', () => {
            this.transitionTo('Celebrating');
            setTimeout(() => this.transitionTo('Completed'), 3000);
        });
        
        EventBus.subscribe('VisualizationReady', () => this.transitionTo('Idle'));
    }

    execute(): void {
        // Passive executor, driven by events
    }

    cancel(): void {
        this.transitionTo('Cancelled');
    }

    dispose(): void {
        this.transitionTo('Idle');
    }

    private transitionTo(newState: AvatarPresentationState) {
        this.currentState = newState;
        const profile = this.getProfileForState(newState);
        this.applyProfile(profile);
        
        // Publish state change
        EventBus.publish({
            type: `Avatar${newState}` as any, // dynamic map to AvatarIdle, AvatarSpeaking, etc.
            timestamp: Date.now()
        });
    }

    private getProfileForState(state: AvatarPresentationState): PresentationProfile {
        switch (state) {
            case 'Speaking':
                return {
                    expression: 'Confident',
                    gesture: 'Explain',
                    lookTarget: 'Student',
                    lipSyncEnabled: true,
                    animation: 'Speaking Loop'
                };
            case 'Highlighting':
                return {
                    expression: 'Focused',
                    gesture: 'Point',
                    lookTarget: 'Highlighted Element',
                    lipSyncEnabled: true, // Assuming they might be speaking while highlighting
                    animation: 'Point Loop'
                };
            case 'Thinking':
                return {
                    expression: 'Thinking',
                    gesture: 'Idle',
                    lookTarget: 'Up',
                    lipSyncEnabled: false,
                    animation: 'Thinking Loop'
                };
            case 'Celebrating':
                return {
                    expression: 'Excited',
                    gesture: 'Celebrate',
                    lookTarget: 'Student',
                    lipSyncEnabled: false,
                    animation: 'Celebrate Loop'
                };
            case 'Paused':
                return {
                    expression: 'Neutral',
                    gesture: 'Idle',
                    lookTarget: 'Student',
                    lipSyncEnabled: false,
                    animation: 'Idle Loop'
                };
            case 'Idle':
            default:
                return {
                    expression: 'Neutral',
                    gesture: 'Idle',
                    lookTarget: 'Student',
                    lipSyncEnabled: false,
                    animation: 'Idle Loop'
                };
        }
    }

    private applyProfile(profile: PresentationProfile) {
        ExpressionController.setExpression(profile.expression);
        GestureController.setGesture(profile.gesture);
        LookTargetController.setTarget(profile.lookTarget);
        
        if (profile.lipSyncEnabled) {
            LipSyncController.start();
        } else {
            LipSyncController.stop();
        }
        
        AnimationController.playAnimation(profile.animation);
    }
}
