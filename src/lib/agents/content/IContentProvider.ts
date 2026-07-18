import { ContentBlueprint, GeneratedContentPiece } from './ContentSchemas';

export interface IContentProvider {
    generateContent(blueprint: ContentBlueprint): Promise<GeneratedContentPiece[]>;
}

export class MockContentProvider implements IContentProvider {
    async generateContent(blueprint: ContentBlueprint): Promise<GeneratedContentPiece[]> {
        console.log(`[MockContentProvider] Generating content for depth: ${blueprint.explanationDepth}`);
        
        const pieces: GeneratedContentPiece[] = [];

        // Generate Explanation
        pieces.push({
            type: "Explanation",
            content: `This is a ${blueprint.explanationDepth} explanation of ${blueprint.requiredConcepts.join(", ")}.`,
            metadata: { wordCount: 15 }
        });

        // Generate Analogy if it's an introductory or exploratory step
        if (blueprint.teachingPurpose.toLowerCase().includes("explore") || blueprint.teachingPurpose.toLowerCase().includes("introduce")) {
            pieces.push({
                type: "Analogy",
                content: `Think of ${blueprint.requiredConcepts[0]} like a factory line. However, this analogy breaks down because a factory line is linear, whereas this concept is highly recursive.`,
                metadata: {}
            });
        }

        // Generate Misconception
        pieces.push({
            type: "Misconception",
            content: `A common misconception is that this concept works instantaneously. In reality, it requires a measurable state transition.`,
            metadata: {}
        });

        // Generate Notes
        pieces.push({
            type: "Notes",
            content: `- Key concept: ${blueprint.requiredConcepts[0]}\n- Remember the state transition.`,
            metadata: {}
        });

        return pieces;
    }
}
