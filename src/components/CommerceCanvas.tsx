'use client'
import React, { useEffect, useState } from 'react';
import { Network, TrendingDown, CheckCircle2, ShoppingCart, Zap, Box, ShieldCheck, Clock } from 'lucide-react';
import { WorkflowState } from '@/app/page';

export default function CommerceCanvas({ workflowState, currentTask }: { workflowState: WorkflowState, currentTask: string }) {
    const [vendors, setVendors] = useState<any[]>([]);
    
    // Simulate data populating during states
    useEffect(() => {
        if (workflowState === 'IDLE') {
            setVendors([]);
        } else if (workflowState === 'RESEARCHING') {
            setTimeout(() => {
                setVendors([
                    { name: 'GlobalTech Distro', price: 2150, rating: 4.8, shipping: '2 days' },
                    { name: 'EcoEnergy Supplies', price: 2300, rating: 4.9, shipping: '1 day' },
                    { name: 'Solaris Inc.', price: 2050, rating: 4.2, shipping: '5 days' }
                ]);
            }, 1500);
        } else if (workflowState === 'NEGOTIATING') {
            setTimeout(() => {
                setVendors(prev => prev.map(v => 
                    v.name === 'GlobalTech Distro' ? { ...v, price: 1850, note: 'Agent negotiated 14% volume discount' } : v
                ));
            }, 2500);
        }
    }, [workflowState]);

    if (workflowState === 'IDLE') {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black">
                <div className="text-center opacity-30 flex flex-col items-center">
                    <Network className="h-24 w-24 text-gray-500 mb-6 animate-[pulse_4s_ease-in-out_infinite]" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Nexmart Global Canvas</h1>
                    <p className="text-gray-400 mt-2 tracking-wide">Awaiting Agent Initialization</p>
                </div>
            </div>
        );
    }

    const optimalVendor = vendors.find(v => v.name === 'GlobalTech Distro');

    return (
        <div className="h-full w-full bg-[#0a0a0a] overflow-y-auto p-12 custom-scrollbar relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
            
            <div className="relative z-10">
                {/* Top Bar Status */}
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-800">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Active Procurement Protocol</h1>
                        <p className="text-gray-400 font-mono text-sm">{currentTask}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${workflowState === 'RESEARCHING' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-gray-800 text-gray-600'}`}>
                            <Network className="h-4 w-4" /> Research
                        </div>
                        <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${workflowState === 'NEGOTIATING' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-gray-800 text-gray-600'}`}>
                            <TrendingDown className="h-4 w-4" /> Negotiate
                        </div>
                        <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${workflowState === 'READY' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-gray-800 text-gray-600'}`}>
                            <CheckCircle2 className="h-4 w-4" /> Ready
                        </div>
                    </div>
                </div>

                {/* Research Grid */}
                {(workflowState === 'RESEARCHING' || workflowState === 'NEGOTIATING' || workflowState === 'READY') && (
                    <div className="mb-12">
                        <h3 className="text-sm uppercase tracking-widest font-bold text-gray-500 mb-6">Live Vendor Feed</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {vendors.map((vendor, idx) => (
                                <div key={idx} className={`bg-gray-900 border ${vendor.name === 'GlobalTech Distro' && workflowState !== 'RESEARCHING' ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-gradient-to-b from-gray-900 to-emerald-950/20' : 'border-gray-800'} rounded-2xl p-6 relative overflow-hidden transition-all duration-700`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-lg text-white">{vendor.name}</h4>
                                        <div className="bg-gray-950 border border-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-400 flex items-center gap-1">
                                            ⭐ {vendor.rating}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Current Offer</p>
                                        <p className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                                            ${vendor.price}
                                            {vendor.note && <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse whitespace-nowrap">Negotiated!</span>}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-6 pt-4 border-t border-gray-800">
                                        <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-blue-400"/> {vendor.shipping}</span>
                                        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-400"/> Verified</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Final Execution Bundle */}
                {workflowState === 'READY' && optimalVendor && (
                    <div className="bg-gradient-to-br from-[#052e16] to-[#022c22] border border-emerald-500/30 rounded-3xl p-10 animate-[fadeIn_1s_ease-out] shadow-[0_20px_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 bg-emerald-500/20 blur-[100px] h-64 w-64 rounded-full pointer-events-none"></div>
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                        <Zap className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Optimal Deal Secured</h2>
                                </div>
                                <p className="text-emerald-100/70 text-lg mt-4 max-w-lg leading-relaxed">The agent has successfully negotiated a 14% discount with GlobalTech Distro and verified 2-day priority logistics.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-emerald-200/50 mb-1 uppercase tracking-widest font-bold">Final Transaction Total</p>
                                <p className="text-6xl font-extrabold text-white tracking-tighter">${optimalVendor.price}</p>
                                <p className="text-sm text-emerald-400 font-bold mt-2 bg-emerald-400/10 inline-block px-3 py-1 rounded-full border border-emerald-400/20">Saved $300 via AI Haggle</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-emerald-800/50 flex justify-end relative z-10">
                            <button className="bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all duration-300 font-extrabold text-lg px-12 py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3 group">
                                <Box className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                Execute Auto-Purchase
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
