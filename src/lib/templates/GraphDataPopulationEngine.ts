import { GraphTemplate } from './GraphTemplateRegistry';
import { GraphSpec } from '@/components/GraphEngine/types';

export class GraphDataPopulationEngine {
    
    /**
     * Takes an AI-generated data payload and merges it with a curated template.
     * Prevents layout hallucination by strictly preserving template properties.
     */
    public static populate(template: GraphTemplate, aiData: any): GraphSpec {
        const spec: GraphSpec = JSON.parse(JSON.stringify(template.baseSpec)); // Deep copy

        // The AI provides dynamic titles or explanations
        if (aiData.title) spec.title = aiData.title;
        if (aiData.explanation) spec.explanation = aiData.explanation;
        if (aiData.axes) {
            if (aiData.axes.x) spec.axes = { ...spec.axes, x: aiData.axes.x };
            if (aiData.axes.y) spec.axes = { ...spec.axes, y: aiData.axes.y };
        }

        // Map AI generated curves strictly into template slots
        if (spec.curves && aiData.curves && Array.isArray(aiData.curves)) {
            spec.curves = spec.curves.map((templateCurve, index) => {
                let aiCurve = aiData.curves.find((c: any) => c.name === templateCurve.name);
                
                // Fallback: If names don't match, but there are the same number of curves, map by index
                if (!aiCurve && aiData.curves[index]) {
                    aiCurve = aiData.curves[index];
                }

                if (aiCurve) {
                    return {
                        ...templateCurve,
                        points: aiCurve.points || templateCurve.points,
                        func: aiCurve.func || templateCurve.func,
                        name: aiCurve.name || templateCurve.name // Allow AI to rename it if it wants
                    };
                }
                return templateCurve;
            });
        }

        return spec;
    }
}
