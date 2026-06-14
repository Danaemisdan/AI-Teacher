'use client'
import React, { useState, useEffect } from 'react';
import AgentOrb from '@/components/os/AgentOrb';
import Dock from '@/components/os/Dock';
import AgenticGrid from '@/components/os/AgenticGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type WorkflowState = 'IDLE' | 'RESEARCHING' | 'NEGOTIATING' | 'READY' | 'TALKING' | 'LISTENING';

export default function Home() {
    const [workflowState, setWorkflowState] = useState<WorkflowState>('IDLE');
    const [activeStore, setActiveStore] = useState('All');
    const [currentTask, setCurrentTask] = useState('');
    const [aiProducts, setAiProducts] = useState<any[]>([]);
    
    // Splash screen state
    const [isAiReady, setIsAiReady] = useState(false);
    const [aiProgress, setAiProgress] = useState('Booting OS...');

    useEffect(() => {
        if (activeStore !== 'All' && workflowState !== 'IDLE') {
            setWorkflowState('IDLE');
        }
    }, [activeStore]);

    return (
        <div className="h-screen w-full relative overflow-hidden font-sans bg-[#f8f9fa] transition-colors duration-1000">
            {/* Splash Screen Overlay */}
            <AnimatePresence>
                {!isAiReady && (
                    <motion.div 
                        key="splash"
                        exit={{ opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
                    >
                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                            {/* Large centered logo */}
                            <motion.img 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1 }}
                                src="/splash-logo.png" 
                                alt="Nexmart OS" 
                                className="w-[400px] max-w-[80vw] object-contain drop-shadow-2xl" 
                            />
                            
                            {/* Minimal loader at the bottom */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-16 flex flex-col items-center gap-3"
                            >
                                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{aiProgress}</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Subtle Background Flares (Glassmorphic) */}
            <div className="absolute top-0 left-0 w-[500px] h-full bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-200/40 via-purple-100/20 to-transparent pointer-events-none blur-3xl opacity-70" />
            <div className="absolute top-0 right-0 w-[500px] h-full bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-yellow-200/40 via-red-100/10 to-transparent pointer-events-none blur-3xl opacity-70" />

            {/* Top Navigation Logo */}
            <div className="absolute top-8 left-10 z-40">
                <img src="/logo.png" alt="NexmartShop.ai" className="h-16 object-contain drop-shadow-lg" />
            </div>

            {/* AI Agent Orb */}
            <AgentOrb 
                workflowState={workflowState}
                setWorkflowState={setWorkflowState}
                setCurrentTask={setCurrentTask}
                setAiProducts={setAiProducts}
                setIsAiReady={setIsAiReady}
                setAiProgress={setAiProgress}
            />

            {/* Comprehensive Scrollable Amazon-like Screen (Products, Deals, Search) */}
            <AgenticGrid 
                activeStore={activeStore}
                workflowState={workflowState}
                aiProducts={aiProducts}
            />

            {/* The macOS Dock */}
            <Dock activeStore={activeStore} setActiveStore={setActiveStore} />
        </div>
    )
}
