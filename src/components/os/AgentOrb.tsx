'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Plus, ArrowUp, Loader2 } from 'lucide-react';
import { CreateWebWorkerMLCEngine, MLCEngineInterface } from '@mlc-ai/web-llm';
import { AgentState, Orb } from "@/components/ui/orb";
import WebGPUWarning from './WebGPUWarning';

const suggestedPrompts = [
    "Show me top earners in home decor",
    "What is trending on TikTok Shop right now?",
    "Find what's selling right now",
    "Find me the best selling products in Europe...",
    "Show me new Shopify stores in fashion"
];

export default function AgentOrb({ workflowState, setWorkflowState, setCurrentTask, setAiProducts, setIsAiReady, setAiProgress, aiProgress, isAiReady }: any) {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [input, setInput] = useState('');
  const [engine, setEngine] = useState<MLCEngineInterface | null>(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showGpuWarning, setShowGpuWarning] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Instant Audio Queue State
  const audioQueue = useRef<string[]>([]);
  const isPlayingAudio = useRef(false);
  const isLlmDone = useRef(true);

  const isWorking = workflowState === 'RESEARCHING' || workflowState === 'NEGOTIATING';
  const isTalking = workflowState === 'TALKING';
  const isListening = workflowState === 'LISTENING';

  useEffect(() => {
    audioRef.current = new Audio();
    if (!engine && !workerRef.current) {
        initWebLLM();
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            handleOrbClick();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initWebLLM = async () => {
      try {
          // Play the hardcoded welcome tour instantly
          // Note: Browsers block autoplay. If it fails, it will catch and silently fail, 
          // which is why we must wrap it or handle the interaction securely.
          const playWelcome = async () => {
              try {
                  await speak("Welcome to Nexmart... the smart way of shopping. I am your AI assistant. Feel free to browse the store while I download my neural core...", false);
              } catch(err) {
                  console.warn("Autoplay blocked. User needs to interact with page first.");
              }
          };
          playWelcome();

          setAiProgress('Initializing Neural Core (0%)...');
          
          if (!navigator.gpu) {
              setAiProgress('Hardware Access Denied');
              setShowGpuWarning(true);
              return;
          }

          workerRef.current = new Worker(new URL('@/lib/worker.ts', import.meta.url), { type: 'module' });
          
          // Fallback to the ultra-tiny SmolLM2 (360M) on mobile devices to prevent WebGPU OOM crashes
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const modelToLoad = isMobile ? 'SmolLM2-360M-Instruct-q4f16_1-MLC' : 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

          const newEngine = await CreateWebWorkerMLCEngine(
              workerRef.current,
              modelToLoad,
              { 
                  initProgressCallback: (progress) => {
                      // Use the detailed text which shows exact Megabytes downloaded and shader compilation steps
                      setAiProgress(`System: ${progress.text}`);
                  }
              }
          );
          setEngine(newEngine);
          setIsAiReady(true);
          
          // Announce when fully loaded
          speak("My neural core is online. I am ready to help you shop!", false);
      } catch (e) {
          console.error("Failed to init WebLLM", e);
          setAiProgress('Failed to boot AI Engine. Browser might be out of memory.');
      }
  };

  const stopTalking = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  const startListening = () => {
      stopTalking();
      setShowKeyboard(false);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onstart = () => {
              setWorkflowState('LISTENING');
              setUserTranscript('Listening...');
              setAgentMessage('');
          };

          recognitionRef.current.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setUserTranscript(transcript);
              if (event.results[0].isFinal) {
                  handleSemanticTask(transcript);
              }
          };

          recognitionRef.current.onerror = (e: any) => {
              console.error("Speech Recognition Error:", e);
              setWorkflowState('IDLE');
              setUserTranscript('');
          };

          recognitionRef.current.onend = () => {
              setWorkflowState((prev: string) => prev === 'LISTENING' ? 'IDLE' : prev);
          };

          recognitionRef.current.start();
      } else {
          alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      }
  };

  const handleOrbClick = () => {
      if (!engine) {
          // Graceful fallback while booting
          speak("I'm still loading my neural core! Take a look around the store while I finish.", false);
          return;
      }
      if (isWorking) return;
      
      if (isTalking) {
          stopTalking();
          startListening();
      } else if (isListening) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setWorkflowState('IDLE');
          setUserTranscript('');
      } else {
          startListening();
      }
  };

  const processAudioQueue = async () => {
      if (isPlayingAudio.current || audioQueue.current.length === 0) {
          // If queue is empty and LLM is done, return to listening state
          if (!isPlayingAudio.current && isLlmDone.current && (workflowState === 'TALKING' || workflowState === 'RESEARCHING')) {
               startListening();
          }
          return;
      }
      
      isPlayingAudio.current = true;
      const text = audioQueue.current.shift()!;
      
      try {
          if (audioRef.current) {
              const url = '/api/tts?text=' + encodeURIComponent(text);
              audioRef.current.src = url;
              setWorkflowState('TALKING');
              
              audioRef.current.onended = () => {
                  isPlayingAudio.current = false;
                  processAudioQueue();
              };
              await audioRef.current.play();
          }
      } catch(e) {
          console.error("Audio playback error:", e);
          isPlayingAudio.current = false;
          processAudioQueue();
      }
  };

  const speak = async (text: string, queue = true) => {
      if (!queue) {
          try {
              if (audioRef.current) {
                  const url = '/api/tts?text=' + encodeURIComponent(text);
                  audioRef.current.src = url;
                  setWorkflowState('TALKING');
                  audioRef.current.onended = () => { setWorkflowState('IDLE'); };
                  audioRef.current.play();
              }
          } catch(e) { console.error(e); }
      } else {
          audioQueue.current.push(text);
          processAudioQueue();
      }
  };

  const handleSemanticTask = async (userMessage: string) => {
    if (!engine || !userMessage.trim()) return;
    
    setCurrentTask(userMessage);
    setInput('');
    setShowKeyboard(false);
    setUserTranscript(userMessage);
    setWorkflowState('RESEARCHING');
    setAgentMessage('');
    setAiProducts([]);
    
    try {
      const inventoryContext = `
      [ID: t1] 5KVA Solar Inverter - $1200 - Tech
      [ID: t2] Solar Battery 200Ah - $450 - Tech
      [ID: t3] Smartphone Pro Max - $1099 - Tech
      [ID: t4] Noise-Cancelling Headphones - $299 - Tech
      [ID: t5] Ultra-Wide 4K Monitor - $650 - Tech
      [ID: g1] Parboiled Rice 50kg - $45 - Groceries
      [ID: g2] Artisan Coffee Beans 1kg - $28 - Groceries
      [ID: g3] Organic Olive Oil 1L - $18 - Groceries
      [ID: p1] First Aid Kit - $25 - Pharmacy
      [ID: p2] Daily Multivitamins - $15 - Pharmacy
      [ID: p3] Whey Protein Isolate - $55 - Pharmacy
      [ID: p4] Digital Thermometer - $12 - Pharmacy
      [ID: f1] Premium Health Insurance - $120 - Financial
      [ID: f2] Global Travel Insurance - $45 - Financial
      [ID: fa1] Minimalist Cotton T-Shirt - $29 - Fashion
      [ID: fa2] Classic Denim Jacket - $89 - Fashion
      [ID: h1] Modern Ceramic Vase - $35 - Home
      [ID: h2] Linen Throw Blanket - $65 - Home
      `;

      const userChat = { role: "user" as const, content: userMessage };
      const newHistory = [...chatHistory, userChat];
      
      const stream = await engine.chat.completions.create({
          messages: [
              { role: "system", content: `You are Nexmart OS, an ultra-intelligent, highly capable conversational AI shopping assistant.
              You must act like a futuristic, helpful companion.
              If the user asks about products, recommend items creatively from this inventory:\n${inventoryContext}\n
              If the user asks a general question (like 'what is glassmorphism?' or 'how are you?'), answer it intelligently and naturally.
              ALWAYS respond in exactly 1 or 2 concise, natural sentences. DO NOT use markdown, lists, or emojis. Just pure, conversational text.` },
              ...newHistory
          ],
          temperature: 0.7,
          stream: true
      });

      let fullResponse = "";
      
      for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          fullResponse += text;
          setAgentMessage(fullResponse);
      }
      
      setChatHistory([...newHistory, { role: "assistant" as const, content: fullResponse }]);
      
      // Play the full response at once to prevent awkward pauses between sentences
      speak(fullResponse, false);

      setWorkflowState('NEGOTIATING');
      
      const jsonResponse = await engine.chat.completions.create({
          messages: [
              { role: "system", content: `You are a strict data extractor. Return ONLY a valid JSON array of product IDs from this inventory that match the context of the conversation:\n${inventoryContext}\nExample output: ["t1", "t2"]\nCRITICAL: If the user is just saying "Hi", chatting generally, or not requesting products, YOU MUST RETURN AN EMPTY ARRAY []. Do not hallucinate.` },
              { role: "user", content: `Conversation context: User said "${userMessage}", you replied "${fullResponse}". Now extract the product IDs as a JSON array.` }
          ],
          temperature: 0.1
      });

      const jsonText = jsonResponse.choices[0].message.content || '[]';
      const match = jsonText.match(/\[([\s\S]*?)\]/);
      let parsedIds: string[] = [];
      if (match) {
          try {
              parsedIds = JSON.parse(`[${match[1]}]`);
          } catch(e) {}
      }

      const allInventory = [
          { id: 't1', title: '5KVA Solar Inverter', price: 1200, category: 'Tech', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop' },
          { id: 't2', title: 'Solar Battery 200Ah', price: 450, category: 'Tech', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=600&auto=format&fit=crop' },
          { id: 't3', title: 'Smartphone Pro Max', price: 1099, category: 'Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop' },
          { id: 't4', title: 'Noise-Cancelling Headphones', price: 299, category: 'Tech', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' },
          { id: 't5', title: 'Ultra-Wide 4K Monitor', price: 650, category: 'Tech', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop' },
          { id: 'g1', title: 'Parboiled Rice 50kg', price: 45, category: 'Groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
          { id: 'g2', title: 'Artisan Coffee Beans 1kg', price: 28, category: 'Groceries', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop' },
          { id: 'g3', title: 'Organic Olive Oil 1L', price: 18, category: 'Groceries', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop' },
          { id: 'p1', title: 'First Aid Kit', price: 25, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=600&auto=format&fit=crop' },
          { id: 'p2', title: 'Daily Multivitamins', price: 15, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop' },
          { id: 'p3', title: 'Whey Protein Isolate', price: 55, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=600&auto=format&fit=crop' },
          { id: 'p4', title: 'Digital Thermometer', price: 12, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=600&auto=format&fit=crop' },
          { id: 'f1', title: 'Premium Health Insurance', price: 120, category: 'Financial', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66cb85?q=80&w=600&auto=format&fit=crop' },
          { id: 'f2', title: 'Global Travel Insurance', price: 45, category: 'Financial', image: 'https://images.unsplash.com/photo-1502920514313-525810c2a66d?q=80&w=600&auto=format&fit=crop' },
          { id: 'fa1', title: 'Minimalist Cotton T-Shirt', price: 29, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop' },
          { id: 'fa2', title: 'Classic Denim Jacket', price: 89, category: 'Fashion', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600&auto=format&fit=crop' },
          { id: 'h1', title: 'Modern Ceramic Vase', price: 35, category: 'Home', image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=600&auto=format&fit=crop' },
          { id: 'h2', title: 'Linen Throw Blanket', price: 65, category: 'Home', image: 'https://images.unsplash.com/photo-1580556882412-25807185c7bb?q=80&w=600&auto=format&fit=crop' }
      ];

      const found = parsedIds.map(id => allInventory.find(p => p.id === id.replace(/["']/g, '').trim())).filter(Boolean);
      
      if (found.length > 0) {
          setAiProducts(found);
      }

    } catch (error) {
      console.error(error);
      setWorkflowState('IDLE');
      setAgentMessage(`Mobile Error: ${(error as any)?.message || 'WebGPU Memory Limit Exceeded on this device.'}`);
    }
  };

  let agentState: AgentState = null;
  if (isWorking) agentState = "thinking";
  if (isTalking) agentState = "talking";
  if (isListening) agentState = "listening";

  return (
    <>
      <AnimatePresence>
          {showGpuWarning && <WebGPUWarning />}
      </AnimatePresence>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      
      <div className="relative">
          <motion.div 
            onClick={handleOrbClick}
            animate={{ scale: isWorking || isTalking ? 1.3 : 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`relative cursor-pointer transition-shadow duration-700 rounded-full w-32 h-32 ${isWorking || isTalking ? 'drop-shadow-[0_0_60px_rgba(59,130,246,0.4)]' : 'drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:scale-105 hover:drop-shadow-[0_15px_35px_rgba(0,0,0,0.2)]'}`}
          >
            <div className="bg-transparent h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] border border-black/5">
                <Orb
                    colors={["#10b981", "#3b82f6"]}
                    agentState={agentState}
                />
            </div>
          </motion.div>

          {/* Download Progress Pill */}
          {!isAiReady && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white flex items-center gap-2 pointer-events-none">
                  <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{aiProgress}</span>
              </div>
          )}

          {!isWorking && !isListening && !isTalking && !showKeyboard && isAiReady && (
              <button 
                onClick={() => setShowKeyboard(true)} 
                className="absolute top-1/2 -right-16 -translate-y-1/2 bg-white/40 hover:bg-white/60 border border-white/40 p-3 rounded-full text-gray-700 transition-all backdrop-blur-2xl shadow-lg hover:shadow-xl"
              >
                  <Keyboard className="w-5 h-5" />
              </button>
          )}
      </div>

      {/* Dynamic Subtitle Bubble (Glassmorphic) */}
      <div className="h-24 mt-4 flex flex-col items-center justify-start w-[600px] pointer-events-none">
          <AnimatePresence mode="wait">
            {(agentMessage || userTranscript) && !showKeyboard && (
              <motion.div 
                key="subtitle"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="max-w-xl w-full text-center bg-white/40 backdrop-blur-3xl px-6 py-4 rounded-3xl border border-white/60 text-gray-900 shadow-2xl flex flex-col gap-2 pointer-events-auto"
              >
                {userTranscript && (
                    <span className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider block">
                        You: "{userTranscript}"
                    </span>
                )}
                {agentMessage && (
                    <p className="text-sm font-medium leading-relaxed">
                        {agentMessage}
                    </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Magic Search Input & Suggestions (Glassmorphic) */}
      <AnimatePresence>
        {showKeyboard && !isWorking && !isListening && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-44 bg-white/40 backdrop-blur-3xl border border-white/60 p-3 rounded-3xl shadow-2xl w-[600px] flex flex-col gap-2"
          >
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-lg tracking-tight">Magic AI Search</h3>
                <button type="button" onClick={() => setShowKeyboard(false)} className="bg-white/50 hover:bg-white/80 border border-white/40 p-2 rounded-xl transition-colors">
                    <X className="w-4 h-4 text-gray-700" />
                </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSemanticTask(input); }} className="flex items-center gap-2 relative mb-2">
                <input 
                  autoFocus
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything..." 
                  className="w-full bg-white/50 border border-white/60 rounded-2xl px-6 py-4 text-gray-900 text-base placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all shadow-inner backdrop-blur-xl"
                />
                <button type="submit" disabled={!input.trim()} className="absolute right-2 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 p-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                    <ArrowUp className="w-5 h-5 text-white" />
                </button>
            </form>

            <div className="flex flex-col gap-1 px-1">
                 {suggestedPrompts.map((prompt, idx) => (
                      <button 
                          key={idx}
                          type="button"
                          onClick={() => { setInput(prompt); handleSemanticTask(prompt); }}
                          className="flex items-center gap-3 w-full text-left p-3 hover:bg-white/60 rounded-xl transition-colors group border border-transparent hover:border-white/40"
                      >
                           <div className="w-6 h-6 rounded-full bg-white/50 text-gray-500 group-hover:bg-[#3b82f6]/20 group-hover:text-[#3b82f6] flex items-center justify-center transition-colors">
                               <Plus className="w-3 h-3" />
                           </div>
                           <span className="text-gray-600 text-sm font-medium group-hover:text-gray-900 transition-colors">
                               {prompt}
                           </span>
                      </button>
                 ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
