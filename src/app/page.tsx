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
    const { init, isLoaded, isLoading, progressText, generateResponse, interrupt, hasWebGPUError } = useWebLLM();
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

    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [isFullscreenPrompted, setIsFullscreenPrompted] = useState(false);
    
    useEffect(() => {
        setIsMobileDevice(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    }, []);

    const enterFullscreen = () => {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().then(() => {
                try {
                    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                        window.screen.orientation.lock("landscape").catch(e => console.warn(e));
                    }
                } catch(e) {}
            }).catch(() => {});
        }
        setIsFullscreenPrompted(true);
    };

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
DO NOT use bullet points, bold text, or lists. Just natural speech.
CRITICAL: You have the ability to show incredible graphics on the blackboard! If it helps explain the topic, you MUST output a highly descriptive image prompt inside an [IMAGE: ] block anywhere in your response. 
Format: [IMAGE: description | Title | Short explanation]
You can output MULTIPLE [IMAGE: ] blocks if you want a carousel!
You can also show a YouTube video: [VIDEO: youtube_id | start_seconds | end_seconds | true_or_false_for_mute]`;

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
CRITICAL: You have the ability to show incredible graphics on the blackboard! If the student asks you to show or draw something, you MUST output a highly descriptive image prompt inside an [IMAGE: ] block anywhere in your response. 
Format: [IMAGE: description | Title | Short explanation]
You can output MULTIPLE [IMAGE: ] blocks if you want a carousel!
You can also show a YouTube video: [VIDEO: youtube_id | start_seconds | end_seconds | true_or_false_for_mute]
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
                
                // MULTIPLE IMAGES
                const imageMatches = [...chunk.matchAll(/\[IMAGE:\s*([\s\S]*?)\]/gi)].map(m => m[1].trim());
                if (imageMatches.length > 0) {
                    setCurrentHtmlGraphic(`[IMAGES: ${JSON.stringify(imageMatches)}]`);
                }
                
                // YOUTUBE VIDEO
                const videoMatch = chunk.match(/\[VIDEO:\s*(.*?)\s*\]/i);
                if (videoMatch && videoMatch[1]) {
                    setCurrentHtmlGraphic(`[VIDEO: ${videoMatch[1]}]`);
                }

                const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').replace(/\[VIDEO:[\s\S]*?\]/gi, '');
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                if (sentences.length > spokenSentencesCount) {
                    const newSentence = sentences[spokenSentencesCount].trim();
                    spokenSentencesCount++;
                    if (newSentence.length > 2) {
                        setAudioQueue(prev => [...prev, '/api/tts?text=' + encodeURIComponent(newSentence)]);
                    }
                }
            });
            
            const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').trim();
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
        
        // Phase 1: Zero-Shot Image Generation (Background)
        setIsSourcing(true);
        const GRAPHICS_PROMPT = `Describe a highly detailed, educational illustration for "${moduleName}" in the context of "${topic}".
Output ONLY a short descriptive prompt for an AI image generator. Example: "A man pushing a heavy box across a floor to demonstrate physical force and friction."`;
        
        try {
            const chartReply = await generateResponse([{ role: 'user' as const, content: GRAPHICS_PROMPT }], () => {});
            
            const cleanPrompt = chartReply.replace(/["\n\[\]]/g, '').trim();
            if (cleanPrompt.length > 5) {
                setCurrentHtmlGraphic(`[IMAGES: ${JSON.stringify([cleanPrompt])}]`);
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
CRITICAL: You have the ability to show incredible graphics on the blackboard! If it helps explain the topic, you MUST output a highly descriptive image prompt inside an [IMAGE: ] block anywhere in your response. 
Format: [IMAGE: description | Title | Short explanation]
You can output MULTIPLE [IMAGE: ] blocks if you want a carousel!
You can also show a YouTube video: [VIDEO: youtube_id | start_seconds | end_seconds | true_or_false_for_mute]`;

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
                setAudioQueue([]);
                setAudioUrlToSpeak(null);
                setIsSpeaking(false);
            }
            processPrompt(inputText.trim());
            setInputText('');
        }
    };

    const handleListen = () => {
        // Interruption Logic
        if (isSpeaking || isGenerating) {
            interrupt();
            setCurrentReply('');
            setAudioQueue([]);
            setAudioUrlToSpeak(null); // Instantly stops her audio and resets her mouth!
            setIsSpeaking(false);
            setIsGenerating(false);
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
                const match = audioUrlToSpeak.match(/\?text=([^&]+)/);
                if (match) return decodeURIComponent(match[1]);
            } catch (e) {}
        }
        
        if (!text) return "";
        // If still generating but hasn't spoken yet, show typing preview
        if (isGenerating && text) {
            const cleanText = text.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').replace(/\[VIDEO:[\s\S]*?\]/gi, '').trim();
            const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
            return sentences[sentences.length - 1].trim();
        }
        
        return "";
    };

    return (
        <main className="flex h-screen w-full text-white overflow-hidden relative" style={{
            background: "#0a0a0c radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.05) 40%, transparent 80%)"
        }}>
            {/* Fullscreen Overlay Prompt for Mobile */}
            {isMobileDevice && !isFullscreenPrompted && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                    onClick={enterFullscreen}
                >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Tap to enter Full Screen</h2>
                    <p className="text-white/60 text-lg">For the best immersive AI teacher experience.</p>
                    <p className="text-white/30 text-sm mt-12">(Swipe down from top to exit later)</p>
                </div>
            )}

            {/* Mobile Rotate Overlay */}
            <div className="hidden portrait:flex fixed inset-0 z-[100] bg-black items-center justify-center text-white text-2xl font-bold text-center p-8">
                Please rotate your device horizontally for the best blackboard experience!
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
                <div className="flex-1 flex flex-col items-center justify-center relative p-0 lg:p-8">
                    
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
                            isSpeaking={isSpeaking}
                        />
                    </div>

                    {/* Agent Face Floating Over Blackboard or Fullscreen */}
                    <div className={`absolute transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col items-center gap-4 ${currentLessonTitle ? 'top-4 left-1/2 -translate-x-1/2 scale-[0.35] lg:scale-[0.50]' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full lg:w-auto lg:h-auto scale-100 lg:scale-[1.2]'}`}>
                        <AgentFace 
                            state={isGenerating ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} 
                            className={`shadow-[0_0_80px_rgba(139,92,246,0.5)] transition-all duration-1000 ${currentLessonTitle ? 'rounded-[3rem] border-4 border-white/10 w-[280px] h-[280px]' : 'rounded-none border-0 w-full h-full lg:rounded-[3rem] lg:border-4 lg:border-white/10 lg:w-[280px] lg:h-[280px]'}`}
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
                                            const btn = document.getElementById('mic-button') as HTMLButtonElement | null;
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
                <div className="absolute bottom-0 left-[50%] -translate-x-[50%] w-[90vw] sm:w-[80vw] lg:w-full max-w-xl h-40 z-50 flex items-end justify-center pb-8 group">
                    <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${(currentLessonTitle && (isSpeaking || isGenerating)) ? 'translate-y-24 opacity-0 group-hover:translate-y-0 group-hover:opacity-100' : 'translate-y-0 opacity-100'}`}>
                        {isSpeaking && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 bg-[#111] px-3 py-1 rounded-full shadow-lg border border-white/5 whitespace-nowrap">
                                Click mic to interrupt
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 w-full">
                            {/* Speed Dial Menu Container */}
                            <div className="relative shrink-0 flex items-end justify-center">
                                {/* The popup circles */}
                                <AnimatePresence>
                                    {isSyllabusOpen && (
                                        <div className="absolute bottom-16 flex flex-col-reverse gap-3 pb-2 z-50">
                                            {CHAPTERS.map((chap, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
                                                    transition={{ delay: (CHAPTERS.length - 1 - idx) * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                                    onClick={() => {
                                                        setIsSyllabusOpen(false);
                                                        startCurriculum(chap);
                                                    }}
                                                    disabled={!isLoaded || isGenerating}
                                                    title={chap}
                                                    className="w-12 h-12 rounded-full bg-[#111]/90 backdrop-blur-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-110 hover:bg-purple-600 hover:border-purple-500 hover:text-white transition-colors text-white/70 font-bold disabled:opacity-50"
                                                >
                                                    {idx + 1}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>

                                {/* Main FAB */}
                                <button 
                                    type="button" 
                                    onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}
                                    className={`p-4 rounded-full transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 bg-[#111]/90 backdrop-blur-2xl hover:scale-105 active:scale-95 z-[60] ${isSyllabusOpen ? 'text-purple-400 border-purple-500/50 rotate-[360deg]' : 'text-white/50 hover:text-white hover:border-white/30'}`}
                                    title="Lessons Menu"
                                >
                                    <BookOpen className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2 bg-[#111]/90 backdrop-blur-2xl p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 focus-within:border-purple-500/50 transition-all">

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
            </div>
        </main>
    );
}
