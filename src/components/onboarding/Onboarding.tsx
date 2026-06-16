'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Package, ArrowRight, Check } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    
    const interests = ['Electronics', 'Fashion', 'Groceries', 'Home & Kitchen', 'Beauty', 'Sports'];

    const toggleInterest = (i: string) => {
        if (selectedInterests.includes(i)) setSelectedInterests(selectedInterests.filter(x => x !== i));
        else setSelectedInterests([...selectedInterests, i]);
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else onComplete();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div 
                className="bg-white rounded-[2rem] shadow-xl max-w-lg w-full p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">Welcome to Nexmart AI.</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">Your personal AI shopping team is ready. Let's personalize your experience to get the best recommendations.</p>
                            <button onClick={nextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition">
                                Let's Go <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-2xl font-black mb-2">What are you interested in?</h2>
                            <p className="text-gray-500 mb-6">Select a few categories to train your AI Discovery Agent.</p>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {interests.map(i => (
                                    <button 
                                        key={i} 
                                        onClick={() => toggleInterest(i)}
                                        className={`p-4 rounded-xl border-2 text-left font-bold flex justify-between items-center transition-all ${selectedInterests.includes(i) ? 'border-[#1e3a8a] bg-[#1e3a8a]/10 text-[#1e3a8a]' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        {i}
                                        {selectedInterests.includes(i) && <Check className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                            <button onClick={nextStep} disabled={selectedInterests.length === 0} className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50">
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Where should we deliver?</h2>
                            <p className="text-gray-500 mb-8">Allow location access to find local deals and accurate delivery ETAs.</p>
                            <button onClick={nextStep} className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#172554] shadow-lg shadow-[#1e3a8a]/30 transition mb-3">
                                Allow Location Access
                            </button>
                            <button onClick={nextStep} className="w-full text-gray-500 py-3 font-medium hover:text-black transition">
                                Enter manually later
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                <Package className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Delivery Preferences</h2>
                            <p className="text-gray-500 mb-8">How do you want your items delivered?</p>
                            <div className="space-y-3 mb-8">
                                <div className="p-4 rounded-xl border-2 border-[#1e3a8a] bg-[#1e3a8a]/5 flex gap-4 cursor-pointer">
                                    <div className="mt-1 w-5 h-5 rounded-full border-4 border-[#1e3a8a] bg-white flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Nexmart Prime Delivery</h3>
                                        <p className="text-sm text-gray-500">Consolidated deliveries, less packaging, scheduled drops.</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border-2 border-gray-100 flex gap-4 cursor-pointer hover:border-gray-300">
                                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Standard Delivery</h3>
                                        <p className="text-sm text-gray-500">As fast as possible, items may arrive separately.</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={nextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition">
                                Start Shopping <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
