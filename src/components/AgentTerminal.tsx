'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, ArrowUpRight, MonitorPlay } from 'lucide-react'
import Image from 'next/image'

export default function AgentTerminal() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [visorFrame, setVisorFrame] = useState<string | null>(null)
  const [isAgentic, setIsAgentic] = useState(false)
  const [suggestionIdx, setSuggestionIdx] = useState(0)

  const suggestionPrompts = [
    "you can ask me to compare prices for the iPhone 15 vs 16 natively across platforms.",
    "have me hunt down specific technical specs for any electronics product and determine the value.",
    "ask me to fetch real-time market deals and find the cheapest items."
  ];

  useEffect(() => {
     if (messages.length === 0) {
        const interval = setInterval(() => {
            setSuggestionIdx(prev => (prev + 1) % suggestionPrompts.length);
        }, 3500);
        return () => clearInterval(interval);
     }
  }, [messages.length, suggestionPrompts.length]);
  
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status, visorFrame])

  const submitQuery = async (query: string) => {
    if (!query.trim() || isProcessing) return

    const userMsgId = crypto.randomUUID()
    const agentMsgId = crypto.randomUUID()

    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: query }])
    setInput('')
    setIsProcessing(true)
    setStatus('Routing...')
    setVisorFrame(null)
    setIsAgentic(false)

    setMessages(prev => [...prev, { id: agentMsgId, role: 'agent', text: '', isLive: true }])

    // Capture memory snapshot before request
    const exportHistory = messages.map(m => ({ role: m.role, text: m.text })).slice(-8);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history: exportHistory }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error("No stream");

      let done = false;
      let streamBuffer = "";
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          streamBuffer += decoder.decode(value, { stream: true });
          
          let boundaryIndex = 0;
          while ((boundaryIndex = streamBuffer.indexOf('\n\n')) >= 0) {
            const ev = streamBuffer.slice(0, boundaryIndex);
            streamBuffer = streamBuffer.slice(boundaryIndex + 2);
            
            if (!ev.trim()) continue;
            const eventParts = ev.split('\n');
            const eventLine = eventParts[0];
            const dataLine = eventParts.slice(1).join('\n'); // Ensure newlines don't break subsequent data
            
            if (!eventLine.startsWith('event: ') || !dataLine.startsWith('data: ')) continue;

            const eventType = eventLine.replace('event: ', '').trim();
            const rawData = dataLine.replace('data: ', '').trim();
            
            if (eventType === 'mode') {
              setIsAgentic(JSON.parse(rawData) === 'agentic')
              if (JSON.parse(rawData) !== 'agentic') setStatus('')
            } else if (eventType === 'status') {
              setStatus(JSON.parse(rawData));
            } else if (eventType === 'frame') {
              setVisorFrame(JSON.parse(rawData));
            } else if (eventType === 'token') {
               setStatus(''); 
               const token = JSON.parse(rawData);
               setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, text: m.text + token } : m));
            } else if (eventType === 'products') {
               const prods = JSON.parse(rawData);
               setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, products: prods } : m));
            } else if (eventType === 'done') {
               setIsProcessing(false);
               // Removed the code that killed the screen. The monitor will now persist natively.
            }
          }
        }
      }
    } catch (e) {
      setIsProcessing(false)
      setStatus('')
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black pb-[85px]">
      
      {/* Scrollable Chat Canvas */}
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide p-6 lg:p-10 flex flex-col gap-10">
          
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-start text-center gap-6 mt-[17vh] max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-white/90 drop-shadow-sm mb-2 flex flex-wrap justify-center gap-x-[0.2em] h-[60px]">
               {"Ask me to physically shop for you.".split(' ').map((w,i) => <span key={i} className="animate-blur-drop" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>{w}</span>)}
            </h1>
            <div className="h-[40px] relative w-full flex justify-center text-white/40 text-[17px] font-sans tracking-tight leading-relaxed">
               <AnimatePresence mode="wait">
                  <motion.p
                     key={suggestionIdx}
                     initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                     animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                     exit={{ filter: 'blur(10px)', opacity: 0, y: -5 }}
                     transition={{ duration: 0.6 }}
                     className="absolute px-4"
                  >
                     {suggestionPrompts[suggestionIdx]}
                  </motion.p>
               </AnimatePresence>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto">
                {msg.role === 'user' ? (
                  <div className="ml-auto w-fit max-w-[75%] rounded-[20px] bg-[#1a1a1a] px-5 py-3.5 text-[15px] text-[#EBEBEB] font-['Inter'] leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="mr-auto w-full max-w-full">
                    
                    {/* INLINE APPLE GLASSCORP SCRAPING MONITOR */}
                    {msg.id === messages[messages.length - 1].id && isAgentic && visorFrame && (
                       <motion.div 
                          initial={{ opacity: 0, height: 0, scale: 0.95, filter: 'blur(30px)' }}
                          animate={{ opacity: 1, height: 'auto', scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, height: 0, scale: 0.9, filter: 'blur(20px)' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="w-full max-w-5xl mb-6 overflow-hidden rounded-[16px] border border-white/10 bg-black shadow-2xl relative flex flex-col"
                       >
                          <div className="relative w-full aspect-[16/9] bg-black">
                             <img src={`data:image/jpeg;base64,${visorFrame}`} alt="Agent VNC" className="absolute top-0 left-0 w-full h-full object-contain" />
                          </div>
                       </motion.div>
                    )}

                    {(!msg.isLive || msg.text) && (
                       <div className="text-[16px] text-[#A1A1AA] leading-relaxed font-['Inter'] pl-2 border-l border-white/10 ml-2 overflow-hidden">
                          {msg.text.replace(/\[\s*\{\s*"id"[\s\S]*$/, "").split('\n').map((line: string, i: number) => (
                             <div key={i} className="min-h-[1em] mb-3 flex flex-wrap gap-x-[0.2em] gap-y-[0rem] w-full">
                                {line.split(' ').filter(Boolean).map((word: string, j: number) => (
                                    <span key={j} className="animate-blur-drop">{word}</span>
                                ))}
                             </div>
                          ))}
                       </div>
                    )}
                    
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-4 pl-4">
                        {msg.products.map((p: any) => (
                          <div key={p.id} className="group flex w-[280px] flex-col overflow-hidden rounded-[16px] border border-white/10 bg-[#0A0A0A] hover:bg-[#111] transition-all duration-300">
                             {p.image && (
                                <div className="h-[180px] w-full bg-black/50 p-0.5 border-b border-white/5 relative overflow-hidden">
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                   <img src={p.image} className="h-full w-full object-cover rounded-t-[14px]" alt={p.title} />
                                </div>
                             )}
                             <div className="p-4 flex flex-col gap-2 relative z-20">
                               <h4 className="text-[13px] font-medium text-white line-clamp-2 leading-snug">{p.title}</h4>
                               {p.source && <span className="text-[10px] text-[#666] tracking-wider uppercase">{p.source}</span>}
                               <div className="mt-2 flex justify-between items-center">
                                 <span className="text-[15px] text-white font-['Outfit'] font-bold">{p.price}</span>
                                 <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                   <ArrowUpRight className="h-4 w-4" />
                                 </button>
                               </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {status && !isAgentic && isProcessing && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-3 px-6 text-[#666] max-w-4xl mx-auto w-full">
                 <Loader2 className="h-3 w-3 animate-spin" />
                 <span className="text-[12px] font-['Inter']">{status}</span>
              </motion.div>
            )}
            <div ref={endRef} className="h-4" />
          </AnimatePresence>
        )}
      </div>

      {/* Pinned Bottom Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 w-full bg-black/80 backdrop-blur-3xl pt-4 pb-6 border-t border-white/5 z-50">
          <div className="mx-auto max-w-3xl flex items-center gap-3 rounded-full border border-white/10 bg-[#111] p-1.5 pl-6 transition-all focus-within:border-white/30 focus-within:bg-[#1a1a1a] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitQuery(input)}
              placeholder="Command me or ask a question..."
              className="flex-1 bg-transparent text-[15px] font-['Inter'] text-[#EBEBEB] placeholder-[#666] outline-none"
              disabled={isProcessing}
            />
            <button onClick={() => submitQuery(input)} disabled={!input.trim() || isProcessing} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 disabled:opacity-20 disabled:scale-100 disabled:bg-[#333] shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
      </div>
    </div>
  )
}
