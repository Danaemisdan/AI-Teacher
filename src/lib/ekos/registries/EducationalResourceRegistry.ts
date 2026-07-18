import { IResource } from '../core/IResource';
import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

const seedResources: IResource[] = [
    {
        id: "res-concept-diagram",
        name: "Concept Diagram Engine",
        description: "Renders hierarchical concept maps and relationships.",
        capabilities: ["needs_concept_diagram", "needs_mindmap", "needs_hierarchy"],
        supportedInputs: ["concept_graph", "text_description"],
        supportedOutputs: ["interactive_svg", "react_component"],
        rankingMetadata: {
            authorityScore: 10,
            educationalQuality: 9,
            accessibility: 8,
            learnerCompatibility: 9,
            freshness: 10,
            performance: 9
        },
        executionAdapter: {
            adapterType: "internal_renderer",
            internalComponentId: "ConceptDiagramEngine"
        }
    },
    {
        id: "res-simulation-engine",
        name: "Interactive Simulation Engine",
        description: "Provides physics, chemistry, and biology interactive simulations.",
        capabilities: ["needs_simulation", "needs_experiment"],
        supportedInputs: ["simulation_parameters", "scenario_id"],
        supportedOutputs: ["interactive_canvas"],
        rankingMetadata: {
            authorityScore: 10,
            educationalQuality: 10,
            accessibility: 7,
            learnerCompatibility: 10,
            freshness: 9,
            performance: 8
        },
        executionAdapter: {
            adapterType: "internal_renderer",
            internalComponentId: "SimulationEngine"
        }
    },
    {
        id: "res-graph-engine",
        name: "Dynamic Graph Engine",
        description: "Renders mathematical and statistical graphs.",
        capabilities: ["needs_interactive_graph", "needs_chart"],
        supportedInputs: ["data_points", "equation"],
        supportedOutputs: ["interactive_canvas", "svg"],
        rankingMetadata: {
            authorityScore: 10,
            educationalQuality: 9,
            accessibility: 9,
            learnerCompatibility: 8,
            freshness: 10,
            performance: 10
        },
        executionAdapter: {
            adapterType: "internal_renderer",
            internalComponentId: "GraphEngine"
        }
    },
    {
        id: "res-wikipedia-api",
        name: "Wikipedia Knowledge Provider",
        description: "Retrieves general encyclopedia knowledge.",
        capabilities: ["needs_definition", "needs_historical_context", "needs_summary"],
        supportedInputs: ["search_query"],
        supportedOutputs: ["text", "html"],
        rankingMetadata: {
            authorityScore: 8,
            educationalQuality: 7,
            accessibility: 9,
            learnerCompatibility: 8,
            freshness: 8,
            performance: 7
        },
        executionAdapter: {
            adapterType: "external_api",
            endpoint: "https://en.wikipedia.org/w/api.php"
        }
    }
];

export class EducationalResourceRegistry {
    private repository: IRepository<IResource>;

    constructor(repository?: IRepository<IResource>) {
        this.repository = repository || new InMemoryRepository<IResource>(seedResources);
    }

    async findCapableResources(capabilityId: string): Promise<IResource[]> {
        return this.repository.find(res => res.capabilities.includes(capabilityId));
    }

    async getAllResources(): Promise<IResource[]> {
        return this.repository.findAll();
    }
    
    async registerResource(resource: IResource): Promise<void> {
        await this.repository.save(resource);
    }
}

export const resourceRegistry = new EducationalResourceRegistry();
