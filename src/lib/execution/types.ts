import { TimelineEvent } from '../intelligence/types';

export type EngineState = 
    | 'Idle' 
    | 'Initializing' 
    | 'Running' 
    | 'Waiting' 
    | 'Paused' 
    | 'Blocked' 
    | 'Retrying' 
    | 'Completed' 
    | 'Failed' 
    | 'Cancelled';

export type EventState = 
    | 'Pending' 
    | 'Ready' 
    | 'Running' 
    | 'Completed' 
    | 'Skipped' 
    | 'Failed' 
    | 'Cancelled';

export interface ExecutionLogEntry {
    timestamp: number;
    eventId?: string;
    eventType?: string;
    transition: string;
    executor: string;
    durationMs?: number;
    result: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
    message: string;
}

export interface IExecutionContext {
    engineState: EngineState;
    currentMilestone: string | null;
    currentCheckpoint: string | null;
    elapsedTimeMs: number;
    estimatedRemainingTimeMs: number;
    progressPercent: number;
    
    // Tracking state of all events in the compiled timeline
    eventStates: Record<string, EventState>;
    
    // Aggregates
    totalEvents: number;
    completedEvents: number;
    runningEvents: string[];
    waitingEvents: string[];
    failedEvents: string[];
    // Speech & Avatar Tracking
    currentSpeechSegment: string | null;
    currentAvatarState: AvatarPresentationState;
    currentGesture: string;
    currentExpression: string;
    currentAnimation: string;
    currentLookTarget: string;
    currentEmotion: string;
    lipSyncStatus: 'active' | 'inactive';
    animationQueue: string[];
    
    // Notes Tracking
    currentNotesSection: string | null;
    displayedNotes: string[];
    remainingNotes: string[];
    readingProgress: number;
    notesVisibility: 'hidden' | 'visible';
    
    logs: ExecutionLogEntry[];
}

export type AvatarPresentationState = 
    | 'Initializing'
    | 'Idle'
    | 'Listening'
    | 'Thinking'
    | 'PreparingVisualization'
    | 'WaitingForVisualization'
    | 'Speaking'
    | 'Explaining'
    | 'Demonstrating'
    | 'Highlighting'
    | 'WritingNotes'
    | 'WaitingForStudent'
    | 'Questioning'
    | 'Celebrating'
    | 'Completed'
    | 'Paused'
    | 'Cancelled'
    | 'Failed';

export interface PresentationProfile {
    expression: string;
    gesture: string;
    lookTarget: string;
    lipSyncEnabled: boolean;
    animation: string;
}

export type ExecutionEventType = 
    | 'ExecutionStarted'
    | 'TimelineStarted'
    | 'EventReady'
    | 'EventStarted'
    | 'EventCompleted'
    | 'EventFailed'
    | 'EventSkipped'
    | 'BlockingEventStarted'
    | 'BlockingEventCompleted'
    | 'MilestoneReached'
    | 'CheckpointReached'
    | 'LessonPaused'
    | 'LessonResumed'
    | 'LessonCompleted'
    | 'LessonFailed'
    | 'VisualizationRequested'
    | 'VisualizationGenerating'
    | 'VisualizationLoading'
    | 'VisualizationReady'
    | 'VisualizationRendered'
    | 'VisualizationInteractive'
    | 'VisualizationHighlightStarted'
    | 'VisualizationHighlightEnded'
    | 'VisualizationFailed'
    | 'VisualizationDisposed'
    | 'SpeechRequested'
    | 'SpeechPreparing'
    | 'SpeechQueued'
    | 'SpeechStarted'
    | 'SpeechPaused'
    | 'SpeechResumed'
    | 'SpeechCompleted'
    | 'SpeechCancelled'
    | 'SpeechFailed'
    | 'SpeechInterrupted'
    | 'SpeechSkipped'
    | 'SpeechTimeout'
    | 'HighlightStarted'
    | 'HighlightEnded'
    | 'AnimationRequested'
    | 'AvatarInitializing'
    | 'AvatarReady'
    | 'AvatarIdle'
    | 'AvatarListening'
    | 'AvatarThinking'
    | 'AvatarSpeaking'
    | 'AvatarPaused'
    | 'AvatarHighlighting'
    | 'AvatarExplaining'
    | 'AvatarDemonstrating'
    | 'AvatarQuestioning'
    | 'AvatarCelebrating'
    | 'AvatarCompleted'
    | 'AvatarCancelled'
    | 'AvatarFailed'
    | 'NotesRequested'
    | 'NotesPreparing'
    | 'NotesReady'
    | 'NotesDisplayed'
    | 'NotesUpdated'
    | 'NotesCompleted'
    | 'NotesHidden'
    | 'NotesCancelled'
    | 'NotesFailed';

export interface ExecutionEventPayload {
    type: ExecutionEventType;
    timelineEvent?: TimelineEvent;
    message?: string;
    error?: any;
    timestamp: number;
}
