import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MessagesWindow({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [sent, setSent] = useState(false);
  const [teamReply, setTeamReply] = useState(false);
  const [agentReply, setAgentReply] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [showVideo, sent, teamReply, agentReply]);

  useEffect(() => {
    // Phase 1: Typing indicator -> start uploading
    const timer1 = setTimeout(() => {
      setProgress(1);
    }, 1000);

    // Phase 2: Uploading
    let uploadInterval: NodeJS.Timeout;
    if (progress > 0 && progress < 100) {
      uploadInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(uploadInterval);
            setTimeout(() => {
                setShowVideo(true);
                setTimeout(() => {
                    setSent(true);
                    // Phase 3: Team Replies
                    setTimeout(() => {
                        setTeamReply(true);
                        // Phase 4: Agent Replies
                        setTimeout(() => {
                            setAgentReply(true);
                            // Trigger next showcase phase
                            setTimeout(onComplete, 2000);
                        }, 1500);
                    }, 1500);
                }, 800);
            }, 500);
            return 100;
          }
          return p + 10;
        });
      }, 100);
    }

    return () => {
      clearTimeout(timer1);
      if (uploadInterval) clearInterval(uploadInterval);
    };
  }, [progress, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 m-auto w-[900px] h-[650px] bg-[#1E1E1E] rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-gray-700 flex overflow-hidden z-[90] font-sans"
    >
        {/* Left Sidebar */}
        <div className="w-[300px] bg-[#282828] border-r border-gray-800 flex flex-col">
            <div className="h-[60px] px-4 flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 hover:text-white cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
            </div>
            <div className="px-3 pb-3">
                <div className="bg-[#1A1A1A] rounded-md h-8 flex items-center px-2 border border-gray-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mr-2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search" className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-500" />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center px-3 py-2 cursor-pointer relative">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white mr-3 shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-white font-medium text-[13px] truncate">AD-CSHTOU-P</span>
                            <span className="text-gray-400 text-[11px] shrink-0 ml-2">Yesterday</span>
                        </div>
                        <p className="text-gray-400 text-[12px] truncate">Your Rs.40,000 loan is approved...</p>
                    </div>
                </div>

                <div className="flex items-center px-3 py-2 cursor-pointer relative">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white mr-3 shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-white font-medium text-[13px] truncate">AX-PWAALA-P</span>
                            <span className="text-gray-400 text-[11px] shrink-0 ml-2">Yesterday</span>
                        </div>
                        <p className="text-gray-400 text-[12px] truncate">Rs.4,000 to Rs.10,00,000* Loan...</p>
                    </div>
                </div>

                {/* Active Chat */}
                <div className="flex items-center px-3 py-3 cursor-pointer bg-blue-600 relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold mr-3 shrink-0">DT</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-white font-bold text-[13px] truncate">Design Team</span>
                            <span className="text-blue-200 text-[11px] shrink-0 ml-2">9:41 AM</span>
                        </div>
                        <p className="text-blue-100 text-[12px] truncate">Hey! Can we get that video for the c...</p>
                    </div>
                </div>

                <div className="flex items-center px-3 py-2 cursor-pointer relative">
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white mr-3 shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-white font-medium text-[13px] truncate">+91 57575022</span>
                            <span className="text-gray-400 text-[11px] shrink-0 ml-2">Tuesday</span>
                        </div>
                        <p className="text-gray-400 text-[12px] truncate">Amazon.com subscription at risk...</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel (Chat) */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
            {/* Top Bar */}
            <div className="h-[60px] border-b border-gray-800 flex items-center px-6">
                <span className="text-gray-400 mr-2 text-[13px]">To:</span>
                <span className="text-white font-medium text-[14px]">Design Team</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" ref={scrollRef}>
                <div className="text-center text-[11px] text-gray-500 font-medium my-2">Today, 9:41 AM</div>
                
                {/* Incoming Message */}
                <div className="flex items-end gap-2 max-w-[70%] self-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 shrink-0"></div>
                    <div className="bg-[#3A3A3C] text-white text-[14px] py-2 px-4 rounded-2xl rounded-bl-sm shadow-sm leading-relaxed">
                        Hey! Can we get that video for the campaign out today?
                    </div>
                </div>

                <AnimatePresence>
                    {/* Outgoing Video Uploading */}
                    {progress > 0 && !showVideo && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-end gap-1 max-w-[70%] self-end mt-4"
                        >
                            <div className="w-[280px] h-[180px] bg-[#3A3A3C] rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm">
                                <div className="w-12 h-12 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                                <div className="absolute inset-0 bg-blue-500/20" style={{ width: `${progress}%` }}></div>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Outgoing Video Sent */}
                    {showVideo && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-end gap-1 max-w-[70%] self-end mt-4 ${sent ? '' : 'opacity-80'}`}
                        >
                            <div className="w-[280px] h-[180px] bg-black rounded-2xl border border-gray-700 relative overflow-hidden flex items-center justify-center shadow-md">
                                <img src="/images/wallpaper.jpg" alt="Momentum Campaign" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90" />
                                <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                            {sent && <span className="text-[10px] text-gray-400 mr-2">Delivered</span>}
                        </motion.div>
                    )}

                    {/* Team Reply */}
                    {teamReply && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-end gap-2 max-w-[70%] self-start mt-4"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 shrink-0"></div>
                            <div className="bg-[#3A3A3C] text-white text-[14px] py-2 px-4 rounded-2xl rounded-bl-sm shadow-sm leading-relaxed">
                                Looks nice can we have a meeting tonight?
                            </div>
                        </motion.div>
                    )}

                    {/* Agent Reply */}
                    {agentReply && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-end gap-1 max-w-[70%] self-end mt-4"
                        >
                            <div className="bg-blue-600 text-white text-[14px] py-2 px-4 rounded-2xl rounded-br-sm shadow-sm leading-relaxed">
                                I'll fix a meet with them right away.
                            </div>
                            <span className="text-[10px] text-gray-400 mr-2">Delivered</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="text-gray-500 cursor-pointer hover:text-white">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                    </div>
                    <div className="flex-1 h-9 rounded-full border border-gray-700 bg-[#282828] px-4 flex items-center justify-between">
                        <span className="text-gray-500 text-[13px]">Text Message • SMS</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    </div>
                    <div className="text-gray-500 hover:text-white cursor-pointer">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
}
