import { GraphTemplate } from '../GraphTemplateRegistry';

export const GenericBarTemplate: GraphTemplate = {
    id: 'Generic_Bar',
    category: 'statistics',
    name: 'Generic Bar Chart',
    description: 'A versatile bar chart for categorical data comparisons.',
    dataRequirements: {
        curves: ['Category Data'],
        variables: []
    },
    baseSpec: {
        title: 'Bar Chart',
        graph_type: 'Generic_Bar',
        library: 'echarts',
        axes: {
            x: 'Categories',
            y: 'Values'
        },
        curves: [
            {
                name: 'Category Data',
                type: 'bar',
                color: '#10b981', // Emerald
                points: [["A", 10], ["B", 20], ["C", 15], ["D", 30]] // Bulletproof default points
            }
        ]
    },
    animationSequence: [
        { step: 1, action: 'draw_axes', narrationSync: 'Here are the axes.' },
        { step: 2, action: 'plot_curve', targetId: 'Category Data', narrationSync: 'And here is the categorical data.' }
    ]
};
