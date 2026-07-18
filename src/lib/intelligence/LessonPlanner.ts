import { EducationalBlueprint, TopicAnalysis, LessonPlanNode, PlanningMetrics, ContentPreview } from './types';
import { TeachingStrategyRegistry } from './TeachingStrategyRegistry';
import { VisualizationRegistry } from './VisualizationRegistry';
import { ValidationEngine } from './ValidationEngine';

export class LessonPlanner {
    /**
     * Synthesizes the Educational Blueprint and tracks exact timings for the Debug Console.
     */
    static generateBlueprint(
        analysis: TopicAnalysis, 
        timings: Partial<PlanningMetrics>
    ): EducationalBlueprint {
        const startTotal = performance.now();
        
        // 1. Registry Lookups
        const startRegistry = performance.now();
        const strategy = TeachingStrategyRegistry.getStrategyById(analysis.teachingStrategy) 
            || TeachingStrategyRegistry.getStrategyForSubject(analysis.subject);
            
        const validVisualizations = VisualizationRegistry.getEnginesForSubject(analysis.subject);
        
        // Prioritize the LLM's suggested visualization if it exists in the valid list, otherwise use primary
        const selectedEngine = validVisualizations.includes(analysis.visualization) 
            ? analysis.visualization 
            : validVisualizations[0];
        
        const registryTime = performance.now() - startRegistry;

        // 2. Lesson Structure Assembly
        const startAssembly = performance.now();
        const lessonStructure: LessonPlanNode[] = strategy.phases.map((phase, index) => {
            const isVisual = ['visual', 'graph', 'diagram', 'timeline', 'map', '3d_model'].includes(phase.type);
            const isInteractive = ['interactive', 'practice', 'quiz', 'challenge', 'code_editor'].includes(phase.type);

            return {
                id: `phase-${index}-${phase.type}`,
                name: phase.name,
                phaseType: phase.type,
                details: {
                    requiresSpeech: true, 
                    requiresVisualization: isVisual || isInteractive,
                    requiresInteraction: isInteractive
                }
            };
        });
        const assemblyTime = performance.now() - startAssembly;

        // 3. Validation
        const startValidation = performance.now();
        const validationResult = ValidationEngine.validate(analysis);
        const validationTime = performance.now() - startValidation;

        // 4. Previews
        const previews: ContentPreview = {
            notesPreview: `### ${analysis.topic}\n\n- Key Concept 1\n- Key Concept 2\n\n**Summary:**\nDetailed review of ${analysis.subtopic}.`,
            quizExample: `Question: Example question about ${analysis.topic}?\nOptions: A, B, C, D\nAnswer: A`
        };

        const totalPlanningTime = performance.now() - startTotal + (timings.topicAnalysisTimeMs || 0) + (timings.knowledgeRetrievalTimeMs || 0);

        return {
            topicAnalysis: analysis,
            strategy: strategy,
            visualizations: [selectedEngine, ...validVisualizations.filter(v => v !== selectedEngine)],
            lessonStructure,
            metrics: {
                knowledgeRetrievalTimeMs: timings.knowledgeRetrievalTimeMs || 0,
                topicAnalysisTimeMs: timings.topicAnalysisTimeMs || 0,
                registryLookupTimeMs: registryTime,
                lessonPlanningTimeMs: assemblyTime,
                validationTimeMs: validationTime,
                totalPlanningTimeMs: totalPlanningTime
            },
            validation: validationResult,
            previews
        };
    }
}
