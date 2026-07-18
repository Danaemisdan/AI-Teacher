import { ISubsystemExecutor } from './ISubsystemExecutor';
import { EventBus } from '../EventBus';
import { NotesPlan, NotesSection } from '../../intelligence/types';
import { ExecutionContext } from '../ExecutionContext';

export class NotesExecutor implements ISubsystemExecutor {
    private notesPlan: NotesPlan | null = null;
    private displayedSectionIds: Set<string> = new Set();
    private isInitialized = false;

    initialize(): void {
        this.subscribeToEvents();
        this.isInitialized = true;
    }

    loadNotesPlan(plan: NotesPlan): void {
        this.notesPlan = plan;
        this.displayedSectionIds.clear();
        this.updateContext();
        
        EventBus.publish({
            type: 'NotesReady',
            timestamp: Date.now()
        });
    }

    private subscribeToEvents() {
        EventBus.subscribe('EventStarted', (payload) => {
            if (!this.notesPlan || !payload.timelineEvent) return;
            
            const eventId = payload.timelineEvent.id;
            
            // Find sections tied to this timeline event
            const sectionsToReveal = this.notesPlan.sections.filter(
                s => s.timelineEventId === eventId && !this.displayedSectionIds.has(s.id)
            );
            
            if (sectionsToReveal.length > 0) {
                EventBus.publish({ type: 'NotesPreparing', timestamp: Date.now() });
                
                sectionsToReveal.forEach(section => {
                    this.displayedSectionIds.add(section.id);
                    EventBus.publish({
                        type: 'NotesDisplayed',
                        message: JSON.stringify(section),
                        timestamp: Date.now()
                    });
                });
                
                this.updateContext();
                EventBus.publish({ type: 'NotesUpdated', timestamp: Date.now() });
            }
        });
        
        EventBus.subscribe('LessonCompleted', () => {
            if (this.notesPlan && this.displayedSectionIds.size === this.notesPlan.sections.length) {
                EventBus.publish({ type: 'NotesCompleted', timestamp: Date.now() });
            }
        });
        
        EventBus.subscribe('LessonFailed', () => {
             EventBus.publish({ type: 'NotesCancelled', timestamp: Date.now() });
        });
    }

    private updateContext() {
        if (!this.notesPlan) return;
        
        const total = this.notesPlan.sections.length;
        const displayed = this.displayedSectionIds.size;
        
        const displayedNotes = this.notesPlan.sections
            .filter(s => this.displayedSectionIds.has(s.id))
            .map(s => s.title);
            
        const remainingNotes = this.notesPlan.sections
            .filter(s => !this.displayedSectionIds.has(s.id))
            .map(s => s.title);
            
        const currentSection = Array.from(this.displayedSectionIds).pop() || null;
        
        // Let's hackily access the internal state to update it, in a real app we'd have dedicated setters.
        const ctx = ExecutionContext.getState();
        ctx.currentNotesSection = currentSection;
        ctx.displayedNotes = displayedNotes;
        ctx.remainingNotes = remainingNotes;
        ctx.readingProgress = total > 0 ? (displayed / total) * 100 : 0;
        ctx.notesVisibility = displayed > 0 ? 'visible' : 'hidden';
    }

    execute(): void {
        // Passive - reacts to EventStarted
    }

    cancel(): void {
        EventBus.publish({ type: 'NotesCancelled', timestamp: Date.now() });
    }

    dispose(): void {
        EventBus.publish({ type: 'NotesHidden', timestamp: Date.now() });
        this.displayedSectionIds.clear();
        this.notesPlan = null;
        this.isInitialized = false;
    }
}
