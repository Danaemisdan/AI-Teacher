export interface LessonStep {
    engineId: string;
    durationEstimate: number; // in milliseconds
    autoAdvance: boolean;
}

export interface LessonStrategy {
    id: string;
    name: string;
    description: string;
    flow: LessonStep[];
    assessmentType: string;
    interactionStyle: string;
    learningObjectives: string[];
}

class LessonStrategyRegistryImpl {
    private strategies: Map<string, LessonStrategy> = new Map();

    constructor() {
        this.initializeStrategies();
    }

    private initializeStrategies() {
        this.register({
            id: 'scientific_process',
            name: 'Scientific Process',
            description: 'A step-by-step exploration of scientific phenomena.',
            flow: [
                { engineId: 'concept_diagram', durationEstimate: 10000, autoAdvance: true },
                { engineId: 'formula', durationEstimate: 5000, autoAdvance: true },
                { engineId: 'simulation', durationEstimate: 20000, autoAdvance: false },
                { engineId: 'molecular', durationEstimate: 10000, autoAdvance: false },
                { engineId: 'quiz', durationEstimate: 0, autoAdvance: false }
            ],
            assessmentType: 'interactive_quiz',
            interactionStyle: 'guided_inquiry',
            learningObjectives: ['Understand the core concept', 'Apply formulas to physical events']
        });

        this.register({
            id: 'economic_principle',
            name: 'Economic Principle',
            description: 'Analyzing economic theories and models.',
            flow: [
                { engineId: 'graph', durationEstimate: 15000, autoAdvance: true },
                { engineId: 'formula', durationEstimate: 5000, autoAdvance: true },
                { engineId: 'worked_example', durationEstimate: 15000, autoAdvance: false },
                { engineId: 'quiz', durationEstimate: 0, autoAdvance: false }
            ],
            assessmentType: 'problem_solving',
            interactionStyle: 'analytical',
            learningObjectives: ['Interpret economic charts', 'Calculate equilibrium']
        });

        this.register({
            id: 'biological_structure',
            name: 'Biological Structure',
            description: 'Deep dive into anatomy and cellular structures.',
            flow: [
                { engineId: 'concept_diagram', durationEstimate: 8000, autoAdvance: true },
                { engineId: 'anatomy', durationEstimate: 25000, autoAdvance: false },
                { engineId: 'molecular', durationEstimate: 15000, autoAdvance: false },
                { engineId: 'quiz', durationEstimate: 0, autoAdvance: false }
            ],
            assessmentType: 'identification',
            interactionStyle: 'exploratory',
            learningObjectives: ['Identify anatomical components', 'Understand cellular relationships']
        });

        this.register({
            id: 'mathematical_derivation',
            name: 'Mathematical Derivation',
            description: 'Step-by-step proofs and function analysis.',
            flow: [
                { engineId: 'formula', durationEstimate: 10000, autoAdvance: true },
                { engineId: 'graph', durationEstimate: 20000, autoAdvance: false },
                { engineId: 'quiz', durationEstimate: 0, autoAdvance: false }
            ],
            assessmentType: 'computational',
            interactionStyle: 'logical_progression',
            learningObjectives: ['Understand proofs', 'Visualize functions']
        });
    }

    public register(strategy: LessonStrategy) {
        this.strategies.set(strategy.id, strategy);
    }

    public getStrategy(id: string): LessonStrategy | undefined {
        return this.strategies.get(id);
    }

    public getAllStrategies(): LessonStrategy[] {
        return Array.from(this.strategies.values());
    }

    /**
     * Determines the optimal pedagogical strategy based on the AI intent.
     */
    public determineStrategyForIntent(intent: string): string {
        const i = intent.toLowerCase();
        if (i.includes('photosynthesis') || i.includes('projectile') || i.includes('physics') || i.includes('chemical')) {
            return 'scientific_process';
        }
        if (i.includes('supply') || i.includes('demand') || i.includes('inflation') || i.includes('economy')) {
            return 'economic_principle';
        }
        if (i.includes('dna') || i.includes('heart') || i.includes('brain') || i.includes('biology')) {
            return 'biological_structure';
        }
        if (i.includes('calculus') || i.includes('algebra') || i.includes('geometry') || i.includes('theorem')) {
            return 'mathematical_derivation';
        }
        
        // Fallback generic strategy
        return 'scientific_process';
    }
}

export const LessonStrategyRegistry = new LessonStrategyRegistryImpl();
