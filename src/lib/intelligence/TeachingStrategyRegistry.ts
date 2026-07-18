import { TeachingStrategy, SubjectType } from './types';

// Structured configuration object replacing hardcoded switch statements
const STRATEGY_DB: Record<string, TeachingStrategy> = {
    'mathematics-standard': {
        strategyId: 'mathematics-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Formula', type: 'formula' },
            { name: 'Equation', type: 'equation' },
            { name: 'Graph', type: 'graph' },
            { name: 'Worked Example', type: 'practice' },
            { name: 'Practice', type: 'practice' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'programming-standard': {
        strategyId: 'programming-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Concept', type: 'concept' },
            { name: 'Code Example', type: 'visual' },
            { name: 'Code Editor', type: 'interactive' },
            { name: 'Execution', type: 'practice' },
            { name: 'Challenge', type: 'challenge' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'history-standard': {
        strategyId: 'history-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Timeline', type: 'timeline' },
            { name: 'Map', type: 'map' },
            { name: 'Important Events', type: 'events' },
            { name: 'Causes', type: 'causes' },
            { name: 'Effects', type: 'effects' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'economics-standard': {
        strategyId: 'economics-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Graph', type: 'graph' },
            { name: 'Explanation', type: 'concept' },
            { name: 'Real World Example', type: 'real_world_example' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'biology-standard': {
        strategyId: 'biology-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Diagram', type: 'visual' },
            { name: 'Structure', type: 'structure' },
            { name: 'Function', type: 'function' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'anatomy-standard': {
        strategyId: 'anatomy-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: '3D Human Model', type: 'visual' },
            { name: 'Highlight Organ', type: 'interactive' },
            { name: 'Explain Organ', type: 'structure' },
            { name: 'Function', type: 'function' },
            { name: 'Clinical Relevance', type: 'clinical_relevance' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'astronomy-standard': {
        strategyId: 'astronomy-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Solar System Model', type: 'visual' },
            { name: 'Planet Animation', type: 'interactive' },
            { name: 'Orbital Explanation', type: 'orbital_explanation' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'networking-standard': {
        strategyId: 'networking-standard',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Topology Diagram', type: 'visual' },
            { name: 'Packet Flow', type: 'packet_flow' },
            { name: 'Protocol Explanation', type: 'protocol_explanation' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    },
    'default': {
        strategyId: 'default',
        phases: [
            { name: 'Introduction', type: 'intro' },
            { name: 'Core Concept', type: 'concept' },
            { name: 'Example', type: 'practice' },
            { name: 'Summary', type: 'summary' },
            { name: 'Quiz', type: 'quiz' }
        ]
    }
};

const SUBJECT_TO_STRATEGY: Record<SubjectType, string> = {
    'Mathematics': 'mathematics-standard',
    'Physics': 'mathematics-standard',
    'Chemistry': 'biology-standard', // similar structure
    'Biology': 'biology-standard',
    'Anatomy': 'anatomy-standard',
    'Astronomy': 'astronomy-standard',
    'Programming': 'programming-standard',
    'Computer Science': 'programming-standard',
    'Networking': 'networking-standard',
    'History': 'history-standard',
    'Geography': 'history-standard',
    'Civics': 'history-standard',
    'Economics': 'economics-standard',
    'Finance': 'economics-standard',
    'Business': 'economics-standard',
    'Architecture': 'biology-standard',
    'AI/Machine Learning': 'programming-standard',
    'General': 'default'
};

export class TeachingStrategyRegistry {
    /**
     * Gets a strategy directly by its ID.
     */
    static getStrategyById(strategyId: string): TeachingStrategy {
        return STRATEGY_DB[strategyId] || STRATEGY_DB['default'];
    }

    /**
     * Determines the best strategy for a given subject.
     */
    static getStrategyForSubject(subject: SubjectType): TeachingStrategy {
        const strategyId = SUBJECT_TO_STRATEGY[subject] || 'default';
        return STRATEGY_DB[strategyId];
    }

    /**
     * Registers a new strategy at runtime if needed.
     */
    static registerStrategy(strategyId: string, strategy: TeachingStrategy) {
        STRATEGY_DB[strategyId] = strategy;
    }
}
