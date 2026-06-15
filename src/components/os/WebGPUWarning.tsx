import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Globe, Smartphone, Settings, Compass, LayoutPanelTop, Check, ArrowRight } from 'lucide-react';

export default function WebGPUWarning() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const [toggleState, setToggleState] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setToggleState(prev => !prev);
        }, 2000);
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
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-orange-200">
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
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
                                ? "Our upcoming iOS App has hardware access enabled by default." 
                                : "Chrome and Edge support hardware acceleration automatically."}
                        </p>
                        <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md">
                            {isIOS ? "Join Waitlist" : "Download Chrome"} <ArrowRight className="w-4 h-4" />
                        </button>
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
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="w-full bg-[#f2f2f7] rounded-2xl p-4 shadow-inner border border-black/5 flex flex-col gap-3">
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
                            <ol className="text-sm font-medium text-gray-600 space-y-2 w-full ml-4 list-decimal">
                                <li>Open iPhone <strong>Settings &gt; Safari</strong></li>
                                <li>Scroll to bottom and tap <strong>Advanced</strong></li>
                                <li>Tap <strong>Feature Flags</strong></li>
                                <li>Enable <strong>WebGPU</strong> and refresh this page</li>
                            </ol>
                        </div>
                    ) : (
                        /* Mac Safari Visual Graphic */
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="w-full bg-[#f5f5f7] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-black/10">
                                {/* Simulated Mac Menu Bar */}
                                <div className="bg-[#e8e8ed] px-3 py-1.5 flex items-center gap-4 text-[13px] font-medium text-black border-b border-black/10">
                                    <span className="font-bold">Safari</span>
                                    <span>File</span>
                                    <span>Edit</span>
                                    <span>View</span>
                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm">Develop</span>
                                    <span>Window</span>
                                </div>
                                {/* Simulated Dropdown */}
                                <div className="bg-white/90 backdrop-blur p-2 w-48 ml-32 shadow-xl border border-black/5 rounded-b-lg">
                                    <div className="px-3 py-1.5 text-[13px] hover:bg-blue-600 hover:text-white rounded flex items-center justify-between">
                                        <span>Feature Flags</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                    <div className="h-px bg-black/5 my-1" />
                                    <div className="px-3 py-1.5 text-[13px] bg-blue-600 text-white rounded flex items-center gap-2">
                                        <Check className="w-3 h-3" />
                                        <span>WebGPU</span>
                                    </div>
                                </div>
                            </div>
                            <ol className="text-sm font-medium text-gray-600 space-y-2 w-full ml-4 list-decimal">
                                <li>Enable "Show features for web developers" in <strong>Safari Preferences &gt; Advanced</strong></li>
                                <li>In the top Mac menu bar, click <strong>Develop</strong></li>
                                <li>Go to <strong>Feature Flags</strong> and check <strong>WebGPU</strong></li>
                                <li>Refresh this page</li>
                            </ol>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
