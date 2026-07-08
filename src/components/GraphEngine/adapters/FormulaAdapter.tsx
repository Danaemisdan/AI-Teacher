'use client';
import React from 'react';
import { AdapterProps } from '../types';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function FormulaAdapter({ spec }: AdapterProps) {
    if (!spec.formula) return null;
    return (
        <div className="w-full py-12 flex justify-center text-4xl text-slate-800 overflow-x-auto">
            <BlockMath math={spec.formula} />
        </div>
    );
}
