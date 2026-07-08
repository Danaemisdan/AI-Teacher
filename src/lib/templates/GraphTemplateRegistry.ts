import { GraphSpec } from '@/components/GraphEngine/types';

export interface GraphTemplate {
    id: string;
    category: 'economics' | 'finance' | 'mathematics' | 'statistics' | 'physics' | 'chemistry' | 'business';
    name: string;
    description: string;
    baseSpec: GraphSpec;
    dataRequirements: {
        curves: string[]; // e.g. ['Demand', 'Supply']
        variables: string[]; // e.g. ['equilibrium_price', 'equilibrium_quantity']
    };
    animationSequence: {
        step: number;
        action: 'draw_axes' | 'plot_curve' | 'highlight_point' | 'shade_area' | 'show_label';
        targetId?: string;
        narrationSync?: string;
    }[];
}

import { SupplyDemandTemplate } from './graph_templates/economics/supply_demand';
import { GenericLineTemplate } from './graph_templates/generic/line';
import { GenericBarTemplate } from './graph_templates/generic/bar';

class GraphTemplateRegistryImpl {
    private templates: Map<string, GraphTemplate> = new Map();

    constructor() {
        this.register(SupplyDemandTemplate);
        this.register(GenericLineTemplate);
        this.register(GenericBarTemplate);
    }

    public register(template: GraphTemplate) {
        this.templates.set(template.id, template);
    }

    public getTemplate(id: string): GraphTemplate | null {
        return this.templates.get(id) || null;
    }

    public getAllTemplates(): GraphTemplate[] {
        return Array.from(this.templates.values());
    }

    public getTemplatesByCategory(category: string): GraphTemplate[] {
        return this.getAllTemplates().filter(t => t.category === category);
    }
}

export const GraphTemplateRegistry = new GraphTemplateRegistryImpl();
