import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElementData {
    symbol: string;
    name: string;
    atomicNumber: number;
    mass: string;
    group: number;
    period: number;
    category: 'nonmetal' | 'noble_gas' | 'alkali_metal' | 'alkaline_earth' | 'metalloid' | 'halogen' | 'transition';
}

// Minimal Periodic Table dataset for demonstration
const elements: ElementData[] = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, mass: '1.008', group: 1, period: 1, category: 'nonmetal' },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, mass: '4.0026', group: 18, period: 1, category: 'noble_gas' },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, mass: '6.94', group: 1, period: 2, category: 'alkali_metal' },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, mass: '9.0122', group: 2, period: 2, category: 'alkaline_earth' },
    { symbol: 'B', name: 'Boron', atomicNumber: 5, mass: '10.81', group: 13, period: 2, category: 'metalloid' },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, mass: '12.011', group: 14, period: 2, category: 'nonmetal' },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, mass: '14.007', group: 15, period: 2, category: 'nonmetal' },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, mass: '15.999', group: 16, period: 2, category: 'nonmetal' },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, mass: '18.998', group: 17, period: 2, category: 'halogen' },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10, mass: '20.180', group: 18, period: 2, category: 'noble_gas' },
    { symbol: 'Na', name: 'Sodium', atomicNumber: 11, mass: '22.990', group: 1, period: 3, category: 'alkali_metal' },
    { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, mass: '24.305', group: 2, period: 3, category: 'alkaline_earth' },
    { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, mass: '26.982', group: 13, period: 3, category: 'metalloid' },
    { symbol: 'Si', name: 'Silicon', atomicNumber: 14, mass: '28.085', group: 14, period: 3, category: 'metalloid' },
    { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, mass: '30.974', group: 15, period: 3, category: 'nonmetal' },
    { symbol: 'S', name: 'Sulfur', atomicNumber: 16, mass: '32.06', group: 16, period: 3, category: 'nonmetal' },
    { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, mass: '35.45', group: 17, period: 3, category: 'halogen' },
    { symbol: 'Ar', name: 'Argon', atomicNumber: 18, mass: '39.95', group: 18, period: 3, category: 'noble_gas' },
];

const categoryColors = {
    nonmetal: 'bg-green-500/20 border-green-500/50 text-green-300',
    noble_gas: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
    alkali_metal: 'bg-red-500/20 border-red-500/50 text-red-300',
    alkaline_earth: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
    metalloid: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    halogen: 'bg-teal-500/20 border-teal-500/50 text-teal-300',
    transition: 'bg-blue-500/20 border-blue-500/50 text-blue-300'
};

export default function PeriodicTable({ query }: { query: string }) {
    const [selected, setSelected] = useState<ElementData | null>(null);

    // Auto-select if query matches an element
    React.useEffect(() => {
        if (query) {
            const match = elements.find(e => 
                e.name.toLowerCase() === query.toLowerCase() || 
                e.symbol.toLowerCase() === query.toLowerCase()
            );
            if (match) setSelected(match);
        }
    }, [query]);

    // Build grid (18 columns, 3 rows)
    const grid = Array.from({ length: 3 }, () => Array.from({ length: 18 }, () => null as ElementData | null));
    elements.forEach(el => {
        if (el.period <= 3 && el.group <= 18) {
            grid[el.period - 1][el.group - 1] = el;
        }
    });

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,0,255,0.15)] border border-fuchsia-500/30 bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-bold text-fuchsia-400 mb-8 tracking-widest uppercase" style={{ textShadow: '0 0 15px rgba(255,0,255,0.4)' }}>
                Periodic Table of Elements
            </h2>

            <div className="flex gap-8 items-start justify-center w-full max-w-5xl">
                {/* The Grid */}
                <div className="grid grid-cols-18 gap-1 flex-1">
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 mb-1">
                            {row.map((el, colIndex) => (
                                <div key={colIndex} className="w-12 h-12">
                                    {el ? (
                                        <motion.button
                                            whileHover={{ scale: 1.1, zIndex: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelected(el)}
                                            className={`w-full h-full border flex flex-col items-center justify-center rounded-sm transition-colors duration-300 relative cursor-pointer ${categoryColors[el.category]} ${selected?.symbol === el.symbol ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'opacity-70 hover:opacity-100'}`}
                                        >
                                            <span className="text-[8px] absolute top-0.5 left-1 opacity-60">{el.atomicNumber}</span>
                                            <span className="text-lg font-bold">{el.symbol}</span>
                                        </motion.button>
                                    ) : (
                                        <div className="w-full h-full"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Details Panel */}
                <AnimatePresence mode="wait">
                    {selected ? (
                        <motion.div 
                            key={selected.symbol}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`w-64 p-6 rounded-xl border ${categoryColors[selected.category]} flex flex-col gap-4 shadow-xl`}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-5xl font-black">{selected.symbol}</span>
                                <span className="text-xl opacity-60">{selected.atomicNumber}</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{selected.name}</h3>
                                <div className="text-sm opacity-80 uppercase tracking-wider">{selected.category.replace('_', ' ')}</div>
                            </div>
                            <div className="flex flex-col gap-1 text-sm mt-4">
                                <div className="flex justify-between border-b border-white/10 pb-1">
                                    <span className="opacity-60">Atomic Mass</span>
                                    <span>{selected.mass}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-1">
                                    <span className="opacity-60">Group</span>
                                    <span>{selected.group}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-1">
                                    <span className="opacity-60">Period</span>
                                    <span>{selected.period}</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-64 p-6 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-center opacity-50">
                            Select an element to view details.
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
