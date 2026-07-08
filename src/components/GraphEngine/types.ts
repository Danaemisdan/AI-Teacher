export interface GraphCurve {
    name?: string;
    type: 'line' | 'bar' | 'scatter' | 'area';
    points?: number[][]; // [[x,y], [x,y]]
    func?: string; // e.g. "x^2 + 2x" for JSXGraph
    color?: string;
}

export interface GraphSpec {
    title?: string;
    graph_type: string;
    library: 'echarts' | 'plotly' | 'jsxgraph' | 'formula';
    axes?: {
        x?: string;
        y?: string;
    };
    curves?: GraphCurve[];
    explanation?: string;
    formula?: string;
}

export interface AdapterProps {
    spec: GraphSpec;
    onError: (error: Error) => void;
    animationStep?: number;
}
