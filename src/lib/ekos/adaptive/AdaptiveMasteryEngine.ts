import { masteryPolicyRegistry } from './MasteryPolicyRegistry';

export class AdaptiveMasteryEngine {
    
    async evaluateProgress(learnerId: string, assessmentResults: any): Promise<"advance" | "reinforce" | "revise" | "recommend_alternate_strategy"> {
        // Fetch the active policy for the learner
        const policy = await masteryPolicyRegistry.getPolicy("default-policy");
        if (!policy) return "advance";

        const score = assessmentResults.score || 0;
        const confidence = assessmentResults.confidence || 0;

        if (score >= policy.masteryThreshold && confidence >= policy.confidenceThreshold) {
            return "advance";
        } else if (score >= policy.masteryThreshold && confidence < policy.confidenceThreshold) {
            return "reinforce"; // High score, low confidence
        } else if (score < policy.masteryThreshold && score > 0.4) {
            return "recommend_alternate_strategy"; // Moderate score, try another approach
        } else {
            return "revise"; // Low score
        }
    }
}

export const adaptiveMasteryEngine = new AdaptiveMasteryEngine();
