export interface ICapability {
    id: string; // e.g., "needs_simulation", "needs_concept_diagram"
    name: string;
    description: string;
}

export interface CapabilityRequirement {
    capabilityId: string;
    required: boolean;
    metadata?: Record<string, any>;
}
