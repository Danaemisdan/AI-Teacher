'use client'
import React, { useState } from 'react';
import Splash from '@/components/onboarding/Splash';
import Onboarding from '@/components/onboarding/Onboarding';
import Dashboard from '@/components/dashboard/Dashboard';
import AuthModal from '@/components/auth/AuthModal';
import { AnimatePresence, motion } from 'framer-motion';

type AppState = 'SPLASH' | 'ONBOARDING' | 'HOME';

export default function Home() {
    const [appState, setAppState] = useState<AppState>('SPLASH');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="h-screen w-full relative overflow-hidden font-sans bg-white">
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onLoginSuccess={() => setIsLoggedIn(true)} 
            />

            <AnimatePresence mode="wait">
                {appState === 'SPLASH' && (
                    <motion.div key="splash" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-50">
                        <Splash onComplete={() => setAppState('ONBOARDING')} />
                    </motion.div>
                )}

                {appState === 'ONBOARDING' && (
                    <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-40 bg-gray-50">
                        <Onboarding onComplete={() => setAppState('HOME')} />
                    </motion.div>
                )}

                {appState === 'HOME' && (
                    <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 z-30">
                        <Dashboard 
                            isLoggedIn={isLoggedIn}
                            onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
