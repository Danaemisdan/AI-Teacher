'use client'
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const inventory = [
    // Tech
    { id: 't1', title: '5KVA Solar Inverter', price: 1200, category: 'Tech', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop' },
    { id: 't2', title: 'Solar Battery 200Ah', price: 450, category: 'Tech', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=600&auto=format&fit=crop' },
    { id: 't3', title: 'Smartphone Pro Max', price: 1099, category: 'Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop' },
    { id: 't4', title: 'Noise-Cancelling Headphones', price: 299, category: 'Tech', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' },
    { id: 't5', title: 'Ultra-Wide 4K Monitor', price: 650, category: 'Tech', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop' },
    // Groceries
    { id: 'g1', title: 'Parboiled Rice 50kg', price: 45, category: 'Groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
    { id: 'g2', title: 'Artisan Coffee Beans 1kg', price: 28, category: 'Groceries', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop' },
    { id: 'g3', title: 'Organic Olive Oil 1L', price: 18, category: 'Groceries', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop' },
    // Pharmacy
    { id: 'p1', title: 'First Aid Kit', price: 25, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=600&auto=format&fit=crop' },
    { id: 'p2', title: 'Daily Multivitamins', price: 15, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop' },
    { id: 'p3', title: 'Whey Protein Isolate', price: 55, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600&auto=format&fit=crop' },
    { id: 'p4', title: 'Digital Thermometer', price: 12, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=600&auto=format&fit=crop' },
    // Financial
    { id: 'f1', title: 'Premium Health Insurance', price: 120, category: 'Financial', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?q=80&w=600&auto=format&fit=crop' },
    { id: 'f2', title: 'Global Travel Insurance', price: 45, category: 'Financial', image: 'https://images.unsplash.com/photo-1502920514313-525810c2a66d?q=80&w=600&auto=format&fit=crop' },
    // Fashion
    { id: 'fa1', title: 'Minimalist Cotton T-Shirt', price: 29, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop' },
    { id: 'fa2', title: 'Classic Denim Jacket', price: 89, category: 'Fashion', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600&auto=format&fit=crop' },
    // Home
    { id: 'h1', title: 'Modern Ceramic Vase', price: 35, category: 'Home', image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=600&auto=format&fit=crop' },
    { id: 'h2', title: 'Linen Throw Blanket', price: 65, category: 'Home', image: 'https://images.unsplash.com/photo-1580556882412-25807185c7bb?q=80&w=600&auto=format&fit=crop' }
];

const categories = ['Tech', 'Groceries', 'Pharmacy', 'Fashion', 'Home', 'Financial'];

export default function AgenticGrid({ activeStore, workflowState, aiProducts }: any) {
    const { addToCart } = useCart();
    
    const displayedItems = useMemo(() => {
        if (workflowState !== 'IDLE') {
            return aiProducts && aiProducts.length > 0 ? aiProducts : [];
        }
        if (activeStore === 'All') return inventory; // We handle grouping in render
        return inventory.filter(p => p.category === activeStore);
    }, [activeStore, workflowState, aiProducts]);

    const isSearching = workflowState !== 'IDLE';
    const isHomescreen = !isSearching && activeStore === 'All';

    const renderCard = (item: any, idx: number) => {
        const isNegotiated = workflowState === 'NEGOTIATING' || workflowState === 'READY';
        const price = isNegotiated ? item.price * 0.9 : item.price;
        
        return (
            <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="group flex flex-col w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
                {/* Image Container (Amazon style) */}
                <div className="h-56 w-full relative bg-white p-4 flex items-center justify-center border-b border-gray-100">
                    <img src={item.image} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    
                    {isNegotiated && (
                        <div className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm">
                            Limited Time Deal
                        </div>
                    )}
                </div>

                {/* Details (Amazon style) */}
                <div className="flex flex-col p-4 pt-3 flex-grow">
                    <h3 className="text-[#0F1111] text-[15px] leading-snug line-clamp-2 hover:text-[#C7511F] cursor-pointer mb-1.5">{item.title}</h3>
                    
                    {/* Fake Ratings */}
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-[#FFA41C] text-sm">
                            ★★★★<span className="text-gray-300">★</span>
                        </div>
                        <span className="text-[#007185] text-xs hover:text-[#C7511F] hover:underline cursor-pointer">1,234</span>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-0.5 mt-auto">
                        <span className="text-[13px] text-[#0F1111] relative top-[-0.4em]">$</span>
                        <span className="text-[28px] font-medium text-[#0F1111] leading-none">{Math.floor(price)}</span>
                        <span className="text-[13px] text-[#0F1111] relative top-[-0.4em]">{(price % 1).toFixed(2).substring(2)}</span>
                        {isNegotiated && (
                            <span className="text-[12px] text-[#565959] line-through ml-1.5">List: ${item.price.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Delivery */}
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shadow-sm border border-emerald-100">In Stock</span>
                        <span className="text-xs text-[#565959] font-medium">Fast Delivery</span>
                    </div>
                    <div className="text-[12px] text-[#565959] mt-1 mb-3">
                        Ships securely via Nexmart
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                        onClick={() => addToCart({ ...item, price })}
                        className="mt-auto w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] font-medium py-2 rounded-full border border-[#FCD200] hover:border-[#F2C200] shadow-sm transition-colors"
                    >
                        Add to cart
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="absolute inset-0 z-0 overflow-y-auto custom-scrollbar pt-[240px] pb-40 px-6 md:px-12">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Agent Status Banner (Glassmorphic) */}
                <AnimatePresence>
                    {workflowState === 'READY' && displayedItems.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-8 mb-12 shadow-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Agent Procurement Successful</h2>
                                    <p className="text-gray-500 text-sm font-medium">Negotiated prices applied to verified items.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => displayedItems.forEach((i: any) => addToCart({ ...i, price: i.price * 0.9 }))}
                                className="bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                            >
                                Auto-Purchase All <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Storefront Headers (Minimalist) */}
                {isHomescreen && (
                    <div className="mb-12 flex flex-col items-center text-center">
                        <h1 className="text-[32px] md:text-[44px] font-bold text-gray-900 mb-4 tracking-tight drop-shadow-sm">
                            Shop seamlessly with AI.
                        </h1>
                        <p className="text-gray-500 text-lg max-w-lg font-medium">
                            Ask the agent to find what you need, or explore our curated collections below.
                        </p>
                    </div>
                )}

                {/* Promotional Flash Deals (Bento Grid Style) */}
                {isHomescreen && (
                    <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Primary Deal Banner (Solar) - HORIZONTAL (Span 2 cols) */}
                        <div className="md:col-span-2 row-span-1 relative overflow-hidden rounded-[2rem] group shadow-sm border border-gray-100 flex items-center">
                            <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
                            
                            <div className="relative z-10 p-10 max-w-md text-left">
                                <div className="inline-flex items-center gap-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-red-500/30">
                                    Flash Deal
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">Solar Energy Essentials.</h2>
                                <p className="text-gray-300 text-sm font-medium mb-6">Save up to 30% on premium solar inverters and 200Ah batteries. AI-negotiated pricing.</p>
                                <button className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-xl text-sm">
                                    Shop the Deal
                                </button>
                            </div>
                        </div>

                        {/* Secondary Deal Banner (Tech/Audio) - VERTICAL (Span 2 rows) */}
                        <div className="md:col-span-1 row-span-2 relative overflow-hidden rounded-[2rem] group shadow-sm border border-gray-100 flex items-end">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-900/60 to-transparent" />
                            
                            <div className="relative z-10 p-8 w-full text-left">
                                <div className="inline-flex items-center gap-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-blue-500/30">
                                    Limited Time
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-3 leading-tight">Premium Audio Gear.</h2>
                                <p className="text-blue-100 text-sm font-medium mb-6">Immerse yourself. Get the highest-rated noise-cancelling headphones before they sell out.</p>
                                
                                {/* Countdown Timer */}
                                <div className="flex items-center gap-1.5 mb-6">
                                    <div className="bg-white/10 backdrop-blur-md text-white font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/20">01<span className="text-[10px] ml-1 text-blue-200">HRS</span></div>
                                    <span className="text-white/50 font-black">:</span>
                                    <div className="bg-white/10 backdrop-blur-md text-white font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/20">45<span className="text-[10px] ml-1 text-blue-200">MIN</span></div>
                                    <span className="text-white/50 font-black">:</span>
                                    <div className="bg-white/10 backdrop-blur-md text-white font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/20">22<span className="text-[10px] ml-1 text-blue-200">SEC</span></div>
                                </div>

                                <button className="bg-white w-full text-blue-900 font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-xl text-sm">
                                    Explore Audio
                                </button>
                            </div>
                        </div>

                        {/* Tertiary Deal (Groceries) - SQUARE (Span 1 col, 1 row) */}
                        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-[2rem] group shadow-sm border border-gray-100 flex items-end">
                            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent" />
                            
                            <div className="relative z-10 p-8 w-full text-left">
                                <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 shadow-lg shadow-emerald-500/30">
                                    Daily Fresh
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Organic Market.</h2>
                                <p className="text-emerald-100 text-sm font-medium">Farm to door in 30 mins.</p>
                            </div>
                        </div>

                        {/* Quaternary Deal (Smart Home) - SQUARE (Span 1 col, 1 row) */}
                        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-[2rem] group shadow-sm border border-gray-100 flex items-end">
                            <img src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
                            
                            <div className="relative z-10 p-8 w-full text-left">
                                <div className="inline-flex items-center gap-2 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 shadow-lg shadow-purple-500/30">
                                    New Arrival
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Smart Home Hub.</h2>
                                <p className="text-purple-100 text-sm font-medium">Voice control everything.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grouped Rendering for Homescreen vs Flat Grid for Search/Categories */}
                {isHomescreen ? (
                    <div className="flex flex-col gap-20">
                        {categories.map((category) => {
                            const categoryItems = inventory.filter(p => p.category === category);
                            if (categoryItems.length === 0) return null;
                            
                            return (
                                <div key={category} className="flex flex-col">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/50">
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{category}</h2>
                                        <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                                        {categoryItems.map((item, idx) => renderCard(item, idx))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        {/* Section Header for Search / Filter */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/50">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {isSearching ? 'AI Search Results' : `${activeStore}`}
                            </h2>
                            <span className="text-gray-400 font-medium text-sm">{displayedItems.length} items found</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                            <AnimatePresence mode="popLayout">
                                {displayedItems.map((item: any, idx: number) => renderCard(item, idx))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
                
                {isSearching && displayedItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning Networks</h3>
                        <p className="text-gray-500 font-medium">The AI is negotiating the best deals for you...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
