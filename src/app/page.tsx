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

    const handleNextModule = async () => {
        if (!curriculum || curriculum.currentIndex >= curriculum.modules.length - 1) {
            // Finished curriculum
            setCurriculum(null);
            setCurrentLessonTitle(null);
            setCurrentLessonContent(null);
            setCurrentHtmlGraphic(null);
            setCurrentTestContent(null);
            setMessages(prev => [...prev, { role: 'assistant', content: "That concludes the curriculum! What would you like to learn next?" }]);
            return;
        }
        const nextIndex = curriculum.currentIndex + 1;
        setCurriculum({ ...curriculum, currentIndex: nextIndex });
        await teachModule(curriculum.topic, curriculum.modules[nextIndex], nextIndex, curriculum.modules.length);
    };
    const { listen, stopListening, isListening } = useSpeech();
    const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
    const [currentReply, setCurrentReply] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrlToSpeak, setAudioUrlToSpeak] = useState<string | null>(null);
    const [audioQueue, setAudioQueue] = useState<{url: string, text: string}[]>([]);
    const [currentCaption, setCurrentCaption] = useState('');

    // Audio Queue Processor: Plays sentences sequentially as they arrive!
    useEffect(() => {
        if (!isSpeaking && audioQueue.length > 0) {
            setAudioUrlToSpeak(audioQueue[0].url);
            setCurrentCaption(audioQueue[0].text);
            setIsSpeaking(true);
            setAudioQueue(prev => prev.slice(1));
        }
    }, [isSpeaking, audioQueue]);

    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isFullscreenPrompted, setIsFullscreenPrompted] = useState(false);
    
    useEffect(() => {
        setIsMobileDevice(window.innerWidth < 1024 || navigator.maxTouchPoints > 0);
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    }, []);

    const enterFullscreen = () => {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().then(() => {
                try {
                    const orientation: any = window.screen.orientation;
                    if (orientation && orientation.lock) {
                        orientation.lock("landscape").catch((e: any) => console.warn(e));
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
                let spokenSentencesCount = 0;
                const fullReply = await generateResponse(finalMessages, (chunk) => {
                    setCurrentReply(chunk);
                    const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [];
                    while (sentences.length > spokenSentencesCount) {
                        const newSentence = sentences[spokenSentencesCount].trim();
                        spokenSentencesCount++;
                        if (newSentence.length > 2) {
                            setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                        }
                    }
                });
                
                let cleanReply = fullReply.replace(/#/g, '').replace(/\[|\]/g, '').replace(/\*/g, '').trim();
                const sentences = cleanReply.match(/[^.!?]+[.!?]+/g) || [];
                const spokenLength = sentences.join('').length;
                if (cleanReply.length > spokenLength + 2) {
                     const finalSentence = cleanReply.substring(spokenLength).trim();
                     setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
                }

                setCurrentLessonContent(prev => {
                    if (!prev || prev === "Listening to Shizuku...") return "- " + cleanReply;
                    return prev + '\n- ' + cleanReply;
                });
                setMessages([...newMessages, { role: 'assistant', content: cleanReply }]);
                setCurrentReply('');
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
                while (sentences.length > spokenSentencesCount) {
                    const newSentence = sentences[spokenSentencesCount].trim();
                    spokenSentencesCount++;
                    if (newSentence.length > 2) {
                        setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                    }
                }
            });
            
            const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').trim();
            const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
            const spokenLength = sentences.join('').length;
            if (cleanSpeech.length > spokenLength + 2) {
                 const finalSentence = cleanSpeech.substring(spokenLength).trim();
                 setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
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
        setCurrentLessonContent("Generating visual aids...");
        setCurrentMediaUrl(null);
        setCurrentVideoId(null);
        setCurrentTestContent(null);
        setCurrentHtmlGraphic(null);
        setCurrentModuleInfo(`Module ${idx + 1} of ${total}: ${moduleName}`);
        
        // Phase 1: Graphics
        setIsSourcing(true);
        const useVideo = Math.random() > 0.5;
        
        if (useVideo) {
            setCurrentLessonContent("Finding a related YouTube video...");
            setCurrentHtmlGraphic(`[VIDEO: search: ${moduleName} ${topic} tutorial]`);
        } else {
            setCurrentLessonContent("Generating visual aids...");
            const GRAPHICS_PROMPT = `Describe a highly detailed, educational illustration for "${moduleName}" in the context of "${topic}".
Output ONLY a short descriptive prompt for an AI image generator. Example: "A man pushing a heavy box across a floor to demonstrate physical force and friction."`;
            try {
                const chartReply = await generateResponse([
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: GRAPHICS_PROMPT }
                ], () => {});
                const cleanPrompt = chartReply.replace(/["\n\[\]]/g, '').trim();
                if (cleanPrompt.length > 5) {
                    setCurrentHtmlGraphic(`[IMAGES: ${JSON.stringify([cleanPrompt])}]`);
                }
            } catch(e) {}
        }
        setIsSourcing(false);

        // Phase 2: Lecture
        setCurrentLessonContent("Listening to Momentum...");
        const SYSTEM_PROMPT = `You are Momentum, a virtual teacher. You are teaching: "${moduleName}" for the topic "${topic}".
Provide a fascinating, highly detailed introductory explanation. DO NOT use formatting, lists, or markdown. Use natural speech.`;

        let cleanSpeech = '';
        try {
            let spokenSentencesCount = 0;
            const fullReply = await generateResponse([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Please start teaching ${moduleName} now.` }
            ], (chunk) => {
                setCurrentReply(chunk);
                const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '');
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                while (sentences.length > spokenSentencesCount) {
                    const newSentence = sentences[spokenSentencesCount].trim();
                    spokenSentencesCount++;
                    if (newSentence.length > 2) {
                        setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                    }
                }
            });
            
            cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').trim();
            const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
            const spokenLength = sentences.join('').length;
            if (cleanSpeech.length > spokenLength + 2) {
                 const finalSentence = cleanSpeech.substring(spokenLength).trim();
                 setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
            }
            
            // Phase 3: Pop Quiz Generation
            setCurrentLessonContent("- " + cleanSpeech);
            setCurrentReply("Generating Pop Quiz...");
            
            const QUIZ_PROMPT = `Based on your explanation of "${moduleName}", generate a single multiple-choice question to test the student.
CRITICAL: Output STRICTLY in JSON format and nothing else.
Format:
{
  "question": "What is...",
  "options": ["A", "B", "C"],
  "answer": "A",
  "explanation": "Because..."
}`;
            
            const quizReply = await generateResponse([
                { role: 'system', content: 'You are an educational quiz generator.' },
                { role: 'user', content: `Here is the explanation you gave: ${cleanSpeech}\n\n${QUIZ_PROMPT}` }
            ], () => {});
            
            try {
                const jsonMatch = quizReply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const quizData = JSON.parse(jsonMatch[0]);
                    setCurrentTestContent(JSON.stringify(quizData));
                }
            } catch(e) {}
            
            setCurrentReply('');
            setMessages([...messages, { role: 'assistant', content: cleanSpeech }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const startCurriculum = async (topic: string) => {
        setIsGenerating(true);
        setCurrentLessonTitle("Planning Curriculum...");
        setCurrentLessonContent("Thinking...");
        const MODULE_PROMPT = `Generate a 3-module curriculum outline for teaching "${topic}". 
CRITICAL: Output STRICTLY as a JSON array of strings. Do not include any other text.
Example: ["1. Introduction to Topic", "2. Deep Dive into X", "3. Advanced Uses"]`;
        
        let modules = ["1. Introduction & Basics", "2. Core Concepts", "3. Real-World Applications"];
        try {
            const reply = await generateResponse([
                { role: 'system', content: 'You are an educational curriculum planner.' },
                { role: 'user', content: MODULE_PROMPT }
            ], () => {});
            const jsonMatch = reply.match(/\[[\s\S]*\]/);
            let parsedSuccessfully = false;
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        modules = parsed;
                        parsedSuccessfully = true;
                    }
                } catch (e) {}
            }
            if (!parsedSuccessfully) {
                const lines = reply.split('\n');
                const extracted = lines.map(l => l.trim()).filter(l => /^(?:[0-9]+[.)]|-|\*)\s+.+/.test(l));
                if (extracted.length > 0) {
                    modules = extracted.map(m => m.replace(/^(?:[0-9]+[.)]|-|\*)\s+/, '').replace(/"/g, ''));
                } else {
                    const backupMatch = reply.match(/"([^"]+)"/g);
                    if (backupMatch && backupMatch.length > 0) {
                        modules = backupMatch.map(m => m.replace(/"/g, ''));
                    }
                }
            }
        } catch(e) {
            console.error("Curriculum generation failed:", e);
            setCurrentLessonTitle("System Error");
            setCurrentLessonContent("Failed to generate curriculum. The AI engine may have crashed due to memory limits. Please reload the page.");
            setIsGenerating(false);
            return;
        }
        setIsGenerating(false);

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
        if (isSpeaking && currentCaption) {
            return currentCaption;
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
        <main className="flex h-[100dvh] w-full text-white overflow-hidden relative" style={{
            background: "#0a0a0c radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.05) 40%, transparent 80%)"
        }}>
            {/* Fullscreen Overlay Prompt for Mobile */}
            {isMobileDevice && !isFullscreenPrompted && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                    onClick={enterFullscreen}
                >
                    {isIOS && (
                        <>
                            {/* Portrait Arrow (Bottom Center) */}
                            <div className="portrait:flex hidden absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center animate-bounce text-yellow-400 pointer-events-none">
                                <p className="font-bold mb-2 text-2xl text-center shadow-black drop-shadow-xl">Tap Share &<br/>Add to Home Screen!</p>
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                            </div>
                            {/* Landscape Arrow (Top Right) */}
                            <div className="landscape:flex hidden absolute top-8 right-16 flex-col items-end animate-bounce text-yellow-400 pointer-events-none">
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                <p className="font-bold mt-2 text-2xl text-right shadow-black drop-shadow-xl w-64">Tap Share up here &<br/>Add to Home Screen!</p>
                            </div>
                        </>
                    )}

                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Tap to Start</h2>
                    <p className="text-white/60 text-lg max-w-md mb-8">
                        Let's begin the interactive lesson!
                    </p>
                </div>
            )}


            {/* Main Stage area (AgentFace & Chalkboard) */}
            <div className="flex-1 relative flex">
                
                {hasWebGPUError && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto p-4">
                        <div className="bg-[#111] p-6 lg:p-8 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(248,113,113,0.3)] border border-red-500/30">
                            <h2 className="text-2xl lg:text-3xl font-black text-white mb-4">WebGPU Error</h2>
                            <p className="text-gray-300 mb-6 text-sm lg:text-base leading-relaxed">
                                Your device or browser does not support WebGPU, or it is disabled.
                                <br/><br/>
                                Please use a modern browser (like Chrome or Edge) on a compatible device to run the local AI engine.
                            </p>
                        </div>
                    </div>
                )}

                {/* Centered Main Stage */}
                <div className="flex-1 flex flex-col items-center justify-center relative p-0 lg:p-8">
                    
                    {/* Purple Blur Background for Voice */}
                    <div className={`absolute left-1/2 -translate-x-1/2 top-12 w-[600px] h-[300px] rounded-[100%] blur-[120px] pointer-events-none transition-all duration-1000 z-10 ${isSpeaking ? 'bg-purple-600/50 animate-pulse' : 'bg-transparent'}`}></div>

                    {/* Blackboard - Massive Slate */}
                    <div className={`hidden lg:flex transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex-col justify-center w-[95vw] h-[85vh] max-w-[1600px] z-20 ${currentLessonTitle ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
                        <LessonBoard 
                            title={currentLessonTitle} 
                            content={currentLessonContent} 
                            mediaUrl={currentMediaUrl}
                            videoId={currentVideoId}
                            testContent={currentTestContent}
                            moduleInfo={currentModuleInfo}
                            htmlGraphic={currentHtmlGraphic}
                            isSpeaking={isSpeaking}
                            onNextModule={handleNextModule}
                        />
                    </div>

                    {/* Agent Face Floating Over Blackboard or Fullscreen */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col items-center gap-4 ${
                        currentLessonTitle 
                            ? 'top-1/2 -translate-y-1/2 w-full h-full scale-100 lg:-top-8 lg:-translate-y-0 lg:w-auto lg:h-auto lg:scale-[0.50]' 
                            : 'top-1/2 -translate-y-1/2 w-full h-full scale-100'
                    }`}>
                        <AgentFace 
                            state={isGenerating ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} 
                            className={`shadow-[0_0_80px_rgba(139,92,246,0.5)] transition-all duration-1000 rounded-none border-0 w-full h-full ${
                                currentLessonTitle ? 'lg:rounded-[3rem] lg:border-4 lg:border-white/10 lg:w-[280px] lg:h-[280px]' : ''
                            }`}
                        />

                        {/* Status Indicator Below Face */}
                        {(isSourcing || (!isLoaded && isLoading) || isGenerating || (!isLoaded && progressText.includes('Error'))) && (
                            <div className={`flex items-center gap-2 text-sm font-semibold bg-[#111]/80 backdrop-blur-md px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 ${progressText.includes('Error') ? 'text-red-400' : 'text-purple-300'}`}>
                                {(!progressText.includes('Error') || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSourcing ? "Sourcing live data..." : !isLoaded ? (progressText || 'Booting AI Engine...') : "Thinking..."}
                                {!isLoading && progressText.includes('Error') && (
                                    <button onClick={() => window.location.reload()} className="ml-2 px-3 py-1 bg-white/10 rounded-md hover:bg-white/20 transition-colors text-xs text-white border border-white/20">Retry</button>
                                )}
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
                <div className="absolute bottom-32 lg:bottom-4 left-[50%] -translate-x-[50%] w-[90vw] lg:max-w-xl z-[60] flex flex-col items-center justify-end pointer-events-none lg:mb-[120px]">
                    <AnimatePresence>
                        {(isSpeaking || isGenerating) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full px-4 lg:px-6 py-2 lg:py-4 rounded-xl lg:rounded-2xl backdrop-blur-3xl shadow-2xl leading-relaxed text-gray-100 border border-white/20 pointer-events-auto text-center flex items-center justify-center min-h-[40px] max-h-[80px] lg:min-h-[60px] lg:max-h-[100px] overflow-hidden bg-[#0a0a0c]/90"
                                style={{
                                    fontFamily: "'SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Helvetica_Neue',sans-serif",
                                    fontSize: '1rem',
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
