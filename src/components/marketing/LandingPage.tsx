import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, BadgeDollarSign, Sparkles, Handshake, ShieldCheck, CreditCard, Box, Zap, Lock, ArrowRight, Activity, HeartPulse, User } from 'lucide-react';

interface LandingPageProps {
    onStartShopping: () => void;
    isLoggedIn: boolean;
    onOpenAuth: () => void;
}

export default function LandingPage({ onStartShopping, isLoggedIn, onOpenAuth }: LandingPageProps) {
    const agents = [
        { icon: <Search className="w-6 h-6 text-blue-500" />, title: "Discovery Agent", desc: "Finds products that match your needs, preferences, and budget." },
        { icon: <Box className="w-6 h-6 text-indigo-500" />, title: "Research Agent", desc: "Analyzes reviews, ratings, specifications, and product performance." },
        { icon: <BadgeDollarSign className="w-6 h-6 text-green-500" />, title: "Price Agent", desc: "Tracks prices across sellers and finds the best deals." },
        { icon: <Zap className="w-6 h-6 text-yellow-500" />, title: "Coupon Agent", desc: "Applies discounts, promotions, and cashback opportunities automatically." },
        { icon: <Handshake className="w-6 h-6 text-orange-500" />, title: "Negotiation Agent", desc: "Communicates with sellers and secures better offers when available." },
        { icon: <ShieldCheck className="w-6 h-6 text-teal-500" />, title: "Quality Agent", desc: "Verifies authenticity, seller reputation, and warranty information." },
        { icon: <ShoppingCart className="w-6 h-6 text-purple-500" />, title: "Cart Agent", desc: "Manages your basket, checks availability, and predicts delivery times." },
        { icon: <CreditCard className="w-6 h-6 text-pink-500" />, title: "Checkout Agent", desc: "Processes payments securely and handles shipping addresses." },
        { icon: <Sparkles className="w-6 h-6 text-sky-500" />, title: "Style Agent", desc: "Suggests matching items, sizes, and trends based on your profile." },
        { icon: <Lock className="w-6 h-6 text-slate-500" />, title: "Privacy Agent", desc: "Ensures your data is protected and handles transactions anonymously." }
    ];

    return (
        <div className="min-h-screen w-full bg-[#f8f9fa] overflow-y-auto overflow-x-hidden text-gray-900 absolute top-0 left-0 z-50">
            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-white/50 backdrop-blur-md border-b border-white/20">
                <img src="/logo.png" alt="NexmartShop" className="h-12 object-contain" />
                <div className="flex gap-4">
                    {isLoggedIn ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg flex items-center justify-center text-white border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                            <User className="w-5 h-5" />
                        </div>
                    ) : (
                        <>
                            <button onClick={onOpenAuth} className="text-sm font-bold text-gray-600 hover:text-black transition-colors px-4 py-2">Sign In</button>
                            <button onClick={onOpenAuth} className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">Sign Up</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center mt-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-purple-50/20 to-transparent pointer-events-none -z-10" />
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm mb-8 shadow-sm">
                        <Sparkles className="w-4 h-4" /> The future of commerce is here.
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6 text-black">
                        AI That Shops<br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">For You.</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
                        The world's first large-scale Agentic Commerce platform powered by intelligent AI agents that discover, compare, negotiate, purchase, and manage products on your behalf.
                    </p>

                    <button 
                        onClick={onStartShopping}
                        className="group relative inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-full text-xl font-bold shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300"
                    >
                        Start Shopping With AI
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
                    </button>
                    <p className="mt-6 text-gray-400 font-medium text-sm">Tell Nexmart what you need in simple language.</p>
                </motion.div>
            </section>

            {/* Meet the Agents */}
            <section className="py-32 px-6 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Meet Your 10 AI Shopping Agents</h2>
                        <p className="text-xl text-gray-500 font-medium">Your dedicated team of intelligent specialists working in parallel.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {agents.map((agent, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#f8f9fa] p-6 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-gray-100">
                                    {agent.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-3">{agent.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{agent.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NexPay & HealthCard */}
            <section className="py-32 px-6 bg-[#0a0a0a] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-purple-900/10 to-transparent pointer-events-none" />
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-8">
                            <CreditCard className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">NexPay.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            Our native digital wallet designed specifically for AI-driven transactions. Fund your account, set budget limits, and let your agents seamlessly handle checkouts across multiple stores without entering card details everywhere.
                        </p>
                        <ul className="space-y-4 text-gray-300 font-medium">
                            <li className="flex items-center gap-3"><CheckCircle /> Instant AI Checkout</li>
                            <li className="flex items-center gap-3"><CheckCircle /> Hard Budget Limits</li>
                            <li className="flex items-center gap-3"><CheckCircle /> Zero-fee Transactions</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center mb-8">
                            <HeartPulse className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">The HealthCard.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            Sync your Nexmart profile with our HealthCard ecosystem. Provide dietary restrictions, allergies, and health goals, and our agents will automatically filter and negotiate for the right food and supplements.
                        </p>
                        <ul className="space-y-4 text-gray-300 font-medium">
                            <li className="flex items-center gap-3"><CheckCircle className="text-red-400" /> Allergen Auto-Filtering</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-red-400" /> Goal-Oriented Grocery Shopping</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-red-400" /> Integration with Fitness Trackers</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

function CheckCircle({ className = "text-blue-400" }: { className?: string }) {
    return (
        <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
