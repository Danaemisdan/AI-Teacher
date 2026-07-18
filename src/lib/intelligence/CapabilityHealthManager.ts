import { ICapability, EducationalBlueprint, SystemReadinessReport, CapabilityHierarchy } from './types';
import { VisualizationRegistry } from './VisualizationRegistry';

export class CapabilityHealthManager {
    // A private dictionary storing all registered capabilities
    private static registry: Map<string, ICapability> = new Map();

    /**
     * Passively registers a capability. Future engines (AR, VR, Collaboration) 
     * can call this without modifying the Health Manager.
     */
    static registerCapability(capability: ICapability) {
        this.registry.set(capability.id, capability);
    }

    /**
     * Gets a single capability by ID.
     */
    static getCapability(id: string): ICapability | undefined {
        return this.registry.get(id);
    }

    /**
     * Returns a complete hierarchical health report of the system.
     */
    static getSystemReadinessReport(): SystemReadinessReport {
        const hierarchy: CapabilityHierarchy = {
            Core: [],
            Teaching: [],
            Visualization: [],
            Presentation: []
        };

        const scores = { core: 0, teaching: 0, visualization: 0, presentation: 0, overall: 0 };
        const counts = { core: 0, teaching: 0, visualization: 0, presentation: 0 };

        this.registry.forEach(cap => {
            hierarchy[cap.category].push(cap);
            
            const categoryKey = cap.category.toLowerCase() as keyof typeof scores;
            if (categoryKey !== 'overall') {
                scores[categoryKey] += cap.healthScore;
                counts[categoryKey]++;
            }
        });

        // Compute averages
        if (counts.core > 0) scores.core = Math.round(scores.core / counts.core);
        if (counts.teaching > 0) scores.teaching = Math.round(scores.teaching / counts.teaching);
        if (counts.visualization > 0) scores.visualization = Math.round(scores.visualization / counts.visualization);
        if (counts.presentation > 0) scores.presentation = Math.round(scores.presentation / counts.presentation);

        scores.overall = Math.round((scores.core + scores.teaching + scores.visualization + scores.presentation) / 4);

        // Core systems must be > 80% to be considered ready
        const isExecutionReady = scores.core >= 80 && scores.teaching >= 80;

        return { hierarchy, scores, isExecutionReady };
    }

    /**
     * Validates if a generated blueprint can actually be executed by the current system.
     * Evaluates the fallback chain without modifying educational logic.
     */
    static validateBlueprintExecution(blueprint: EducationalBlueprint): void {
        const requiredEngines = blueprint.visualizations;
        let canExecute = false;
        const missingCapabilities: string[] = [];
        const fallbackRoutes: string[] = [];
        let message = "Execution validated successfully.";

        // Look for the first engine in the fallback chain that is READY or PARTIAL
        for (const engineId of requiredEngines) {
            const cap = this.getCapability(engineId);
            if (cap && (cap.status === 'READY' || cap.status === 'PARTIAL')) {
                canExecute = true;
                if (engineId !== requiredEngines[0]) {
                    message = `Primary engine '${requiredEngines[0]}' unavailable. Falling back to '${engineId}'.`;
                }
                break;
            } else {
                missingCapabilities.push(engineId);
                // Also check its explicit fallback chain
                if (cap && cap.fallbacks.length > 0) {
                    fallbackRoutes.push(...cap.fallbacks);
                }
            }
        }

        if (!canExecute) {
            // Check if any explicit fallbacks are registered and ready
            for (const fallbackId of fallbackRoutes) {
                const fCap = this.getCapability(fallbackId);
                if (fCap && (fCap.status === 'READY' || fCap.status === 'PARTIAL')) {
                    canExecute = true;
                    message = `All preferred engines unavailable. Falling back to deep fallback '${fallbackId}'.`;
                    break;
                }
            }
        }

        if (!canExecute) {
            message = `System cannot execute this lesson. Missing capabilities: ${missingCapabilities.join(', ')}. No fallbacks available.`;
        }

        // We attach this passive validation to the blueprint itself
        blueprint.capabilityValidation = {
            canExecute,
            missingCapabilities,
            fallbackRoutes,
            message
        };
    }
}
