import { EducationalBlueprint, NotesPlan, NotesSection } from './types';

export class NotesPlanner {
    static async generateNotesPlan(blueprint: EducationalBlueprint): Promise<NotesPlan> {
        // In a real implementation, this would use WebLLM to analyze the topic,
        // teaching strategy, and compiled timeline to generate structured notes.
        // For this phase, we generate a deterministic NotesPlan based on the timeline.
        
        const sections: NotesSection[] = [];
        const timeline = blueprint.compiledTimeline || [];
        
        let sectionCounter = 1;
        
        for (const event of timeline) {
            // Find events that logically should trigger a new notes section
            if (event.type === 'Speech Begin' || event.type === 'Interaction' || event.type === 'Visualization Display') {
                sections.push({
                    id: `notes-section-${sectionCounter}`,
                    timelineEventId: event.id,
                    title: `Key Concept ${sectionCounter}: ${event.type}`,
                    bulletPoints: [
                        `Understanding the implications of ${blueprint.topicAnalysis.topic}.`,
                        `Observing how the ${event.type} advances our knowledge.`,
                        `Applying this to ${blueprint.topicAnalysis.subtopic}.`
                    ],
                    summary: `This section summarizes the key takeaways from the ${event.type} segment of the lesson.`,
                    keyFormulae: sectionCounter === 2 ? ['E = mc^2', 'F = ma'] : [],
                    definitions: sectionCounter === 1 ? { 'Concept': 'A fundamental building block of knowledge.' } : {},
                    importantFacts: [`This is a crucial fact for ${blueprint.topicAnalysis.topic}.`],
                    memoryTips: ['Remember the acronym ABC: Always Be Curious.'],
                    diagramReferences: event.type === 'Visualization Display' ? ['viz-1'] : [],
                    highlightReferences: [],
                    difficulty: blueprint.topicAnalysis.difficulty,
                    estimatedReadingTime: 2,
                    metadata: {}
                });
                sectionCounter++;
            }
        }
        
        // Add a final summary section at the end of the lesson if there is a Completion event
        const completionEvent = timeline.find(e => e.type === 'Completion');
        if (completionEvent) {
             sections.push({
                id: `notes-section-${sectionCounter}`,
                timelineEventId: completionEvent.id,
                title: 'Lesson Summary',
                bulletPoints: [
                    'You have completed the lesson.',
                    'Review these notes to prepare for the quiz.'
                ],
                summary: 'Excellent work completing today\'s lesson.',
                keyFormulae: [],
                definitions: {},
                importantFacts: [],
                memoryTips: [],
                diagramReferences: [],
                highlightReferences: [],
                difficulty: blueprint.topicAnalysis.difficulty,
                estimatedReadingTime: 1,
                metadata: {}
            });
        }

        return { sections };
    }
}
