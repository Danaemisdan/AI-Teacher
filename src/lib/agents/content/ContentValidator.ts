import { ContentBlueprint, GeneratedContentPiece } from './ContentSchemas';

export class ContentValidator {
    
    validate(blueprint: ContentBlueprint, pieces: GeneratedContentPiece[]): boolean {
        console.log(`[ContentValidator] Validating generated content against blueprint...`);

        // 1. Completeness Check
        if (pieces.length === 0) {
            console.error("[ContentValidator] Failed: No content generated.");
            return false;
        }

        const combinedContent = pieces.map(p => p.content).join(" ").toLowerCase();

        // 2. Required Concepts Check
        for (const concept of blueprint.requiredConcepts) {
            if (!combinedContent.includes(concept.toLowerCase())) {
                console.warn(`[ContentValidator] Warning: Required concept '${concept}' not explicitly found in generated text.`);
                // In a stricter implementation, we might fail the validation here or trigger a rewrite.
            }
        }

        // 3. Concepts to Avoid Check
        for (const avoidConcept of blueprint.conceptsToAvoid) {
            if (combinedContent.includes(avoidConcept.toLowerCase())) {
                console.error(`[ContentValidator] Failed: Found restricted concept '${avoidConcept}'.`);
                return false;
            }
        }

        // 4. Word Count Check
        const totalWords = pieces.reduce((acc, piece) => acc + piece.content.split(/\s+/).length, 0);
        if (totalWords > blueprint.maximumLengthWords) {
            console.warn(`[ContentValidator] Warning: Content exceeds maximum length (${totalWords} > ${blueprint.maximumLengthWords}).`);
        }

        return true;
    }
}

export const contentValidator = new ContentValidator();
