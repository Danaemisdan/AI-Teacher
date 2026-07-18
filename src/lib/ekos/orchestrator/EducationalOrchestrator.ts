import { queryIntelligence } from '../intelligence/QueryIntelligence';
import { capabilityIntelligence } from '../intelligence/CapabilityIntelligence';
import { discoveryEngine } from '../discovery/ResourceDiscoveryEngine';
import { ExecutionTracer } from './ExecutionTracer';
import { eventBus } from '../core/EventBus';

export class EducationalOrchestrator {
    
    async processRequest(userQuery: string, learnerProfile?: any): Promise<any> {
        const tracer = new ExecutionTracer(userQuery);
        eventBus.publish("EKOS:OrchestrationStarted", { query: userQuery });

        // 1. Intelligence Phase
        tracer.logDecision("QueryIntelligence", "Analyzing Intent", "Determining what the student wants.");
        const intentModel = await queryIntelligence.analyzeIntent(userQuery);
        
        // (Skipping detailed Knowledge/Teaching intelligence steps in this bootstrap version)
        tracer.logDecision("CapabilityIntelligence", "Determining Capabilities", "Translating educational needs into capability requirements.");
        const capabilityReqs = await capabilityIntelligence.determineCapabilities(intentModel);
        
        tracer.setCapabilitiesRequested(capabilityReqs.map(c => c.capabilityId));

        // 2. Discovery & Resolution Phase
        tracer.logDecision("DiscoveryEngine", "Resolving Resources", "Deterministically finding resources for capabilities without LLM.");
        const resolvedResources = await discoveryEngine.discover(capabilityReqs, { learnerProfile, queryIntent: intentModel });

        const selectedIds: string[] = [];
        const executionPlan: any = {
            intent: intentModel.intent,
            topic: intentModel.topic,
            steps: []
        };

        for (const [capabilityId, resources] of Object.entries(resolvedResources)) {
            if (resources.length > 0) {
                const topResource = resources[0];
                selectedIds.push(topResource.id);
                
                executionPlan.steps.push({
                    capabilityId,
                    resourceId: topResource.id,
                    adapter: topResource.executionAdapter
                });
            } else {
                tracer.logDecision("DiscoveryEngine", `No resource found for ${capabilityId}`, "Fallback required.");
            }
        }

        tracer.setSelectedResources(selectedIds);
        tracer.setExecutionPlan(executionPlan);
        tracer.logDecision("Orchestrator", "Finalizing Execution Plan", "Handing off to Execution Layer.");

        tracer.finish();
        eventBus.publish("EKOS:OrchestrationComplete", { executionPlan });

        return executionPlan;
    }
}

export const educationalOrchestrator = new EducationalOrchestrator();
