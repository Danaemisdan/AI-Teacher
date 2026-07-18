import { TopicAnalysis, ValidationResult } from './types';
import { VisualizationRegistry } from './VisualizationRegistry';

export class ValidationEngine {
    /**
     * Runs strict educational rules against the generated Topic Analysis to ensure
     * pedagogical soundness before the blueprint is finalized.
     */
    static validate(analysis: TopicAnalysis): ValidationResult {
        const warnings: string[] = [];

        // 1. Confidence Thresholds
        if (analysis.confidenceScores.overall < 80) {
            warnings.push(`Low overall planning confidence (${analysis.confidenceScores.overall}%). Manual review recommended.`);
        }

        // 2. Strict Subject-Visualization Enforcement
        const validEngines = VisualizationRegistry.getEnginesForSubject(analysis.subject);
        
        if (!validEngines.includes(analysis.visualization)) {
            // Check if it's a known fallback, if not, it's a fail
            return {
                status: 'FAIL',
                message: `The selected visualization engine '${analysis.visualization}' is NOT supported for the subject '${analysis.subject}'. Supported engines are: ${validEngines.join(', ')}.`
            };
        }

        // Specific Rules matching requirements
        if (analysis.subject === 'Economics' && analysis.visualization !== 'echarts') {
            return { status: 'FAIL', message: 'Economics topics MUST use the ECharts engine.' };
        }
        
        if (analysis.subject === 'History' && !analysis.visualization.includes('timeline')) {
            warnings.push('History topics typically require a timeline visualization. Found: ' + analysis.visualization);
        }

        if (analysis.subject === 'Programming' && analysis.visualization !== 'monaco-editor') {
            warnings.push('Programming topics usually require the Monaco Editor. Found: ' + analysis.visualization);
        }

        if (analysis.subject === 'Anatomy' && analysis.visualization !== 'threejs') {
            return { status: 'FAIL', message: 'Anatomy topics MUST use ThreeJS for 3D human models.' };
        }

        if (analysis.subject === 'Astronomy' && analysis.visualization !== 'threejs') {
            return { status: 'FAIL', message: 'Astronomy topics MUST use ThreeJS for spatial models.' };
        }

        if (analysis.subject === 'Networking' && analysis.visualization !== 'mermaid') {
            return { status: 'FAIL', message: 'Networking topics MUST use Mermaid for topology diagrams.' };
        }

        // 3. Status assignment
        if (warnings.length > 0) {
            return {
                status: 'WARNING',
                message: warnings.join(' | ')
            };
        }

        return {
            status: 'PASS',
            message: 'All validation rules passed.'
        };
    }
}
