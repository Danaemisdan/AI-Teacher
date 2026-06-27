'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSpeech } from '@/lib/useSpeech';
import { useWebLLM } from '@/lib/useWebLLM';
import { Mic, MicOff, Loader2, Send, BookOpen, SquarePen, Search, Clock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Removed VTuberCanvas
import LessonBoard from '@/components/LessonBoard';
import { AgentFace } from '@/components/AgentFace';

export default function Home() {
    const { init, isLoaded, isLoading, progressText, generateResponse, hasWebGPUError } = useWebLLM();
    const { listen, stopListening, isListening } = useSpeech();
    const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
    const [currentReply, setCurrentReply] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrlToSpeak, setAudioUrlToSpeak] = useState<string | null>(null);
    const [audioQueue, setAudioQueue] = useState<string[]>([]);

    // Audio Queue Processor: Plays sentences sequentially as they arrive!
    useEffect(() => {
        if (!isSpeaking && audioQueue.length > 0) {
            setAudioUrlToSpeak(audioQueue[0]);
            setIsSpeaking(true);
            setAudioQueue(prev => prev.slice(1));
        }
    }, [isSpeaking, audioQueue]);

    const [currentLessonTitle, setCurrentLessonTitle] = useState<string | null>(null);
    const [currentLessonContent, setCurrentLessonContent] = useState<string | null>(null);
    const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null);
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [currentTestContent, setCurrentTestContent] = useState<string | null>(null);
    const [currentHtmlGraphic, setCurrentHtmlGraphic] = useState<string | null>(null);
    const [currentModuleInfo, setCurrentModuleInfo] = useState<string | null>(null);
    const [isSourcing, setIsSourcing] = useState(false);
    const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
    const [curriculum, setCurriculum] = useState<{ topic: string, modules: string[], currentIndex: number, isTeaching: boolean } | null>(null);

    const CHAPTERS = [
        "Chapter 1: The Cosmos & Black Holes",
        "Chapter 2: Quantum Mechanics",
        "Chapter 3: The Roman Empire",
        "Chapter 4: Artificial Intelligence"
    ];

    useEffect(() => {
        // Init WebLLM on mount
        init();
    }, [init]);

    const [inputText, setInputText] = useState('');

    const processPrompt = async (promptText: string) => {
        if (!promptText) return;

        // Intercept progression commands if curriculum is active
        const lower = promptText.toLowerCase();

        // Check if user wants to force next module
        if (curriculum && lower.includes("next module")) {
            const nextIdx = curriculum.currentIndex + 1;
            if (nextIdx < curriculum.modules.length) {
                setCurriculum({ ...curriculum, currentIndex: nextIdx, isTeaching: true });
                await teachModule(curriculum.topic, curriculum.modules[nextIdx], nextIdx, curriculum.modules.length, "Let's move on to the next module.");
            } else {
                setCurriculum(null);
                setCurrentModuleInfo(null);
                setCurrentTestContent("You have completed all modules for this topic! Great job!");
                setMessages([...messages, { role: 'user' as const, content: promptText }, { role: 'assistant' as const, content: "You've finished the lesson! What would you like to learn next?" }]);
                setCurrentReply("You've finished the lesson! What would you like to learn next?");
                const url = '/api/tts?text=' + encodeURIComponent("You've finished the lesson! What would you like to learn next?");
                setIsSpeaking(true);
                setAudioUrlToSpeak(url);
            }
            return;
        }

        // Socratic Teaching Loop!
        if (curriculum && curriculum.isTeaching) {
            setIsGenerating(true);
            setCurrentReply('');
            
            const newMessages = [...messages, { role: 'user' as const, content: promptText }];
            setMessages(newMessages);

            const SYSTEM_PROMPT = `You are Momentum, teaching ${curriculum.modules[curriculum.currentIndex]}.
Taught so far:
${currentLessonContent}

User said: "${promptText}"
Reply conversationally with a detailed, engaging explanation building on what was taught. End your response by asking a thought-provoking question to continue the lesson.
DO NOT use bullet points, bold text, or lists. Just natural speech.`;

            const finalMessages = [
                { role: 'user' as const, content: SYSTEM_PROMPT }
            ];

            try {
                const fullReply = await generateResponse(finalMessages, (chunk) => {
                    setCurrentReply(chunk);
                });
                
                let cleanReply = fullReply
                    .replace(/#/g, '')
                    .replace(/\[|\]/g, '')
                    .replace(/\*/g, '') // Remove all bold/italic asterisks
                    .replace(/Sentence \d+:?/gi, '') // Just in case
                    .trim(); 

                // Let the Few-Shot prompt handle the logic naturally.
                // Just log the entire brief response to the chalkboard notes!
                setCurrentLessonContent(prev => {
                    if (!prev || prev === "Listening to Shizuku...") return "- " + cleanReply;
                    return prev + '\n- ' + cleanReply;
                });

                setMessages([...newMessages, { role: 'assistant', content: cleanReply }]);
                setCurrentReply('');
                
                const url = '/api/tts?text=' + encodeURIComponent(cleanReply);
                setIsSpeaking(true);
                setAudioUrlToSpeak(url);
            } catch (error) {
                console.error(error);
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        // Intercept teaching/explaining requests in normal chat and start a curriculum lesson
        const isQuestion = lower.includes("explain") || lower.includes("teach") || lower.includes("what is") || lower.includes("how does") || lower.includes("learn") || lower.includes("tell me") || lower.includes("who is") || lower.includes("why");
        if (!curriculum && isQuestion) {
            await startCurriculum(promptText);
            return;
        }
        
        const newMessages = [...messages, { role: 'user' as const, content: promptText }];
        setMessages(newMessages);
        
        setIsGenerating(true);
        setCurrentReply('');
        
        // Only clear the board if we're not currently in a lesson
        if (!curriculum) {
            setCurrentLessonTitle(null);
            setCurrentLessonContent(null);
            setCurrentModuleInfo(null);
            setCurrentHtmlGraphic(null);
        }
        
        setIsSourcing(true);
        let webContext = '';
        if (promptText.length > 5) {
            try {
                const queryWords = promptText.split(' ').slice(-5).join(' ');
                const searchRes = await fetch('/api/search?q=' + encodeURIComponent(queryWords));
                if (searchRes.ok) {
                    const data = await searchRes.json();
                    if (data.summary) webContext = data.summary;
                    // Removed random YouTube video hijacking so the AI is forced to draw SVGs instead!
                }
            } catch (e) {
                console.error("Failed to fetch web context", e);
            }
        }
        setIsSourcing(false);

        const SYSTEM_PROMPT = `You are Momentum, a witty virtual teacher. 
Respond naturally and conversationally. DO NOT use titles, formatting, or generate quizzes for normal chat.
CRITICAL: You have the ability to draw on the blackboard! If the student asks you to show or draw something, you MUST output a beautifully styled SVG inside a [DRAW: ] block anywhere in your response. 
Example: [DRAW: <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="50" fill="transparent" stroke="purple" stroke-width="4"/></svg>]
Use white/purple neon colors. Keep the drawing clean and educational.
${webContext ? `Use this context if helpful: ${webContext}` : ''}`;

        const finalMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...newMessages
        ];

        try {
            let spokenSentencesCount = 0;
            const fullReply = await generateResponse(finalMessages, (chunk) => {
                setCurrentReply(chunk);
                
                const drawMatch = chunk.match(/\[DRAW:\s*(<svg[\s\S]*?<\/svg>)\s*\]/i);
                if (drawMatch && drawMatch[1]) {
                    setCurrentHtmlGraphic(drawMatch[1]);
                }

                const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '');
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                if (sentences.length > spokenSentencesCount) {
                    const newSentence = sentences[spokenSentencesCount].trim();
                    spokenSentencesCount++;
                    if (newSentence.length > 2) {
                        setAudioQueue(prev => [...prev, '/api/tts?text=' + encodeURIComponent(newSentence)]);
                    }
                }
            });
            
            const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').trim();
            const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
            const spokenLength = sentences.join('').length;
            if (cleanSpeech.length > spokenLength + 2) {
                 const finalSentence = cleanSpeech.substring(spokenLength).trim();
                 setAudioQueue(prev => [...prev, '/api/tts?text=' + encodeURIComponent(finalSentence)]);
            }
            
            setMessages([...newMessages, { role: 'assistant', content: fullReply }]);
            setCurrentReply('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const teachModule = async (topic: string, moduleName: string, idx: number, total: number, triggerPrompt?: string) => {
        setIsGenerating(true);
        setCurrentReply('');
        setCurrentLessonTitle(moduleName.replace(/^[0-9.]+\s*/, '')); // Clean title
        setCurrentLessonContent("Generating diagram...");
        setCurrentMediaUrl(null);
        setCurrentVideoId(null);
        setCurrentTestContent(null);
        setCurrentHtmlGraphic(null);
        setCurrentModuleInfo(`Module ${idx + 1} of ${total}: ${moduleName}`);
        
        // Phase 1: Zero-Shot Mermaid Mindmap (Background)
        setIsSourcing(true);
        const GRAPHICS_PROMPT = `What are 4 key subtopics of "${topic}"? 
Answer ONLY with a comma-separated list of 4 short words or phrases. No introduction.`;
        
        try {
            const chartReply = await generateResponse([{ role: 'user' as const, content: GRAPHICS_PROMPT }], () => {});
            
            // Clean the reply to just the comma-separated words
            const cleanList = chartReply.replace(/[^a-zA-Z0-9,\s-]/g, '').split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 4);
            
            if (cleanList.length > 0) {
                setCurrentHtmlGraphic(JSON.stringify(cleanList));
            } else {
                setCurrentHtmlGraphic(JSON.stringify(["Concept 1", "Concept 2", "Details", "Summary"]));
            }
        } catch(e) {
            console.error("Graphics Gen failed", e);
        }
        setIsSourcing(false);

        setCurrentLessonContent("Listening to Shizuku...");

        const promptText = triggerPrompt || `Please teach me Module ${idx + 1}: ${moduleName}`;
        const newMessages = [...messages, { role: 'user' as const, content: promptText }];
        setMessages(newMessages);

        // Phase 2: Socratic Start (No Quiz on Step 1)
        const SYSTEM_PROMPT = `You are Momentum, a virtual teacher. You are teaching the topic: "${topic}", specifically focusing on "${moduleName}".
Provide a fascinating, highly detailed introductory explanation of this topic to hook the student's interest. 
End your explanation by asking if the student is ready to continue.
DO NOT use bullet points, bold text, or lists. Just use natural speech.
CRITICAL: You have the ability to draw on the blackboard! If it helps explain the topic, you MUST output a beautifully styled SVG inside a [DRAW: ] block anywhere in your response. 
Example: [DRAW: <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="50" fill="transparent" stroke="white" stroke-width="4"/></svg>]
Use white/purple neon colors. Keep the drawing clean and educational.`;

        const finalMessages = [
            { role: 'user' as const, content: SYSTEM_PROMPT }
        ];

        try {
            let spokenSentencesCount = 0;
            const fullReply = await generateResponse(finalMessages, (chunk) => {
                setCurrentReply(chunk);
                
                // Real-time dynamic drawing extraction!
                const drawMatch = chunk.match(/\[DRAW:\s*(<svg[\s\S]*?<\/svg>)\s*\]/i);
                if (drawMatch && drawMatch[1]) {
                    setCurrentHtmlGraphic(drawMatch[1]);
                }
                
                // Stream Audio Sentence-by-Sentence instantly!
                const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '');
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                if (sentences.length > spokenSentencesCount) {
                    const newSentence = sentences[spokenSentencesCount].trim();
                    spokenSentencesCount++;
                    if (newSentence.length > 2) {
                        setAudioQueue(prev => [...prev, '/api/tts?text=' + encodeURIComponent(newSentence)]);
                    }
                }
            });
            
            // Queue any remaining text that didn't end in punctuation
            const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').trim();
            const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
            const spokenLength = sentences.join('').length;
            if (cleanSpeech.length > spokenLength + 2) {
                 const finalSentence = cleanSpeech.substring(spokenLength).trim();
                 setAudioQueue(prev => [...prev, '/api/tts?text=' + encodeURIComponent(finalSentence)]);
            }
            let cleanReply = fullReply
                .replace(/#/g, '')
                .replace(/\[|\]/g, '')
                .replace(/\*/g, '')
                .replace(/Sentence \d+:?/gi, '')
                .trim(); 
            
            // Log the entire brief response to the chalkboard notes
            setCurrentLessonContent("- " + cleanReply);

            setMessages([...newMessages, { role: 'assistant', content: cleanReply }]);
            setCurrentReply('');
            
            const url = '/api/tts?text=' + encodeURIComponent(cleanReply);
            setIsSpeaking(true);
            setAudioUrlToSpeak(url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const startCurriculum = async (topic: string) => {
        const modules = ["1. Introduction & Basics", "2. Core Concepts", "3. Real-World Applications"];
        setCurriculum({ topic, modules, currentIndex: 0, isTeaching: true });
        await teachModule(topic, modules[0], 0, modules.length);
    };

    const handleTextSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputText.trim() && !isGenerating && isLoaded) {
            if (isSpeaking) {
                setAudioUrlToSpeak(null);
                setIsSpeaking(false);
            }
            processPrompt(inputText.trim());
            setInputText('');
        }
    };

    const handleListen = () => {
        // Interruption Logic
        if (isSpeaking) {
            setAudioUrlToSpeak(null); // Instantly stops her audio and resets her mouth!
            setIsSpeaking(false);
        }

        if (isListening) {
            stopListening();
        } else {
            listen((transcript) => processPrompt(transcript));
        }
    };

    // True Closed-Captioning Engine Synced to Sentence Queue!
    const getCaptionText = (text: string) => {
        // If speaking, perfectly display the EXACT sentence being spoken right now!
        if (isSpeaking && audioUrlToSpeak) {
            try {
                const urlParams = new URL(audioUrlToSpeak, 'http://localhost').searchParams;
                const spokenText = urlParams.get('text');
                if (spokenText) return spokenText;
            } catch (e) {}
        }
        
        // If still generating but hasn't spoken yet, show typing preview
        if (isGenerating && text) {
            const cleanText = text.replace(/\[DRAW:[\s\S]*?\]/gi, '').trim();
            if (cleanText.length > 120) return "..." + cleanText.substring(cleanText.length - 100);
            return cleanText;
        }
        
        return "";
    };

    return (
        <main className="flex h-screen w-full text-white overflow-hidden relative" style={{
            background: "#0a0a0c radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.05) 40%, transparent 80%)"
        }}>
            {/* Mobile Rotate Overlay */}
            <div className="hidden portrait:flex fixed inset-0 z-[100] bg-black items-center justify-center text-white text-2xl font-bold text-center p-8">
                Please rotate your device horizontally for the best blackboard experience!
            </div>
            
            {/* The Left Panel System (Momentum UI) */}
            <div className="h-full z-50 flex group">
                <div className="w-[60px] h-full bg-[#050505] border-r border-white/5 flex flex-col items-center py-4 z-50 shrink-0 relative">
                    <div className="flex flex-col gap-6 w-full items-center">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2 font-black text-[10px]">AI</div>
                        
                        <button className="text-white/40 hover:text-white transition-colors" title="New Lesson" onClick={() => window.location.reload()}>
                            <SquarePen className="w-5 h-5" />
                        </button>
                        <button className="text-white/40 hover:text-white transition-colors" title="Search">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className={`transition-colors ${isSyllabusOpen ? 'text-white' : 'text-white/40 hover:text-white'}`} title="Syllabus" onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}>
                            <BookOpen className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-6 w-full items-center mt-auto">
                        <button className="text-white/40 hover:text-white transition-colors" title="Settings">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 bg-[#E35400] rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-md tracking-wider">
                           SN
                        </div>
                    </div>
                </div>
                
                {/* Syllabus Drawer (Sliding out) */}
                <div className={`absolute left-[60px] top-0 h-full w-[280px] bg-[#0f0f11] border-r border-white/5 flex flex-col z-[40] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl ${isSyllabusOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 border-b border-white/5 font-semibold text-sm tracking-wide text-white/50 flex justify-between items-center">
                        Curriculum Syllabus
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {CHAPTERS.map((chap, idx) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    setIsSyllabusOpen(false);
                                    startCurriculum(chap);
                                }}
                                disabled={!isLoaded || isGenerating}
                                className="text-left px-4 py-4 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white font-semibold text-gray-300 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                            >
                                <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-xs">{idx + 1}</span>
                                {chap}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Stage area (AgentFace & Chalkboard) */}
            <div className="flex-1 relative flex">
                
                {/* WebGPU Error Modal */}
                {hasWebGPUError && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
                        <div className="bg-[#111] p-8 rounded-3xl max-w-lg text-center shadow-2xl border-4 border-red-500/50">
                            <h2 className="text-3xl font-black text-red-500 mb-4">WebGPU Required</h2>
                            <p className="text-gray-300 font-medium mb-6 text-lg">
                                Your browser is currently blocking WebGPU, which is required to run the AI engine locally.
                            </p>
                        </div>
                    </div>
                )}

                {/* Centered Main Stage */}
                <div className="flex-1 flex flex-col items-center justify-center relative p-8">
                    
                    {/* Purple Blur Background for Voice */}
                    <div className={`absolute left-1/2 -translate-x-1/2 top-12 w-[600px] h-[300px] rounded-[100%] blur-[120px] pointer-events-none transition-all duration-1000 z-10 ${isSpeaking ? 'bg-purple-600/50 animate-pulse' : 'bg-transparent'}`}></div>

                    {/* Blackboard - Massive Slate */}
                    <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-center w-[95vw] h-[85vh] max-w-[1600px] z-20 ${currentLessonTitle ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
                        <LessonBoard 
                            title={currentLessonTitle} 
                            content={currentLessonContent} 
                            mediaUrl={currentMediaUrl}
                            videoId={currentVideoId}
                            testContent={currentTestContent}
                            moduleInfo={currentModuleInfo}
                            htmlGraphic={currentHtmlGraphic}
                        />
                    </div>

                    {/* Agent Face Floating Over Blackboard */}
                    <div className={`absolute transition-all duration-700 ease-in-out z-40 flex flex-col items-center gap-4 ${currentLessonTitle ? '-top-8 left-1/2 -translate-x-1/2 scale-[0.60]' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100'}`}>
                        <AgentFace 
                            state={isGenerating ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} 
                            className="shadow-[0_0_80px_rgba(139,92,246,0.5)] rounded-[3rem] border border-white/10"
                        />

                        {/* Status Indicator Below Face */}
                        {(isSourcing || !isLoaded || isGenerating) && (
                            <div className="flex items-center gap-2 text-sm font-semibold bg-[#111]/80 backdrop-blur-md px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 text-purple-300">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isSourcing ? "Sourcing live data..." : !isLoaded ? (progressText || 'Booting AI Engine...') : "Thinking..."}
                            </div>
                        )}
                        
                        {/* Audio Sync logic with perfect TTS progress tracking */}
                        {isSpeaking && audioUrlToSpeak && (
                            <audio 
                                src={audioUrlToSpeak} 
                                autoPlay 
                                ref={(el) => {
                                    if (el) {
                                        el.playbackRate = 0.95;
                                    }
                                }}
                                onEnded={() => {
                                    setIsSpeaking(false);
                                    setAudioUrlToSpeak(null);
                                    
                                    // Only trigger the mic if we are completely done speaking the queue
                                    if (audioQueue.length === 0 && !isGenerating) {
                                        setTimeout(() => {
                                            const btn = document.getElementById('mic-button');
                                            if (btn && !btn.disabled) btn.click();
                                        }, 500);
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Glassmorphism Captions Bubble */}
                <div className="absolute bottom-2 left-[50%] -translate-x-[50%] w-full max-w-xl z-[60] flex flex-col items-center justify-end pointer-events-none mb-[120px]">
                    <AnimatePresence>
                        {(isSpeaking || isGenerating) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="max-w-lg w-full px-6 py-4 rounded-2xl backdrop-blur-3xl shadow-2xl leading-relaxed text-gray-100 border border-white/20 pointer-events-auto text-center flex items-center justify-center min-h-[60px] max-h-[100px] overflow-hidden bg-[#0a0a0c]/90"
                                style={{
                                    fontFamily: "'SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Helvetica_Neue',sans-serif",
                                    fontSize: '1.2rem',
                                    fontWeight: 500,
                                    textShadow: currentLessonTitle ? '0 0 10px rgba(0,0,0,0.8)' : 'none',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)'
                                }}
                            >
                                {getCaptionText(currentReply)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Input Area Container - Acts as hover zone */}
                <div className="absolute bottom-0 left-[50%] -translate-x-[50%] w-full max-w-xl h-40 z-50 flex items-end justify-center pb-8 group">
                    <div className={`w-full px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${(currentLessonTitle && (isSpeaking || isGenerating)) ? 'translate-y-24 opacity-0 group-hover:translate-y-0 group-hover:opacity-100' : 'translate-y-0 opacity-100'}`}>
                        {isSpeaking && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 bg-[#111] px-3 py-1 rounded-full shadow-lg border border-white/5 whitespace-nowrap">
                                Click mic to interrupt
                            </div>
                        )}
                        
                        <form onSubmit={handleTextSubmit} className="flex items-center gap-2 bg-[#111]/90 backdrop-blur-2xl p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 focus-within:border-purple-500/50 transition-all">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={!isLoaded || isGenerating}
                                placeholder={isGenerating ? "Thinking..." : "Type your message or ask a question..."}
                                className="flex-1 bg-transparent border-none outline-none px-6 text-gray-200 placeholder-gray-500 font-medium text-[16px] disabled:opacity-50"
                            />
                        
                        <div className="flex-shrink-0 relative">
                            {inputText.trim() ? (
                                <button
                                    type="submit"
                                    disabled={!isLoaded || isGenerating}
                                    className="p-3.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg transform active:scale-95 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    id="mic-button"
                                    onClick={handleListen}
                                    disabled={!isLoaded || isGenerating}
                                    className={`p-3.5 rounded-full transition-all transform active:scale-95 relative ${
                                        isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 
                                        (!isLoaded || isGenerating) ? 'bg-[#222] text-gray-600 cursor-not-allowed' : 
                                        'bg-[#222] text-blue-400 hover:bg-[#333]'
                                    }`}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    
                                    {isListening && (
                                        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
