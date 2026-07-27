import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, MonitorUp, PhoneOff } from "lucide-react";

export function MeetingCloser() {
    const [callPhase, setCallPhase] = useState(0);

    useEffect(() => {
        let timer1: NodeJS.Timeout, timer2: NodeJS.Timeout;
        
        const runSequence = () => {
             setCallPhase(0);
             timer1 = setTimeout(() => setCallPhase(1), 1500); 
             timer2 = setTimeout(() => setCallPhase(2), 2500); 
        };

        runSequence();
        const cycle = setInterval(runSequence, 12000); 

        return () => {
             clearTimeout(timer1); clearTimeout(timer2);
             clearInterval(cycle);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-black px-4 relative">
            <h2 className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] font-bold tracking-tighter text-center leading-[0.95] mb-12 text-[#111] font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]">
                Takes meetings.<br />
                <span className="text-[#fd5934]">Closes deals.</span>
            </h2>

            <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-video bg-white border border-black/[0.04] rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col ring-1 ring-black/[0.02]">
                
                <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-[#fafafa] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                        <span className="text-xs font-semibold text-gray-400 tracking-wider">00:14:32</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 tracking-tight">Q3 Enterprise Expansion Pitch</span>
                    <div className="w-16"></div> 
                </div>

                <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 relative bg-[#f1f3f5]">
                    
                    <div className="relative rounded-2xl bg-[#202124] border border-gray-200 shadow-sm overflow-hidden flex flex-col items-center justify-center group overflow-hidden">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#8e24aa] flex items-center justify-center shadow-lg relative z-10 transition-transform duration-500 group-hover:scale-105">
                            <span className="text-5xl sm:text-7xl font-medium text-white/90">S</span>
                        </div>
                        
                        <motion.div 
                            animate={{ scale: [1, 1.4, 1], opacity: [0, 0.15, 0] }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute w-36 h-36 rounded-full bg-white/30 z-0 pointer-events-none"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.8, 1], opacity: [0, 0.05, 0] }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                            className="absolute w-36 h-36 rounded-full bg-white/30 z-0 pointer-events-none"
                        />
                        
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 z-20">
                            <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                <Mic className="w-2.5 h-2.5 text-red-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-200">Sarah (VP of Sales)</span>
                        </div>
                    </div>

                    <div className="relative rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                        <AnimatePresence mode="popLayout">
                            {callPhase === 0 ? (
                                <motion.div 
                                    key="waiting"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="text-gray-400 text-[13px] font-semibold flex flex-col items-center gap-4 z-10"
                                >
                                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-100 border-t-[#fd5934] animate-spin"></div>
                                    Waiting for Momentum Agent...
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="agent-active"
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="flex w-full h-full flex-col relative"
                                >
                                    <div className="absolute inset-0 z-0">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#fd5934]/10 blur-[80px]" />
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center z-10 pb-8">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 rounded-full bg-black shadow-xl flex items-center justify-center relative z-10 border border-white/10 ring-4 ring-black/5">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-[#fd5934] to-transparent opacity-30 rounded-full" />
                                                <img src="/21.svg" alt="Momentum logo" className="w-12 h-12 relative z-10" />
                                            </div>
                                            {callPhase === 2 && (
                                                <>
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} 
                                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                                        className="absolute inset-0 rounded-full border-2 border-[#fd5934] z-0" 
                                                    />
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }} 
                                                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                                        className="absolute inset-0 rounded-full border border-[#fd5934] z-0" 
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Momentum Agent</h3>
                                        <p className="text-sm font-medium text-gray-500">
                                            {callPhase === 2 ? "Speaking..." : "Analyzing prospect..."}
                                        </p>

                                        {callPhase === 2 && (
                                            <div className="flex items-center gap-1 mt-6 h-6 px-4 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                                                {[...Array(6)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: ["4px", "14px", "4px"] }}
                                                        transition={{ repeat: Infinity, duration: 0.6 + Math.random() * 0.4, delay: i * 0.1 }}
                                                        className="w-1 bg-[#fd5934] rounded-full opacity-80"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 z-20">
                                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                            <Mic className="w-2.5 h-2.5 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">Momentum AI</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-gray-200 shadow-xl z-30"
                >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                        <Mic className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                        <Video className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                        <MonitorUp className="w-4 h-4" />
                    </motion.button>
                    <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md hover:bg-red-600 transition-colors">
                        <PhoneOff className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
