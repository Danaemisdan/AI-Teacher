import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { motion } from 'framer-motion';

interface EquationViewerProps {
    query: string;
}

export default function EquationViewer({ query }: EquationViewerProps) {
    // Basic cleanup of equation string if it contains markdown math wrappers or natural language prefixes
    let cleanEquation = query
        .replace(/^\$\$/, '')
        .replace(/\$\$$/, '')
        .replace(/^\$/, '')
        .replace(/\$$/, '')
        .trim();
        
    // Sometimes the LLM includes a prefix like "Combustion Equation: " inside the query field. Strip it out.
    cleanEquation = cleanEquation.replace(/^[a-zA-Z\s]+:\s*/, '');

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(100,100,255,0.2)] border border-blue-500/30 bg-black flex flex-col items-center justify-center p-8">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#0000ff] animate-pulse"></span>
                        <span className="text-blue-400 font-mono text-sm tracking-widest uppercase">Equation Engine</span>
                    </div>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-white text-5xl md:text-7xl font-light"
                style={{ textShadow: '0 0 20px rgba(100,100,255,0.4)' }}
            >
                <BlockMath math={cleanEquation} />
            </motion.div>

            <div className="absolute bottom-6 left-6 z-10 pointer-events-none text-white/40 text-xs font-mono">
                Powered by KaTeX
            </div>
        </div>
    );
}
