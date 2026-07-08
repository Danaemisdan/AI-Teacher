import { GraphSpec } from '@/components/GraphEngine/types';
import { RendererHealthManager } from '../RendererHealthManager';

export class GraphSpecificationValidator {
    
    /**
     * Validates the populated GraphSpec before it reaches the Renderer Adapters.
     * Prevents runtime crashes from malformed AI data.
     */
    public static validate(spec: GraphSpec): boolean {
        if (!spec) return false;
        
        // Ensure library is requested
        if (!spec.library) return false;

        // Ensure at least one curve or formula
        if ((!spec.curves || spec.curves.length === 0) && !spec.formula) {
            console.warn("Validation Failed: No curves or formulas present.");
            return false;
        }

        // Check if curves have essential data based on type
        if (spec.curves) {
            for (const curve of spec.curves) {
                if (spec.library === 'jsxgraph') {
                    if (!curve.func && (!curve.points || curve.points.length === 0)) {
                        console.warn(`Validation Failed: JSXGraph curve '${curve.name}' missing both func and points.`);
                        return false;
                    }
                } else if (spec.library === 'plotly' || spec.library === 'echarts') {
                    if (!curve.points || curve.points.length === 0) {
                        console.warn(`Validation Failed: ${spec.library} curve '${curve.name}' missing points.`);
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
