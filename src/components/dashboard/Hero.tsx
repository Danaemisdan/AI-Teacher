import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
    children?: React.ReactNode; // Used to inject the AgentOrb or interactive elements
}

export default function Hero({ children }: HeroProps) {
    return (
        <section className="max-w-7xl mx-auto w-full px-6 py-8">
            <div className="w-full rounded-[2.5rem] relative overflow-hidden bg-gradient-to-br from-[#e8fbf3] via-[#f1fdf8] to-[#e8fbf3] p-16 flex items-center justify-between shadow-sm border border-[#00B368]/10">
                {/* Decorative background elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#00B368]/5 rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-[40%] w-40 h-40 bg-blue-400/5 rounded-full blur-3xl" />
                <Sparkles className="absolute top-12 left-[45%] text-[#00B368]/40 w-6 h-6" />
                <Sparkles className="absolute bottom-20 left-12 text-[#00B368]/20 w-8 h-8" />
                <Sparkles className="absolute top-24 right-[10%] text-[#00B368]/40 w-5 h-5" />

                {/* Left Content */}
                <div className="flex-1 max-w-xl z-10">
                    <div className="inline-flex items-center gap-1 bg-[#00B368]/10 text-[#00B368] font-bold text-xs px-3 py-1.5 rounded-full mb-6">
                        <Sparkles className="w-3 h-3" /> AI Shopping, Simplified
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-[#0c2a1e] leading-[1.1] mb-6 tracking-tight">
                        Shop Smarter with <span className="text-[#00B368]">Nexmart AI</span>
                    </h1>
                    
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">
                        AI-powered recommendations, unbeatable deals, and a seamless shopping experience.
                    </p>

                    <div className="flex items-center gap-4">
                        <button className="bg-[#00B368] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#00B368]/30 hover:bg-[#009255] hover:scale-105 transition-all flex items-center gap-2">
                            Shop Now <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="bg-white text-gray-800 border border-gray-200 px-8 py-4 rounded-full font-bold shadow-sm hover:border-[#00B368] hover:text-[#00B368] transition-all flex items-center gap-2">
                            Explore AI Picks <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Content (Orb/Interactive Area) */}
                <div className="w-[450px] h-[400px] relative z-10 flex items-center justify-center">
                    {/* The children prop is where we will inject the interactive AgentOrb so it sits exactly where the mascot would have been */}
                    {children}
                    
                    {/* Floating Product Cards purely for decoration */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute -top-4 -right-12 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center gap-4 w-64"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" alt="Headphones" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#00B368] text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="w-2 h-2" /> AI Pick for You
                            </span>
                            <span className="text-sm font-bold leading-tight">Noise Cancelling Headphones</span>
                            <span className="text-gray-900 font-black mt-1">$59.99</span>
                            <button className="bg-[#00B368] text-white text-[10px] font-bold py-1 px-3 rounded-full mt-2 w-max">Add to Cart</button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.9, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute bottom-8 -left-16 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center gap-4 w-60"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80" alt="Shoes" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#00B368] text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="w-2 h-2" /> AI Pick for You
                            </span>
                            <span className="text-sm font-bold leading-tight">Running Shoes Lightweight</span>
                            <span className="text-gray-900 font-black mt-1">$49.99</span>
                            <button className="bg-[#00B368] text-white text-[10px] font-bold py-1 px-3 rounded-full mt-2 w-max">Add to Cart</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
