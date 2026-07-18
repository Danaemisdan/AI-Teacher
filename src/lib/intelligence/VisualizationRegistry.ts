import { SubjectType } from './types';

// Registry maps Subjects to ranked lists of suitable Visualization Engines.
// The engine at index 0 is the primary/preferred engine.
const VISUALIZATION_MAP: Record<SubjectType, string[]> = {
    'Mathematics': ['katex', 'jsxgraph'],
    'Physics': ['jsxgraph', 'threejs'],
    'Chemistry': ['molstar', '3dmol'],
    'Biology': ['threejs', 'svg-diagram'],
    'Anatomy': ['threejs', 'interactive-svg'],
    'Astronomy': ['threejs'],
    'Programming': ['monaco-editor', 'mermaid'],
    'Computer Science': ['mermaid', 'graphviz'],
    'Networking': ['mermaid'],
    'History': ['timeline-engine', 'interactive-timeline'],
    'Geography': ['interactive-maps', 'svg-maps'],
    'Civics': ['government-hierarchy-engine'],
    'Economics': ['echarts'],
    'Finance': ['echarts'],
    'Business': ['flowchart-engine'],
    'Architecture': ['threejs', 'svg-floorplans'],
    'AI/Machine Learning': ['neural-network-diagrams', 'mermaid-pipelines'],
    'General': ['html']
};

export class VisualizationRegistry {
    /**
     * Gets all valid engines for a given subject.
     */
    static getEnginesForSubject(subject: SubjectType): string[] {
        return VISUALIZATION_MAP[subject] || ['html'];
    }

    /**
     * Gets the primary (preferred) engine for a given subject.
     */
    static getPrimaryEngineForSubject(subject: SubjectType): string {
        const engines = this.getEnginesForSubject(subject);
        return engines[0];
    }
}
