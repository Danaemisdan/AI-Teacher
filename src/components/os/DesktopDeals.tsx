'use client'
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Box, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const inventory = [
    { id: 't1', title: '5KVA Solar Inverter', price: 1200, category: 'Tech', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=400&auto=format&fit=crop', top: '15%', left: '10%' },
    { id: 't2', title: 'Solar Battery 200Ah', price: 450, category: 'Tech', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400&auto=format&fit=crop', top: '45%', left: '15%' },
    { id: 't3', title: 'Smartphone Pro Max', price: 1099, category: 'Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop', top: '20%', left: '70%' },
    { id: 'g1', title: 'Parboiled Rice 50kg', price: 45, category: 'Groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop', top: '60%', left: '75%' },
    { id: 'p1', title: 'First Aid Kit', price: 25, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=400&auto=format&fit=crop', top: '35%', left: '80%' }
];

export default function DesktopDeals({ activeStore, workflowState, currentTask, aiProducts }: any) {
    const { addToCart } = useCart();
    
    const displayedItems = useMemo(() => {
        if (workflowState !== 'IDLE' && aiProducts && aiProducts.length > 0) {
            return aiProducts;
        }
        if (workflowState !== 'IDLE') return []; // Empty while researching initially
        if (activeStore === 'All') return inventory;
        return inventory.filter(p => p.category === activeStore);
    }, [activeStore, workflowState, aiProducts]);

    return (
        <div className="absolute inset-0 z-0 p-24 overflow-hidden pointer-events-none">
            <AnimatePresence>
                {workflowState === 'READY' && displayedItems.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-40 pointer-events-auto"
                    >
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">Deal Secured</h2>
                                <p className="text-white/60 text-sm font-medium mt-1">Agent verified products matching your intent.</p>
                            </div>
                        </div>
                        
                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8 flex justify-between items-center relative z-10 shadow-inner">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Total Execution Value</p>
                                <p className="text-5xl font-extrabold text-white mt-1 tracking-tighter">
                                    ${displayedItems.reduce((acc: number, item: any) => acc + (item.price * 0.9), 0).toFixed(0)}
                                </p>
                            </div>
                            <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-4 py-2 rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                Automated Discount
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => displayedItems.forEach((i: any) => addToCart({ ...i, price: i.price * 0.9 }))}
                            className="relative z-10 w-full py-5 bg-white hover:bg-white/90 text-black font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            <Box className="w-6 h-6" /> Execute Auto-Purchase Bundle
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {displayedItems.map((item: any, idx: number) => {
                    const isNegotiated = workflowState === 'NEGOTIATING' || workflowState === 'READY';
                    // We'll give AI items a scattered position if they don't have top/left predefined
                    const top = item.top || `${30 + (idx * 5)}%`;
                    const left = item.left || `${15 + (idx * 25)}%`;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
                            style={{ 
                                top: workflowState !== 'IDLE' ? '30%' : top, 
                                left: workflowState !== 'IDLE' ? `${15 + (idx * 30)}%` : left 
                            }}
                            drag
                            dragConstraints={{ top: 50, left: 50, right: 1000, bottom: 600 }}
                        >
                            <div className={`w-[260px] rounded-[1.5rem] overflow-hidden backdrop-blur-2xl border shadow-2xl transition-all duration-700 ${isNegotiated ? 'bg-emerald-900/40 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-white/10 border-white/20'}`}>
                                <div className="h-36 relative">
                                    <img src={item.image || 'https://images.unsplash.com/photo-1550572017-edb302c388d7?q=80&w=400&auto=format&fit=crop'} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white/80 font-bold text-xs uppercase tracking-widest drop-shadow-md">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-4 truncate drop-shadow-md">{item.title}</h3>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Current Price</p>
                                            <p className="text-white font-extrabold text-2xl flex items-center gap-2 drop-shadow-lg">
                                                ${isNegotiated ? (item.price * 0.9).toFixed(0) : item.price}
                                                {isNegotiated && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]">Negotiated</span>}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => addToCart({ ...item, price: isNegotiated ? item.price * 0.9 : item.price })}
                                            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all border border-white/10 hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            <ShoppingBag className="w-5 h-5 drop-shadow-md" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
