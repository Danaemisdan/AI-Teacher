import { GraphTemplate } from '../../GraphTemplateRegistry';

export const SupplyDemandTemplate: GraphTemplate = {
    id: 'Supply_Demand',
    category: 'economics',
    name: 'Supply and Demand',
    description: 'A standard supply and demand market equilibrium graph.',
    dataRequirements: {
        curves: ['Demand', 'Supply'],
        variables: ['equilibrium_price', 'equilibrium_quantity']
    },
    baseSpec: {
        title: 'Market Equilibrium',
        graph_type: 'Supply_Demand',
        library: 'echarts', // ECharts is great for interactive lines
        axes: {
            x: 'Quantity (Q)',
            y: 'Price (P)'
        },
        curves: [
            {
                name: 'Demand',
                type: 'line',
                color: '#ef4444', // Red
                points: [[0, 100], [20, 80], [40, 60], [60, 40], [80, 20], [100, 0]]
            },
            {
                name: 'Supply',
                type: 'line',
                color: '#3b82f6', // Blue
                points: [[0, 0], [20, 20], [40, 40], [60, 60], [80, 80], [100, 100]]
            }
        ]
    },
    animationSequence: [
        { step: 1, action: 'draw_axes', narrationSync: 'Let us draw the axes.' },
        { step: 2, action: 'plot_curve', targetId: 'Demand', narrationSync: 'The demand curve slopes downward.' },
        { step: 3, action: 'plot_curve', targetId: 'Supply', narrationSync: 'The supply curve slopes upward.' },
        { step: 4, action: 'highlight_point', narrationSync: 'The intersection is the market equilibrium.' }
    ]
};
