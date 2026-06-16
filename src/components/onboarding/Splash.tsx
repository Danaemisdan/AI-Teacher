'use client'
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Splash({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <img src="/logo.png" alt="Nexmart" className="h-20 mb-4" />
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-gray-500 font-medium text-lg tracking-wide"
                >
                    AI Commerce, Simplified
                </motion.p>
            </motion.div>
        </div>
    );
}
