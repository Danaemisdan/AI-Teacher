import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Chrome, Smartphone, Settings } from 'lucide-react';

export default function WebGPUWarning() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-3xl p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-white/60 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hardware Access Required</h2>
                        <p className="text-sm font-medium text-gray-500">Your browser is blocking Local AI</p>
                    </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                    Nexmart runs a powerful neural network directly on your device for absolute privacy and zero latency. 
                    However, your current browser is blocking access to your graphics card (WebGPU).
                </p>

                {isIOS ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start">
                            <Smartphone className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900">1. Download Native App (Recommended)</h3>
                                <p className="text-sm text-blue-800 mt-1">Our upcoming iOS App Store app has hardware access automatically enabled.</p>
                                <button className="mt-3 bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-full opacity-50 cursor-not-allowed">Coming Soon</button>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-start">
                            <Settings className="w-6 h-6 text-gray-600 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-gray-900">2. Manual Safari Override</h3>
                                <p className="text-sm text-gray-600 mt-1">Force enable the AI engine on your iPhone:</p>
                                <ol className="list-decimal ml-4 mt-2 text-sm text-gray-700 space-y-1 font-medium">
                                    <li>Open your iPhone <strong>Settings</strong> app</li>
                                    <li>Scroll down to <strong>Safari</strong></li>
                                    <li>Scroll to the bottom and tap <strong>Advanced</strong></li>
                                    <li>Tap <strong>Feature Flags</strong></li>
                                    <li>Toggle <strong>WebGPU</strong> to ON</li>
                                    <li>Refresh this page!</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start">
                            <Chrome className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900">1. Open in Google Chrome (Recommended)</h3>
                                <p className="text-sm text-blue-800 mt-1">Google Chrome and Microsoft Edge support WebGPU hardware acceleration out-of-the-box.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-start">
                            <Settings className="w-6 h-6 text-gray-600 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-gray-900">2. Force Enable in Safari</h3>
                                <ol className="list-decimal ml-4 mt-2 text-sm text-gray-700 space-y-1 font-medium">
                                    <li>Open Safari Preferences (Cmd + ,)</li>
                                    <li>Go to the <strong>Advanced</strong> tab</li>
                                    <li>Check "Show features for web developers"</li>
                                    <li>In the top menu bar, click <strong>Develop</strong></li>
                                    <li>Go to <strong>Feature Flags</strong> &gt; Enable <strong>WebGPU</strong></li>
                                    <li>Refresh this page!</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
