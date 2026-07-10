import { GraphTemplate } from '../../GraphTemplateRegistry';

export const GenericLineTemplate: GraphTemplate = {
    id: 'Generic_Line',
    category: 'statistics',
    name: 'Generic Line Graph',
    description: 'A versatile line graph for any continuous dataset (e.g. over time).',
    dataRequirements: {
        curves: ['Dataset 1'],
        variables: []
    },
    baseSpec: {
        title: 'Line Graph',
        graph_type: 'Generic_Line',
        library: 'echarts',
        axes: {
            x: 'X-Axis',
            y: 'Y-Axis'
        },
        curves: [
            {
                name: 'Dataset 1',
                type: 'line',
                color: '#3b82f6', // Blue
                points: [[0,0], [1,1], [2,2], [3,3], [4,4], [5,5]] // Bulletproof default points
            }
        ]
    },
    animationSequence: [
        { step: 1, action: 'draw_axes', narrationSync: 'Here are the axes.' },
        { step: 2, action: 'plot_curve', targetId: 'Dataset 1', narrationSync: 'And here is the data trend.' }
    ]
};
