import React from 'react';
import MolecularViewer from './MolecularViewer';
import EquationViewer from './EquationViewer';
import PeriodicTable from './PeriodicTable';
import AssetViewer from './AssetViewer';
import ErrorBoundary from './ErrorBoundary';
import { safeJsonParse } from '@/lib/jsonHelper';

interface ChemistryRouterProps {
    spec: string;
}

export default function ChemistryRouter({ spec }: ChemistryRouterProps) {
    try {
        const data = safeJsonParse<any>(spec, null);
        
        if (!data) {
            return <div className="p-4 text-rose-400 font-mono">Invalid Chemistry Configuration</div>;
        }

        const { visualization_type, query, reaction } = data;

        let content = null;
        switch (visualization_type) {
            case 'molecule_view':
            case 'organic_structure':
            case 'crystal_structure':
            case 'biomolecule':
                // Route all 3D requests to MolecularViewer which handles PubChem data
                content = <MolecularViewer query={query} />;
                break;
                
            case 'equation':
                content = <EquationViewer query={reaction || query} />;
                break;
                
            case 'periodic_table':
                content = <PeriodicTable query={query} />;
                break;
                
            default:
                // Fallback for unsupported Phase 1 items (like reaction_animation)
                content = <AssetViewer query={query} mode="image" />;
                break;
        }

        return (
            <div className="w-full max-w-5xl h-[60vh] min-h-[400px]">
                <ErrorBoundary fallback={
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-rose-900/20 border border-rose-500/30 rounded-xl">
                        <div className="text-rose-400 mb-2 font-mono">Failed to render visualization</div>
                        <div className="text-sm text-slate-400">Please try a different molecule or equation.</div>
                    </div>
                }>
                    {content}
                </ErrorBoundary>
            </div>
        );
    } catch (error) {
        console.error("ChemistryRouter Error:", error);
        return <div className="p-4 text-rose-400 font-mono">Error parsing chemistry specification</div>;
    }
}
