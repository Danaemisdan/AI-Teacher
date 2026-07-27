"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Zap, UserCheck, ArrowRight, Linkedin, MessageCircle, Instagram, Twitter } from "lucide-react";
import Image from "next/image";

const MOCK_LEADS = [
    { name: "Sarah Jenkins", title: "VP of Sales, Enterprise Solutions", status: "Qualified", initialDelay: 0.5 },
    { name: "David Chen", title: "Director of AI Initiatives", status: "Contacted", initialDelay: 2.0 },
    { name: "Elena Rodriguez", title: "Chief Operations Officer", status: "Meeting Booked", initialDelay: 4.5 },
];

const SCAN_PHASES = [
    { name: "WhatsApp", color: "#25D366", Icon: MessageCircle },
    { name: "LinkedIn", color: "#0077b5", Icon: Linkedin },
    { name: "Instagram", color: "#E1306C", Icon: Instagram },
    { name: "X/Twitter", color: "#14171A", Icon: Twitter },
];

export function LeadGeneration() {
    const [leads, setLeads] = useState<{ name: string; title: string; status: string }[]>([]);
    const [scanPhase, setScanPhase] = useState(0);

    useEffect(() => {
        const timers = MOCK_LEADS.map((lead) =>
            setTimeout(() => {
                setLeads(prev => [...prev, lead]);
            }, lead.initialDelay * 1000)
        );

        const loop = setInterval(() => {
            setLeads([]);
            MOCK_LEADS.forEach((lead) => {
                setTimeout(() => {
                    setLeads(prev => [...prev, lead]);
                }, lead.initialDelay * 1000);
            });
        }, 8000);

        const scanLoop = setInterval(() => {
            setScanPhase((prev) => (prev + 1) % SCAN_PHASES.length);
        }, 2000);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(loop);
            clearInterval(scanLoop);
        };
    }, []);

    const CurrentIcon = SCAN_PHASES[scanPhase].Icon;

    return (
        <div className="flex flex-col items-center w-full h-full px-6 pt-[8vh]">
            <h2 className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] font-bold tracking-tighter text-center leading-[0.95] mb-6 text-[#111] font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]">
                Sources leads.<br />
                <span className="text-[#fd5934] font-semibold">Starts conversations.</span>
            </h2>
            <div className="max-w-[650px] text-center mb-16 px-4">
                <p className="text-[#666] text-lg sm:text-[21px] font-medium tracking-tight leading-[1.4] font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]">
                    Momentum OS autonomously cross-references web data to uncover highly-qualified prospects, engages them naturally, and fills your pipeline.
                </p>
            </div>

            {/* Ultra-Premium Glass/Sleek Light Dashboard */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-4xl h-[400px] bg-[#fafafa] border border-black/[0.04] rounded-[32px] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ring-1 ring-white/50"
            >
                <div className="h-[52px] border-b border-black/[0.04] bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="w-7 h-7 bg-gradient-to-tr from-[#fd5934] to-[#ff8f71] rounded-lg flex items-center justify-center shadow-sm">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-[#111] text-[13px] tracking-tight">Outreach Terminal</span>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/5 rounded-full shadow-sm cursor-pointer transition-colors"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#555] uppercase tracking-wider">Auto-Pilot</span>
                    </motion.div>
                </div>

                <div className="flex-1 relative overflow-hidden bg-white/40">
                    <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

                    <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10 transition-transform">
                        <div className="relative group">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                                className="absolute -inset-6 rounded-full border border-dashed border-[#fd5934]/30"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute -inset-10 rounded-full border border-[#000]/5"
                            />
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-[88px] h-[88px] bg-[#111] rounded-[24px] shadow-2xl flex items-center justify-center relative z-10 cursor-pointer overflow-hidden ring-1 ring-white/10"
                            >
                                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-gradient-to-tr from-[#fd5934] to-transparent opacity-30 z-0" />
                                <Image src="/21.svg" alt="Momentum Logo" width={44} height={44} className="w-11 h-11 relative z-10" />
                            </motion.div>
                        </div>
                        <div className="flex flex-col items-center mt-2 w-[160px]">
                            <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] whitespace-nowrap">Momentum Agent</span>
                            
                            <div className="flex items-center justify-center h-[34px] bg-white border border-black/5 shadow-sm rounded-full px-3 w-full mt-2 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={scanPhase}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-1.5 absolute"
                                    >
                                        <CurrentIcon className="w-3.5 h-3.5" color={SCAN_PHASES[scanPhase].color} />
                                        <span className="text-[11px] text-[#555] font-semibold tracking-tight whitespace-nowrap">
                                            Scanning {SCAN_PHASES[scanPhase].name}...
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 140, opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute left-[200px] top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-[#fd5934] to-transparent z-0"
                    />

                    <div className="absolute right-[4%] top-[10%] bottom-[10%] w-[380px] flex flex-col gap-3 justify-center z-10">
                        <AnimatePresence>
                            {leads.map((lead, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 40, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    whileHover={{ scale: 1.02, x: -5, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                                    className="bg-white/80 backdrop-blur-md border border-black/[0.04] rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-4 w-full cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center shrink-0 border border-black/[0.04]">
                                        <UserCheck className="w-4 h-4 text-[#555]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-bold text-[#111] truncate">{lead.name}</h4>
                                        <p className="text-[12px] text-[#666] font-medium truncate">{lead.title}</p>
                                    </div>
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 whitespace-nowrap border ${
                                            lead.status === "Meeting Booked" ? "bg-green-50 border-green-200 text-green-700 shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
                                            lead.status === "Contacted" ? "bg-blue-50 border-blue-200 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.2)]" :
                                            "bg-gray-50 border-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {lead.status}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {leads.length < 3 && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="flex items-center gap-2.5 text-[13px] font-medium text-[#888] mt-3 px-3"
                            >
                                <Search className="w-3.5 h-3.5 animate-pulse text-[#fd5934]" />
                                Extracting verified profile parameters...
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
