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

        this.register({
            id: 'data_analysis',
            name: 'Data Analysis',
            description: 'Visualizing datasets and finding trends.',
            flow: [
                { engineId: 'graph', durationEstimate: 20000, autoAdvance: false },
                { engineId: 'formula', durationEstimate: 5000, autoAdvance: true },
                { engineId: 'quiz', durationEstimate: 0, autoAdvance: false }
            ],
            assessmentType: 'analytical',
            interactionStyle: 'exploratory',
            learningObjectives: ['Interpret charts', 'Identify trends in data']
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

        // 1. Explicit Modality Overrides (Highest Priority)
        // If they explicitly ask for a graph, chart, or data plot, we MUST give them a graph strategy.
        if (i.includes('graph') || i.includes('chart') || i.includes('plot') || i.includes('data') || i.includes('statistics')) {
            // If it's an economics graph, we can use the economic principle strategy which has a graph.
            if (i.includes('supply') || i.includes('demand') || i.includes('inflation') || i.includes('economy')) {
                return 'economic_principle';
            }
            return 'data_analysis';
        }

        // If they explicitly ask for anatomy, organ, or body
        if (i.includes('anatomy') || i.includes('organ') || i.includes('body') || i.includes('heart') || i.includes('brain')) {
            return 'biological_structure';
        }

        // If they explicitly ask for molecular, chemistry, atom
        if (i.includes('molecule') || i.includes('atom') || i.includes('chemical') || i.includes('chemistry')) {
            return 'scientific_process'; // (Scientific process mounts the molecular engine)
        }

        // 2. Subject-Based Fallbacks
        if (i.includes('supply') || i.includes('demand') || i.includes('inflation') || i.includes('economy')) {
            return 'economic_principle';
        }
        if (i.includes('calculus') || i.includes('algebra') || i.includes('geometry') || i.includes('theorem') || i.includes('math') || i.includes('derive')) {
            return 'mathematical_derivation';
        }
        if (i.includes('biology') || i.includes('dna') || i.includes('cell')) {
            return 'biological_structure';
        }
        if (i.includes('physics') || i.includes('projectile') || i.includes('photosynthesis')) {
            return 'scientific_process';
        }
        
        // 3. Fallback generic strategy
        return 'scientific_process';
    }
}

export const LessonStrategyRegistry = new LessonStrategyRegistryImpl();
