import { IRepository } from '../core/IRepository';
import { InMemoryRepository } from '../repositories/InMemoryRepository';

export interface MasteryPolicy {
    id: string;
    masteryThreshold: number;
    confidenceThreshold: number;
    remediationRules: Record<string, string>;
    progressionRules: Record<string, string>;
    revisionRules: Record<string, string>;
}

export class MasteryPolicyRegistry {
    private repository: IRepository<MasteryPolicy>;

    constructor() {
        this.repository = new InMemoryRepository<MasteryPolicy>([
            {
                id: "default-policy",
                masteryThreshold: 0.8,
                confidenceThreshold: 0.7,
                remediationRules: {},
                progressionRules: {},
                revisionRules: {}
            }
        ]);
    }

    async getPolicy(id: string): Promise<MasteryPolicy | null> {
        return this.repository.findById(id);
    }
}

export const masteryPolicyRegistry = new MasteryPolicyRegistry();
