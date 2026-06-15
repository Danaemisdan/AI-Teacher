import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Globe, Smartphone, Settings, Compass, LayoutPanelTop, Check, ArrowRight, MousePointer2, Pointer } from 'lucide-react';
import { Orb } from '@/components/ui/orb';

export default function WebGPUWarning() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const [toggleState, setToggleState] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setToggleState(prev => !prev);
        }, 3000); // Synced with the finger animation
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#fafafa] p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full border border-white/60 relative overflow-hidden flex flex-col md:flex-row gap-8"
            >
                {/* Left Side: The Warning Context */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="w-24 h-24 mb-4 relative flex items-center justify-center rounded-full bg-blue-50/50 shadow-inner">
                        <Orb />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Hardware Access Blocked</h2>
                    <p className="text-gray-600 leading-relaxed font-medium mb-8">
                        Nexmart runs a massive neural network entirely on your device for absolute privacy and zero latency. Your current browser is blocking the necessary connection to your graphics card (WebGPU).
                    </p>

                    <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(37,99,235,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            {isIOS ? <Smartphone className="w-6 h-6 text-blue-200" /> : <Globe className="w-6 h-6 text-blue-200" />}
                            <h3 className="font-bold text-lg">{isIOS ? "Download Native App" : "Use Google Chrome"}</h3>
                        </div>
                        <p className="text-sm text-blue-100 relative z-10 mb-4">
                            {isIOS 
                                ? "Our upcoming iOS App has hardware access enabled by default. (iOS Chrome does not support WebGPU either)" 
                                : "Chrome and Edge support hardware acceleration automatically."}
                        </p>
                        {isIOS ? (
                            <button className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md opacity-50 cursor-not-allowed">
                                App Store (Coming Soon) <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <a 
                                href="https://www.google.com/chrome/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold flex items-center w-fit gap-2 backdrop-blur-md cursor-pointer"
                            >
                                Download Chrome <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Side: The Visual Guide */}
                <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-400" />
                        Manual Safari Override
                    </h3>

                    {isIOS ? (
                        /* iOS Visual Graphic */
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative">
                            {/* Animated iOS Finger */}
                            <motion.div
                                className="absolute z-50 pointer-events-none"
                                animate={{
                                    x: [40, 240, 240, 40],
                                    y: [80, 25, 25, 80],
                                    scale: [1, 0.85, 1, 1],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 0.5,
                                    times: [0, 0.4, 0.6, 1]
                                }}
                            >
                                <Pointer className="w-10 h-10 text-gray-800 fill-white drop-shadow-xl rotate-[-20deg]" />
                            </motion.div>

                            <div className="w-full bg-[#f2f2f7] rounded-2xl p-4 shadow-inner border border-black/5 flex flex-col gap-3 relative">
                                {/* Simulated iOS Settings Row */}
                                <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Compass className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-medium text-[15px]">Safari</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                </div>
                                
                                <div className="flex justify-center my-1"><ArrowRight className="w-5 h-5 text-gray-300 rotate-90" /></div>

                                {/* Simulated Advanced -> WebGPU Row */}
                                <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                                    <span className="font-medium text-[15px]">WebGPU</span>
                                    
                                    {/* Animated iOS Toggle */}
                                    <motion.div 
                                        className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 ${toggleState ? 'bg-[#34c759]' : 'bg-[#e9e9ea]'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: toggleState ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                            <ol className="text-sm font-medium text-gray-600 space-y-2 w-full ml-4 list-decimal relative z-10">
                                <li>Open iPhone <strong>Settings &gt; Safari</strong></li>
                                <li>Scroll to bottom and tap <strong>Advanced</strong></li>
                                <li>Tap <strong>Feature Flags</strong></li>
                                <li>Enable <strong>WebGPU</strong> and refresh this page</li>
                            </ol>
                        </div>
                    ) : (
                        /* Mac Safari Visual Graphic - Full Sequence */
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 relative w-full">
                            
                            {/* Container for the sequence - FIXED SIZE FOR PIXEL PERFECT CLICKS */}
                            <div className="w-[320px] h-[200px] relative mt-2">
                                
                                {/* Animated Mac Cursor */}
                                <motion.div
                                    className="absolute z-50 pointer-events-none w-6 h-6 top-0 left-0"
                                    animate={{
                                        x: [160, 190, 190, 190, 190, 190, 270, 270, 270, 25, 25, 25, 20, 20, 20, 160],
                                        y: [180, 15,  15,  55,  55,  55,  55,  55,  55,  145, 145, 145, 15, 15, 15, 180],
                                        scale: [1, 1, 0.8, 1, 0.8, 1, 1, 0.8, 1, 1, 0.8, 1, 1, 0.8, 1, 1]
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        times: [0, 0.08, 0.1, 0.15, 0.25, 0.3, 0.35, 0.4, 0.45, 0.55, 0.6, 0.65, 0.8, 0.85, 0.9, 1]
                                    }}
                                >
                                    <MousePointer2 className="w-6 h-6 text-black fill-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]" />
                                </motion.div>

                                {/* Step 1: Menu Bar */}
                                <motion.div 
                                    className="absolute top-0 left-0 w-full bg-[#f5f5f7] rounded-xl overflow-visible shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-black/10 z-10"
                                    animate={{ opacity: [1, 1, 0, 0, 1] }}
                                    transition={{ duration: 10, repeat: Infinity, times: [0, 0.26, 0.27, 0.85, 0.86] }}
                                >
                                    <div className="bg-[#e8e8ed] px-3 py-1.5 flex items-center gap-3 text-[13px] font-medium text-black border-b border-black/10">
                                        <span className="font-bold">Safari</span>
                                        <span>File</span>
                                        <span>Edit</span>
                                        <span>View</span>
                                        <motion.span 
                                            animate={{ backgroundColor: ["transparent", "#2563eb", "#2563eb", "transparent"], color: ["#000", "#fff", "#fff", "#000"] }}
                                            transition={{ duration: 10, repeat: Infinity, times: [0, 0.1, 0.26, 0.27] }}
                                            className="px-2 py-0.5 rounded"
                                        >
                                            Develop
                                        </motion.span>
                                        <span>Window</span>
                                    </div>
                                    
                                    {/* Dropdown */}
                                    <motion.div 
                                        className="absolute bg-white/90 backdrop-blur p-2 w-48 left-[120px] shadow-xl border border-black/5 rounded-b-lg"
                                        animate={{ opacity: [0, 0, 1, 1, 0] }}
                                        transition={{ duration: 10, repeat: Infinity, times: [0, 0.1, 0.11, 0.26, 0.27] }}
                                    >
                                        <motion.div 
                                            className="px-3 py-1.5 text-[13px] rounded flex items-center justify-between"
                                            animate={{ backgroundColor: ["transparent", "transparent", "#2563eb", "#2563eb", "transparent"], color: ["#000", "#000", "#fff", "#fff", "#000"] }}
                                            transition={{ duration: 10, repeat: Infinity, times: [0, 0.15, 0.16, 0.26, 0.27] }}
                                        >
                                            <span>Feature Flags</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>

                                {/* Step 2: Feature Flags Window */}
                                <motion.div 
                                    className="absolute top-0 left-0 w-full bg-[#2c2c2e] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-black/30 text-white z-20"
                                    animate={{ opacity: [0, 0, 1, 1, 0, 0], scale: [0.95, 0.95, 1, 1, 0.95, 0.95] }}
                                    transition={{ duration: 10, repeat: Infinity, times: [0, 0.26, 0.27, 0.85, 0.86, 1] }}
                                >
                                    <div className="bg-[#3a3a3c] px-4 py-2 flex items-center border-b border-black/30 relative">
                                        <motion.div 
                                            className="flex gap-2 absolute left-4"
                                            animate={{ opacity: [1, 1, 0.5, 1] }}
                                            transition={{ duration: 10, repeat: Infinity, times: [0, 0.8, 0.85, 1] }}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                                        </motion.div>
                                        <div className="w-full text-xs font-bold text-center text-gray-300">Feature Flags</div>
                                    </div>
                                    
                                    <div className="p-3 flex justify-end border-b border-black/20 bg-[#2c2c2e]">
                                        <motion.div 
                                            className="bg-[#1c1c1e] border rounded-md px-2 flex items-center gap-2 w-40 h-6"
                                            animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.1)", "rgba(59,130,246,0.8)", "rgba(59,130,246,0.8)", "rgba(255,255,255,0.1)"] }}
                                            transition={{ duration: 10, repeat: Infinity, times: [0, 0.39, 0.4, 0.85, 0.86] }}
                                        >
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <motion.span 
                                                className="text-xs text-white"
                                                animate={{ textContent: ["", "", "", "w", "we", "web", "webG", "webGP", "webGPU", "webGPU", ""] } as any}
                                                transition={{ duration: 10, repeat: Infinity, times: [0, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.85, 0.86] }}
                                            >
                                                
                                            </motion.span>
                                        </motion.div>
                                    </div>

                                    <div className="p-4 bg-[#1e1e1e] h-24">
                                        <div className="text-[10px] text-gray-500 font-bold mb-3 pl-1">DOM</div>
                                        <motion.div 
                                            className="flex items-center justify-between p-1"
                                            animate={{ opacity: [0, 0, 1, 1, 0] }}
                                            transition={{ duration: 10, repeat: Infinity, times: [0, 0.46, 0.47, 0.85, 0.86] }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div 
                                                    className="w-3.5 h-3.5 rounded border flex items-center justify-center"
                                                    animate={{ backgroundColor: ["transparent", "transparent", "#007aff", "#007aff", "transparent"], borderColor: ["#6b7280", "#6b7280", "#007aff", "#007aff", "#6b7280"] }}
                                                    transition={{ duration: 10, repeat: Infinity, times: [0, 0.6, 0.61, 0.85, 0.86] }}
                                                >
                                                    <motion.div
                                                        animate={{ opacity: [0, 0, 1, 1, 0] }}
                                                        transition={{ duration: 10, repeat: Infinity, times: [0, 0.6, 0.61, 0.85, 0.86] }}
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                </motion.div>
                                                <span className="text-sm font-medium text-gray-200">WebGPU</span>
                                            </div>
                                            <span className="text-xs text-gray-500">Preview</span>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>

                            <ol className="text-xs font-medium text-gray-600 space-y-1 w-full ml-4 list-decimal relative z-10 mt-8">
                                <li>Click <strong>Develop</strong> in the Mac Menu Bar</li>
                                <li>Select <strong>Feature Flags</strong></li>
                                <li>Search for <strong>webGPU</strong> and check the box</li>
                            </ol>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
