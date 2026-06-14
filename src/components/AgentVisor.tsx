'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Activity } from 'lucide-react'

export function AgentVisor({ frame, isActive }: { frame: string | null, isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 400 }}
          exit={{ opacity: 0, width: 0, padding: 0, margin: 0 }}
          className="ml-6 flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1021]/80 backdrop-blur-2xl shadow-2xl"
        >
          {/* Visor Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-nexmart-cyan">
              <Eye className="h-4 w-4" />
              Agent Vision
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] text-white/50">
              <Activity className="h-3 w-3 animate-pulse text-nexmart-orange" />
              Intercepting DOM
            </span>
          </div>

          {/* Video/Image Feed */}
          <div className="relative flex flex-1 items-center justify-center bg-black/50 p-2">
            {frame ? (
               <img 
                 src={`data:image/jpeg;base64,${frame}`} 
                 alt="Agent View" 
                 className="h-full w-full rounded-lg object-contain"
               />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/30">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-nexmart-cyan" />
                <span className="text-xs uppercase tracking-widest">Connecting to optic relay...</span>
              </div>
            )}
            
            {/* Scanlines overlay for aesthetic */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
