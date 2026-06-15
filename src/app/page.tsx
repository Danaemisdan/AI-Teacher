'use client'
import React, { useState, useEffect } from 'react';
import AgentOrb from '@/components/os/AgentOrb';
import Dock from '@/components/os/Dock';
import AgenticGrid from '@/components/os/AgenticGrid';
import LandingPage from '@/components/marketing/LandingPage';
import AuthModal from '@/components/auth/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User } from 'lucide-react';

export type WorkflowState = 'IDLE' | 'RESEARCHING' | 'NEGOTIATING' | 'READY' | 'TALKING' | 'LISTENING';

export default function Home() {
    const [isShoppingMode, setIsShoppingMode] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
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
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onLoginSuccess={() => setIsLoggedIn(true)} 
            />

            <AnimatePresence>
                {!isShoppingMode && (
                    <motion.div 
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 z-50"
                    >
                        <LandingPage 
                            onStartShopping={() => setIsShoppingMode(true)} 
                            isLoggedIn={isLoggedIn}
                            onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {isShoppingMode && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* The Subtle Background Flares (Glassmorphic) */}
                    <div className="absolute top-0 left-0 w-[500px] h-full bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-200/40 via-purple-100/20 to-transparent pointer-events-none blur-3xl opacity-70" />
                    <div className="absolute top-0 right-0 w-[500px] h-full bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-yellow-200/40 via-red-100/10 to-transparent pointer-events-none blur-3xl opacity-70" />

                    {/* Top Navigation Logo & Auth */}
                    <div className="absolute top-8 left-10 z-40">
                        <img src="/logo.png" alt="NexmartShop.ai" className="h-16 object-contain drop-shadow-lg" />
                    </div>
                    
                    <div className="absolute top-10 right-10 z-40">
                        {isLoggedIn ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg flex items-center justify-center text-white border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                                <User className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold text-gray-600 hover:text-black transition-colors px-4 py-2">Sign In</button>
                                <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">Sign Up</button>
                            </div>
                        )}
                    </div>

                    {/* AI Agent Orb */}
                    <AgentOrb 
                        workflowState={workflowState}
                        setWorkflowState={setWorkflowState}
                        setCurrentTask={setCurrentTask}
                        setAiProducts={setAiProducts}
                        setIsAiReady={setIsAiReady}
                        setAiProgress={setAiProgress}
                        aiProgress={aiProgress}
                        isAiReady={isAiReady}
                    />

                    {/* Comprehensive Scrollable Amazon-like Screen (Products, Deals, Search) */}
                    <AgenticGrid 
                        activeStore={activeStore}
                        workflowState={workflowState}
                        aiProducts={aiProducts}
                    />

                    {/* The macOS Dock */}
                    <Dock activeStore={activeStore} setActiveStore={setActiveStore} />
                </motion.div>
            )}
        </div>
    )
}
