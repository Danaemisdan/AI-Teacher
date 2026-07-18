import { TaskContextManager, TaskContext } from './TaskContext';
import { educationalAgentRegistry } from './EducationalAgentRegistry';

export class EducationalWorkflowEngine {
    
    /**
     * The Hybrid Agent Architecture coordinator.
     * It discovers agents based on the required capabilities for a stage
     * and passes the immutable TaskContext to them.
     */
    async executeWorkflow(initialIntent: string): Promise<Readonly<TaskContext>> {
        const contextManager = new TaskContextManager({ studentIntent: initialIntent });

        // Phase 1: Planning (e.g., finding the EducationalPlannerAgent)
        contextManager.update(await this.delegateToAgents("capability:educational-planning", contextManager.get()));

        // Phase 2: Activity Generation
        contextManager.update(await this.delegateToAgents("capability:activity-generation", contextManager.get()));

        // Phase 3: Discovery & Resolution
        contextManager.update(await this.delegateToAgents("capability:resource-discovery", contextManager.get()));

        return contextManager.get();
    }

    private async delegateToAgents(requiredCapability: string, currentContext: Readonly<TaskContext>): Promise<Partial<TaskContext>> {
        const agents = await educationalAgentRegistry.findAgentsByCapability(requiredCapability);
        let aggregatedMutations: Partial<TaskContext> = {};

        for (const agent of agents) {
            console.log(`[WorkflowEngine] Delegating to agent: ${agent.getMetadata().name}`);
            const mutations = await agent.execute(currentContext);
            aggregatedMutations = { ...aggregatedMutations, ...mutations };
        }

        return aggregatedMutations;
    }
}

export const educationalWorkflowEngine = new EducationalWorkflowEngine();
