import React from "react";
import { motion } from "framer-motion";
import { CircleDollarSign, Infinity, LockKeyhole } from "lucide-react";
import Image from "next/image";

export function FeaturesBento() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-white px-4 max-w-6xl mx-auto">
            <h2 
                className="text-[3rem] sm:text-[4.5rem] md:text-[5.5rem] font-bold tracking-tight text-center leading-[1.1] mb-12 font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif] drop-shadow-2xl"
                style={{ textShadow: "0 4px 60px rgba(0,0,0,0.8)" }}
            >
                No hidden catches.<br />
                <span className="text-[#fd5934]">Pure leverage.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full auto-rows-[280px]">
                
                {/* 0 Subscription Fees */}
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="col-span-1 md:col-span-2 relative rounded-3xl overflow-hidden group bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-8 flex flex-col justify-between backdrop-blur-xl hover:border-white/20 transition-colors"
                >
                    <div className="absolute inset-0 bg-black/40 z-0"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fd5934]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#fd5934]/20 transition-colors duration-700 z-0"></div>
                    
                    <div className="z-10 relative h-full flex flex-col justify-between">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <CircleDollarSign className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight mb-3 text-white">0 Subscription Fees</h3>
                            <p className="text-white/60 text-lg font-medium max-w-md leading-relaxed">
                                Stop paying monthly retainers for bloated software. Pay once, own your Momentum OS forever.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* No API Limits */}
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="col-span-1 relative rounded-3xl overflow-hidden group bg-[#0a0a0a] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors"
                >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#fd5934]/5 to-transparent z-0"></div>
                    
                    <div className="z-10 relative h-full flex flex-col justify-between">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Infinity className="w-8 h-8 text-[#fd5934]" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight mb-3 text-white">No APIs.</h3>
                            <p className="text-white/60 font-medium leading-relaxed">
                                Unlimited local inference. Run at scale without unpredictable cloud costs.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 100% Local & Private */}
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="col-span-1 md:col-span-3 relative rounded-3xl overflow-hidden group bg-[#111] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 hover:border-white/20 transition-colors shadow-2xl"
                >
                    {/* Glowing blur orb */}
                    <div className="absolute right-0 top-0 h-[200%] w-1/2 bg-gradient-to-l from-[#fd5934]/20 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 scale-150 group-hover:scale-125 transition-transform duration-1000"></div>
                    
                    <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shrink-0 shadow-[0_0_80px_rgba(255,255,255,0.15)] z-10 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <Image src="/logo-black.svg" alt="Momentum Logo" width={50} height={50} className="w-12 h-12" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left z-10 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold tracking-wide mb-4">
                            <LockKeyhole className="w-4 h-4" /> 100% Secure
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Local & Private.</h3>
                        <p className="text-white/60 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">
                            Your proprietary data never leaves your machine. Momentum taps directly into your local hardware, running highly-optimized local models that guarantee implicit privacy.
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
