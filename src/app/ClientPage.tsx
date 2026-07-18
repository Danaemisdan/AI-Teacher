'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { getBaseTeacherPrompt, getMasterRouterPrompt, quickDomainLookup } from '@/config/TeacherConfig';
import { resolveTool } from '@/config/ToolsDB';
import { fetchKnowledge } from '@/lib/KnowledgeDB';
import { safeJsonParse } from '@/lib/jsonHelper';
import { useSpeech } from '@/lib/useSpeech';
import { useWebLLM } from '@/lib/useWebLLM';
import { Mic, MicOff, Loader2, Send, BookOpen, SquarePen, Search, Clock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Removed VTuberCanvas
import LessonBoard from '@/components/LessonBoard';
import ConceptDiagramEngine from '@/components/ConceptDiagramEngine';
import AnatomyEngine from '@/components/AnatomyEngine';
import { AgentFace } from '@/components/AgentFace';
import { AssetManager } from '@/lib/AssetManager';
import { RuntimeBridge } from '@/lib/bridge/RuntimeBridge';
import { LegacySpeechBridge } from '@/lib/bridge/LegacySpeechBridge';

export type PreparationStatus = 'Pending' | 'Running' | 'Completed' | 'Skipped' | 'Recovering';

export interface LessonPreparationPhase {
    id: string;
    title: string;
    status: PreparationStatus;
}

export interface LessonPreparationState {
    isActive: boolean;
    phases: LessonPreparationPhase[];
    activePhaseId: string | null;
}


export interface CurriculumModule {
    title: string;
    primaryConcept: string;
    secondaryConcepts: string[];
    domain: string;
    visualizationHints?: string;
}

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
    const [avatarState, setAvatarState] = useState<any>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrlToSpeak, setAudioUrlToSpeak] = useState<string | null>(null);
    const [audioQueue, setAudioQueue] = useState<{url?: string, text?: string, highlight?: string, note?: string, quiz?: any, quizzes?: any[], pauseMs?: number}[]>([]);
    const [currentCaption, setCurrentCaption] = useState('');
    const [currentHighlightId, setCurrentHighlightId] = useState<string | null>(null);
    const [currentLessonNotes, setCurrentLessonNotes] = useState<string[]>([]);
    const [isWaitingForQuiz, setIsWaitingForQuiz] = useState(false);
    const [visDebug, setVisDebug] = useState<any>(null);

    // Audio Queue Processor: Plays sequentially as they arrive!
    useEffect(() => {
        if (!isSpeaking && !isWaitingForQuiz && audioQueue.length > 0) {
            const item = audioQueue[0];
            
            if (item.pauseMs) {
                setIsSpeaking(true); // block queue
                setTimeout(() => {
                    setIsSpeaking(false);
                }, item.pauseMs);
                setAudioQueue(prev => prev.slice(1));
                return;
            }
            
            if (item.text && item.url) {
                setAudioUrlToSpeak(item.url);
                setCurrentCaption(item.text);
                setIsSpeaking(true);
            }
            if (item.highlight) {
                setCurrentHighlightId(item.highlight);
            } else if (item.text && item.url) {
                setCurrentHighlightId(null);
            }
            if (item.note) {
                setCurrentLessonNotes(prev => [...prev, item.note!]);
            }
            if (item.quizzes) {
                setCurrentTestContent(JSON.stringify(item.quizzes));
                setIsWaitingForQuiz(true);
            } else if (item.quiz) {
                setCurrentTestContent(JSON.stringify([item.quiz]));
                setIsWaitingForQuiz(true);
            }
            
            setAudioQueue(prev => prev.slice(1));
        }
    }, [isSpeaking, isWaitingForQuiz, audioQueue]);

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
    const [curriculum, setCurriculum] = useState<{ topic: string, modules: CurriculumModule[], currentIndex: number, isTeaching: boolean } | null>(null);
    const [teachingPhase, setTeachingPhase] = useState<'lecture' | 'challenge' | 'quiz' | null>(null);
    const [baseBrainKnowledge, setBaseBrainKnowledge] = useState<string[]>([]);
    
    const [agentSubtitle, setAgentSubtitle] = useState<string | null>(null);

    const CHAPTERS = [
        "Chapter 1: The Cosmos & Black Holes",
        "Chapter 2: Quantum Mechanics",
        "Chapter 3: The Roman Empire",
        "Chapter 4: Artificial Intelligence"
    ];

    useEffect(() => {
        if (!hasWebGPUError) {
            init();
        }

        // Connect Avatar Executor to the UI
        import('@/lib/execution/EventBus').then(({ EventBus }) => {
            EventBus.subscribe('AvatarSpeaking', () => setAvatarState('speaking'));
            EventBus.subscribe('AvatarThinking', () => setAvatarState('thinking'));
            EventBus.subscribe('AvatarListening', () => setAvatarState('listening'));
            EventBus.subscribe('AvatarHighlighting', () => setAvatarState('surprised'));
            EventBus.subscribe('AvatarCelebrating', () => setAvatarState('happy'));
            EventBus.subscribe('AvatarFailed', () => setAvatarState('error'));
            EventBus.subscribe('AvatarIdle', () => setAvatarState('idle'));
            EventBus.subscribe('AvatarPaused', () => setAvatarState('sleeping'));
        });
        
        RuntimeBridge.initialize();
        LegacySpeechBridge.initialize();
    }, [init, hasWebGPUError]);

    const [inputText, setInputText] = useState('');
    const [currentToolAction, setCurrentToolAction] = useState<any>(null);

    const handleToolEvent = (eventData: any) => {
        const context = `[System Notification: The user just interacted with the tool. Action details: ${typeof eventData === 'object' ? JSON.stringify(eventData) : eventData}. Acknowledge this or guide them further. Keep it very short.]`;
        processPrompt(context);
    };

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

            if (teachingPhase === 'challenge') {
                // Phase 3: Evaluate and Quiz
                setTeachingPhase('quiz');
                
                const EVAL_PROMPT = `You are the Examiner.
Base Knowledge: ${baseBrainKnowledge.join('\n')}
Assistant's Challenge: "${messages[messages.length-1].content}"
User's Answer: "${promptText}"

Evaluate the user's answer accurately. If correct, praise them. If wrong, correct them. Be conversational and use natural speech.`;
                
                try {
                    let spokenSentencesCount = 0;
                    const evalReply = await generateResponse([
                        { role: 'system', content: 'You are the Examiner.' },
                        { role: 'user', content: EVAL_PROMPT }
                    ], (chunk) => {
                        const displayReply = chunk.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '');
                        setCurrentReply(displayReply);
                        const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [];
                        while (sentences.length > spokenSentencesCount) {
                            const newSentence = sentences[spokenSentencesCount].trim();
                            spokenSentencesCount++;
                            if (newSentence.length > 2) {
                                setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                            }
                        }
                    });

                    let cleanEval = evalReply.replace(/#/g, '').replace(/\[|\]/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
                    const sentences = cleanEval.match(/[^.!?]+[.!?]+/g) || [];
                    const spokenLength = sentences.join('').length;
                    if (cleanEval.length > spokenLength + 2) {
                         const finalSentence = cleanEval.substring(spokenLength).trim();
                         setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
                    }
                    
                    setBaseBrainKnowledge(prev => [...prev, `User Answer: ${promptText}`, `Examiner Eval: ${cleanEval}`]);
                    
                    setCurrentLessonContent(prev => prev + '\n\n**Examiner Evaluation:**\n' + cleanEval);
                    setMessages([...newMessages, { role: 'assistant', content: cleanEval }]);
                    
                    // Generate Pop Quiz
                    setCurrentReply("Generating Pop Quiz...");
                    const QUIZ_PROMPT = `Generate a single multiple-choice question to test the student on this module.
The options MUST contain the actual full text of the possible answers.
Example:
{"question": "What is X?", "options": ["X is Y", "X is Z", "X is A"], "answer": "X is Y", "explanation": "Because X is Y."}`;
                    
                    const quizReply = await generateResponse([
                        { role: 'system', content: `You are an educational quiz generator. Base Knowledge: ${baseBrainKnowledge.join('\n')}` },
                        { role: 'user', content: QUIZ_PROMPT }
                    ], () => {});
                    
                    try {
                        const jsonMatch = quizReply.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const quizData = safeJsonParse(jsonMatch[0], null);
                            if (quizData) {
                                setCurrentTestContent(JSON.stringify(quizData));
                            }
                        }
                    } catch(e) {}
                    
                    setCurrentReply('');

                } catch (error) {
                    console.warn("Eval generation failed:", error);
                } finally {
                    setIsGenerating(false);
                }
                return;
            }

            // General conversational fallback
            const SYSTEM_PROMPT = `You are Momentum, a virtual teacher. You are currently teaching ${curriculum.modules[curriculum.currentIndex]}.
Base Knowledge:
${baseBrainKnowledge.join('\n')}

User said: "${promptText}"
Reply conversationally. End your response by asking a thought-provoking question to continue the lesson.

CRITICAL TEACHER PERSONA:
1. You MUST sound like an experienced, warm human teacher. 
2. DO NOT use robotic phrases like "Intent detected", "Loading renderer", "Executing strategy", "Generating response", or "Processing request".
3. DO NOT use bullet points, bold text, or lists. Just natural speech.

CRITICAL VISUAL RULE:
If the user's topic relates to ANY physical object, science topic, physics concept, biology concept, economic concept, or math equation, you MUST output a simple intent block at the VERY BEGINNING of your response.
Format: [INTENT: topic_name]

EXAMPLES:
- If user asks about friction: [INTENT: friction] Let's look at how friction works in the real world...
- If user asks about supply and demand: [INTENT: supply and demand] Imagine you are selling apples...`;

            const finalMessages = [
                { role: 'user' as const, content: SYSTEM_PROMPT }
            ];

            try {
                let spokenSentencesCount = 0;
                const fullReply = await generateResponse(finalMessages, (chunk) => {
                    const displayReply = chunk.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '');
                    setCurrentReply(displayReply);
                    
                    const drawMatch = chunk.match(/\[DRAW:\s*(<svg[\s\S]*?<\/svg>)\s*\]/i);
                    if (drawMatch && drawMatch[1]) {
                        setCurrentHtmlGraphic(drawMatch[1]);
                    }
                    // ENGINE ROUTER
                    const engineMatch = chunk.match(/\[ENGINE:\s*([^\]]+)\]\s*([\s\S]*?)\s*\[\/ENGINE\]/i);
                    if (engineMatch && engineMatch[1] && engineMatch[2]) {
                        const engineName = engineMatch[1].trim();
                        const queryContent = engineMatch[2].trim();
                        setCurrentHtmlGraphic(`[ENGINE_ROUTER: ${engineName} | ${queryContent}]`);
                    }
                    // TOOL ORCHESTRATOR
                    const toolMatch = chunk.match(/\[TOOL_ACTION:\s*([\s\S]*?)\s*\]/i);
                    if (toolMatch && toolMatch[1]) {
                        try {
                            const actionData = JSON.parse(toolMatch[1]);
                            setCurrentToolAction(actionData);
                        } catch (e) {
                            console.warn("Failed to parse TOOL_ACTION JSON", e);
                        }
                    }
                    
                    const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[ENGINE:[\s\S]*?\[\/ENGINE\]/gi, '').replace(/\[TOOL_ACTION:[\s\S]*?\]/gi, '');
                    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                    while (sentences.length > spokenSentencesCount) {
                        const newSentence = sentences[spokenSentencesCount].trim();
                        spokenSentencesCount++;
                        if (newSentence.length > 2) {
                            setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                        }
                    }
                });
                
                const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[ENGINE:[\s\S]*?\[\/ENGINE\]/gi, '').trim();
                const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
                const spokenLength = sentences.join('').length;
                if (cleanSpeech.length > spokenLength + 2) {
                     const finalSentence = cleanSpeech.substring(spokenLength).trim();
                     setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
                }
                
                setBaseBrainKnowledge(prev => [...prev, `User Answer: ${promptText}`, `Momentum: ${cleanSpeech}`]);
                setMessages([...newMessages, { role: 'assistant', content: fullReply }]);
                setCurrentReply('');
            } catch (error) {
                console.warn("Chat generation failed:", error);
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        // Intercept teaching/explaining requests in normal chat and start a curriculum lesson
        const isQuestion = /^(can you )?(please )?(explain|teach|tell me about|what is|how does|what are|I want to learn) /i.test(lower);
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
                console.warn("Failed to fetch web context", e);
            }
        }
        setIsSourcing(false);
        const SYSTEM_PROMPT = curriculum?.isTeaching 
            ? getBaseTeacherPrompt(curriculum.topic, true, `The student just replied to your question. Evaluate their understanding.\nIf they are confused or wrong, mock them playfully, correct them, and explain the concept again simply.\nIf they are correct, give them sarcastic praise and move on to the next chunk of the lesson!`)
            : getBaseTeacherPrompt(promptText, false) + (webContext ? `\nUse this context if helpful: ${webContext}` : '');
        const finalMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...newMessages
        ];

        try {
            let spokenSentencesCount = 0;
            let parsedFramesCount = 0;
            
            const fullReply = await generateResponse(finalMessages, (chunk) => {
                const displayReply = chunk.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '');
                setCurrentReply(displayReply);
                
                if (curriculum?.isTeaching) {
                    // --- Socratic Interactive Teaching Parser ---
                    const frames = [...chunk.matchAll(/\[\s*(SPEECH|NOTE|HIGHLIGHT|QUIZ)\s*\]([\s\S]*?)\[\s*\/\s*\1\s*\]/gi)];
                    
                    while (frames.length > parsedFramesCount) {
                        const frame = frames[parsedFramesCount];
                        parsedFramesCount++;
                        const type = frame[1].toUpperCase();
                        const content = frame[2].trim();
                        
                        if (type === 'SPEECH' || type === 'NOTE') {
                            let rawChunks: string[] = Array.from(content.match(/[^.!?\n]+[.!?\n]+/g) || []);
                            const matchedLen = rawChunks.join('').length;
                            if (content.length > matchedLen) {
                                rawChunks.push(content.substring(matchedLen));
                            }
                            if (rawChunks.length === 0) rawChunks = [content];
                            const finalChunks: string[] = [];
                            
                            rawChunks.forEach(rawChunk => {
                                let remaining = rawChunk;
                                while (remaining.length > 200) {
                                    let splitIndex = remaining.lastIndexOf(' ', 200);
                                    if (splitIndex === -1) splitIndex = 200;
                                    finalChunks.push(remaining.substring(0, splitIndex));
                                    remaining = remaining.substring(splitIndex).trim();
                                }
                                if (remaining.trim()) {
                                    finalChunks.push(remaining.trim());
                                }
                            });

                            finalChunks.forEach((chunkText, index) => {
                                if (chunkText.trim()) {
                                    setAudioQueue(prev => [...prev, {
                                        url: '/api/tts?text=' + encodeURIComponent(chunkText.trim()), 
                                        text: chunkText.trim(),
                                        note: (type === 'NOTE' && index === 0) ? content.trim() : undefined
                                    }]);
                                }
                            });
                        } else if (type === 'HIGHLIGHT') {
                            setAudioQueue(prev => [...prev, { highlight: content }]);
                        } else if (type === 'QUIZ') {
                            const parsedQuiz = safeJsonParse(content, null);
                            if (parsedQuiz) setAudioQueue(prev => [...prev, { quiz: parsedQuiz }]);
                        } else if (type === 'TOOL_ACTION') {
                            const parsedAction = safeJsonParse(content, null);
                            if (parsedAction) setCurrentToolAction(parsedAction);
                        }
                    }
                } else {
                    // --- Normal Chat Parser ---
                    const drawMatch = chunk.match(/\[DRAW:\s*(<svg[\s\S]*?<\/svg>)\s*\]/i);
                    if (drawMatch && drawMatch[1]) {
                        setCurrentHtmlGraphic(drawMatch[1]);
                    }
                    
                    const imageMatches = [...chunk.matchAll(/\[IMAGE:\s*([\s\S]*?)\]/gi)].map(m => m[1].trim());
                    if (imageMatches.length > 0) {
                        setCurrentHtmlGraphic(`[IMAGES: ${JSON.stringify(imageMatches)}]`);
                    }
                    
                    const videoMatch = chunk.match(/\[VIDEO:\s*([\s\S]*?)\s*\]/i);
                    if (videoMatch && videoMatch[1]) {
                        setCurrentHtmlGraphic(`[VIDEO: ${videoMatch[1]}]`);
                    }

                    const assetsMatch = chunk.match(/\[ASSETS:\s*([\s\S]*?)\s*\]/i);
                    if (assetsMatch && assetsMatch[1]) {
                        setCurrentHtmlGraphic(`[ASSETS: ${assetsMatch[1]}]`);
                    }
                    
                    const chemMatch = chunk.match(/\[CHEMISTRY:\s*([\s\S]*?)\s*\]/i);
                    if (chemMatch && chemMatch[1]) {
                        setCurrentHtmlGraphic(`[CHEMISTRY: ${chemMatch[1]}]`);
                    }

                    const simMatch = chunk.match(/\[SIMULATION:\s*([\s\S]*?)\s*\]/i);
                    if (simMatch && simMatch[1]) {
                        setCurrentHtmlGraphic(`[SIMULATION: ${simMatch[1]}]`);
                    }

                    const conceptMatch = chunk.match(/\[CONCEPT:\s*([\s\S]*?)\s*\]/i);
                    if (conceptMatch && conceptMatch[1]) {
                        setCurrentHtmlGraphic(`[CONCEPT: ${conceptMatch[1]}]`);
                    }

                    const graphMatch = chunk.match(/\[GRAPH:\s*([\s\S]*?)\s*\]/i);
                    if (graphMatch && graphMatch[1]) {
                        setCurrentHtmlGraphic(`[GRAPH: ${graphMatch[1]}]`);
                    }

                    const anatomyMatch = chunk.match(/\[ANATOMY:\s*([\s\S]*?)\s*\]/i);
                    if (anatomyMatch && anatomyMatch[1]) {
                        setCurrentHtmlGraphic(`[ANATOMY: ${anatomyMatch[1]}]`);
                    }
                    
                    const intentMatch = chunk.match(/\[INTENT:\s*([\s\S]*?)\s*\]/i);
                    if (intentMatch && intentMatch[1]) {
                        setCurrentHtmlGraphic(`[INTENT: ${intentMatch[1]}]`);
                    }

                    const toolMatch = chunk.match(/\[TOOL_ACTION:\s*([\s\S]*?)\s*\]/i);
                    if (toolMatch && toolMatch[1]) {
                        const parsedAction = safeJsonParse(toolMatch[1], null);
                        if (parsedAction) setCurrentToolAction(parsedAction);
                    }

                    let cleanText = chunk.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '');
                    
                    cleanText = cleanText.replace(/!?\[.*?\]\(.*?\)/g, '');
                    cleanText = cleanText.replace(/\\\[[\s\S]*?\\\]/g, '').replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\\\(.*?\\\)/g, '');
                    cleanText = cleanText.replace(/\[\s*\/?\s*(?:SPEECH|NOTE|HIGHLIGHT|QUIZ)\s*\]/gi, '');
                    
                    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                    while (sentences.length > spokenSentencesCount) {
                        const newSentence = sentences[spokenSentencesCount].trim();
                        spokenSentencesCount++;
                        if (newSentence.length > 2) {
                            setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(newSentence), text: newSentence }]);
                        }
                    }
                }
            });
            
            if (!curriculum?.isTeaching) {
                const cleanSpeech = fullReply.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '').trim();
                const sentences = cleanSpeech.match(/[^.!?]+[.!?]+/g) || [];
                const spokenLength = sentences.join('').length;
                if (cleanSpeech.length > spokenLength + 2) {
                     const finalSentence = cleanSpeech.substring(spokenLength).trim();
                     setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(finalSentence), text: finalSentence }]);
                }
            }
            
            setMessages([...newMessages, { role: 'assistant', content: fullReply }]);
            setCurrentReply('');
        } catch (error) {
            console.warn("Chat generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const teachModule = async (topic: string, moduleInfo: CurriculumModule, idx: number, total: number, triggerPrompt?: string) => {
        console.log(`[ORCHESTRATOR] ENTER teachModule for topic: ${topic}`);
        const moduleName = moduleInfo.title;
        setIsGenerating(true);
        setTeachingPhase('lecture');
        setCurrentReply('');
        setCurrentLessonTitle(moduleName.replace(/^[0-9.]+\s*/, '')); // Clean title
        setCurrentLessonContent(null); // Clear content to allow skeleton rendering
        setCurrentMediaUrl(null);
        setCurrentVideoId(null);
        setCurrentTestContent(null);
        setCurrentHtmlGraphic(null);
        setCurrentModuleInfo(`Module ${idx + 1} of ${total}: ${moduleName}`);
        setIsWaitingForQuiz(false);
        setCurrentLessonNotes([]);
        
        // Immediate Intro Speech (Parallel Execution)
        const openers = [
            "Great question. Let's explore this.",
            "Let's break this down.",
            "This is an interesting concept.",
            "Let's start with the basics.",
            "Let's understand this together.",
            "Imagine you're seeing this for the first time..."
        ];
        const introText = openers[Math.floor(Math.random() * openers.length)];
        setAudioQueue([{
            url: '/api/tts?text=' + encodeURIComponent(introText),
            text: introText
        }, { pauseMs: 1000 }]);
        
        // --- PHASE 6.1: RUNTIME INTEGRATION LAYER ---
        // Instead of concurrent generation, we now delegate visualization planning & execution to AI Teacher 3.0
        // Speech generation is held back until Visualization is completely ready.
        
        const generateLessonPlan = async () => {
            console.log(`[ORCHESTRATOR] ENTER generateLessonPlan (Legacy LLM) for topic: ${topic}`);
            const t0 = Date.now();
            const domainKey = quickDomainLookup(topic)?.domainKey;
            const wikipediaKnowledge = await fetchKnowledge(topic, domainKey);
            
            let extraContext = "";
            if (wikipediaKnowledge) {
                extraContext += `ADDITIONAL WIKIPEDIA CONTEXT (Source: ${wikipediaKnowledge.source}):\n${wikipediaKnowledge.summary}\n`;
            }

            const SYSTEM_PROMPT = getBaseTeacherPrompt(topic, true, extraContext);

            try {
                console.log(`[ORCHESTRATOR] generateLessonPlan: Awaiting LLM response...`);
                const fullReply = await generateResponse([
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Start teaching the first chunk of ${moduleName}. Remember, output ONLY raw JSON.` }
                ], () => {});
                console.log(`[ORCHESTRATOR] generateLessonPlan: LLM response received. DURATION: ${Date.now() - t0}ms`);
                
                // Parse the JSON LessonPlan
                const jsonMatch = fullReply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const plan = safeJsonParse(jsonMatch[0], null) as any;
                    if (plan) {
                        const newQueue: any[] = [];
                        
                        // 1. Introduction
                        if (plan.introduction?.speech) {
                            newQueue.push({ url: '/api/tts?text=' + encodeURIComponent(plan.introduction.speech), text: plan.introduction.speech });
                            newQueue.push({ pauseMs: 1000 }); // Natural pause after intro
                        }
                        
                        // 2. Concepts
                        if (Array.isArray(plan.concepts)) {
                            plan.concepts.forEach((concept: any, index: number) => {
                                if (index === 0) {
                                    newQueue.push({ highlight: '__SHOW_MEDIA__' });
                                    newQueue.push({ pauseMs: 500 });
                                }
                                if (concept.visualElement && concept.visualElement !== 'none') {
                                    newQueue.push({ highlight: concept.visualElement });
                                    newQueue.push({ pauseMs: 500 }); // Let the user see the highlight before speaking
                                }
                                
                                const chunks = (concept.speech || '').match(/[^.!?]+[.!?]+/g) || [concept.speech || ''];
                                chunks.forEach((chunk: string, idx: number) => {
                                    if (chunk && chunk.trim()) {
                                        newQueue.push({
                                            url: '/api/tts?text=' + encodeURIComponent(chunk.trim()),
                                            text: chunk.trim(),
                                            note: (idx === 0 && concept.note) ? concept.note : undefined
                                        });
                                    }
                                });
                                newQueue.push({ pauseMs: 1000 }); // Pause between concepts
                            });
                        }
                        
                        // 3. Example
                        if (plan.example?.speech) {
                            newQueue.push({ highlight: null }); // Clear highlights for example
                            const chunks = (plan.example.speech || '').match(/[^.!?]+[.!?]+/g) || [plan.example.speech || ''];
                            chunks.forEach((chunk: string) => {
                                if (chunk && chunk.trim()) {
                                    newQueue.push({ url: '/api/tts?text=' + encodeURIComponent(chunk.trim()), text: chunk.trim() });
                                }
                            });
                            newQueue.push({ pauseMs: 1500 });
                        }
                        
                        // 4. Reflection / Wrap Up
                        if (plan.reflection?.speech) {
                            newQueue.push({ highlight: '__SHOW_NOTES__' });
                            const chunks = (plan.reflection.speech || '').match(/[^.!?]+[.!?]+/g) || [plan.reflection.speech || ''];
                            chunks.forEach((chunk: string) => {
                                if (chunk && chunk.trim()) {
                                    newQueue.push({ url: '/api/tts?text=' + encodeURIComponent(chunk.trim()), text: chunk.trim() });
                                }
                            });
                            newQueue.push({ pauseMs: 3000 }); // Long pause to think
                        }
                        
                        // 5. Quiz
                        const providedQuizzes = plan.quizzes || plan.Quizzes || plan.quiz || plan.Quiz;
                        if (providedQuizzes && Array.isArray(providedQuizzes) && providedQuizzes.length > 0) {
                            newQueue.push({ quizzes: providedQuizzes });
                        } else if (providedQuizzes && typeof providedQuizzes === 'object') {
                            newQueue.push({ quizzes: [providedQuizzes] });
                        } else {
                            // Ironclad fallback quiz if LLM completely hallucinates or skips it
                            newQueue.push({ quizzes: [{
                                question: `Thinking about ${topic}, what is the main takeaway?`,
                                options: ["It fundamentally shapes the system.", "It has no real-world application.", "It contradicts basic logic.", "It only matters in isolation."],
                                answer: "It fundamentally shapes the system.",
                                explanation: `The principles of ${topic} are core to understanding the broader context.`
                            }]});
                        }
                        
                        setAudioQueue(prev => [...prev, ...newQueue]);
                        setBaseBrainKnowledge([`Topic: ${topic}`, `Module: ${moduleName}`, `Lesson Plan: ${JSON.stringify(plan)}`]);
                        console.log(`[ORCHESTRATOR] EXIT generateLessonPlan successfully. Audio queue populated with ${newQueue.length} items.`);
                    } else {
                        throw new Error("Parsed JSON was null or invalid.");
                    }
                } else {
                    console.warn(`[ORCHESTRATOR] generateLessonPlan: Failed to parse JSON from response. Reply:`, fullReply);
                    throw new Error("Failed to parse JSON from response.");
                }
            } catch (error) {
                console.warn("[ORCHESTRATOR] ERROR in generateLessonPlan:", error);
                const fallbackSpeech = "I'm having a bit of trouble organizing my thoughts right now, but I still have a question for you.";
                setAudioQueue(prev => [...prev, { url: '/api/tts?text=' + encodeURIComponent(fallbackSpeech), text: fallbackSpeech }, { quizzes: [{
                    question: `Based on what we just discussed about ${topic}, which of the following is most accurate?`,
                    options: ["The core principles apply in predictable ways.", "There is no correlation between the variables.", "It only applies in purely theoretical scenarios.", "The opposite of the expected outcome occurs."],
                    answer: "The core principles apply in predictable ways.",
                    explanation: `Understanding the fundamental principles of ${topic} allows us to make accurate predictions.`
                }] }]);
            }
        }; // end generateLessonPlan

    // Execute concurrently!
    console.log(`[ORCHESTRATOR] Awaiting Visual integration via RuntimeBridge and Speech via LegacySpeechBridge...`);
    
    // We queue the actual lesson speech to fire ONLY when VisualizationReady is emitted
    LegacySpeechBridge.queueSpeechTrigger(() => {
        generateLessonPlan().catch(console.error);
    });

    try {
        await RuntimeBridge.startLesson(topic, moduleInfo.domain, generateResponse);
    } catch (e) {
        console.error("[ORCHESTRATOR] RuntimeBridge Failed:", e);
        // Fallback if the AI Teacher 3.0 bridge fails:
        generateLessonPlan().catch(console.error);
    }
    
    console.log(`[ORCHESTRATOR] Runtime execution kicked off.`);
    
    setIsGenerating(false);

    setAgentSubtitle(null);
    console.log(`[ORCHESTRATOR] EXIT teachModule.`);
    };

    const startCurriculum = async (rawPrompt: string) => {
        setIsWaitingForQuiz(false);
        setCurrentLessonNotes([]);
        setIsGenerating(true);
        setCurrentLessonTitle(rawPrompt);
        setCurrentLessonContent(null);
        
        const registryContext = await AssetManager.getRegistryPromptContext();
        const MODULE_PROMPT = `Analyze the student's request: "${rawPrompt}".
Extract the core educational topic they want to learn. Then, generate a 3-module syllabus.
For each module, extract metadata to power the visualization engine.
Output ONLY a strict JSON object. NO EXPLANATIONS. NO MARKDOWN FORMATTING. Just raw JSON.
Format exactly like this (replace placeholders with actual extracted info):
{"topic": "Actual Topic Name Here", "modules": [
    {
        "title": "1. Introduction to [Topic]",
        "primaryConcept": "The single most visualizable core concept (e.g. Supply and Demand, Photosynthesis, Double helix)",
        "secondaryConcepts": ["concept A", "concept B"],
        "domain": "Economics",
        "visualizationHints": "Line graph showing X and Y"
    }
]}`;
        
        let extractedTopic = rawPrompt;
        let modules: CurriculumModule[] = [
            { title: "1. Introduction & Basics", primaryConcept: rawPrompt, secondaryConcepts: [], domain: "General" },
            { title: "2. Core Concepts", primaryConcept: rawPrompt, secondaryConcepts: [], domain: "General" },
            { title: "3. Real-World Applications", primaryConcept: rawPrompt, secondaryConcepts: [], domain: "General" }
        ];
        try {
            const reply = await generateResponse([
                { role: 'system', content: 'You are an educational curriculum planner.' },
                { role: 'user', content: MODULE_PROMPT }
            ], () => {});
            
            // Extract first valid JSON block
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = safeJsonParse(jsonMatch[0], null) as any;
                if (parsed && parsed.topic && Array.isArray(parsed.modules) && parsed.modules.length > 0) {
                    extractedTopic = parsed.topic;
                    modules = parsed.modules.map((m: any) => {
                        if (typeof m === 'string') {
                            return { title: m, primaryConcept: m, secondaryConcepts: [], domain: "General" };
                        }
                        return {
                            title: String(m.title || m),
                            primaryConcept: String(m.primaryConcept || m.title || extractedTopic),
                            secondaryConcepts: Array.isArray(m.secondaryConcepts) ? m.secondaryConcepts : [],
                            domain: String(m.domain || "General"),
                            visualizationHints: m.visualizationHints ? String(m.visualizationHints) : undefined
                        };
                    });
                }
            }
        } catch(e) {
            console.warn("Curriculum generation failed:", e);
            // Graceful fallback without showing system error
            setCurriculum({ topic: rawPrompt, modules: modules, currentIndex: 0, isTeaching: true });
            await teachModule(rawPrompt, modules[0], 0, modules.length);
            return;
        }
        setIsGenerating(false);

        setCurriculum({ topic: extractedTopic, modules, currentIndex: 0, isTeaching: true });
        await teachModule(extractedTopic, modules[0], 0, modules.length);
    };

    const handleTextSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputText.trim() && !isGenerating && isLoaded) {
            if (isSpeaking) {
                setAudioQueue([]);
                setAudioUrlToSpeak(null);
                setIsSpeaking(false);
                setCurrentHighlightId(null);
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
            setCurrentHighlightId(null);
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
            const cleanText = text.replace(/\[(?:TOOL_ACTION|DRAW|IMAGE|VIDEO|ASSETS|CHEMISTRY|SIMULATION|CONCEPT|ANATOMY|GRAPH|INTENT|MERMAID|SPEECH|NOTE|HIGHLIGHT|QUIZ)[^\]]*\]?/gi, '').trim();
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
                    <div className={`fixed inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex-col justify-center w-screen h-screen z-20 ${(currentLessonTitle || currentHtmlGraphic) ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
                            <LessonBoard 
                                title={currentLessonTitle} 
                                content={currentLessonContent} 
                                mediaUrl={currentMediaUrl}
                                videoId={currentVideoId}
                                testContent={currentTestContent}
                                moduleInfo={currentModuleInfo}
                                htmlGraphic={currentHtmlGraphic}
                                highlightId={currentHighlightId}
                                isSpeaking={isSpeaking || isGenerating}
                                isGenerating={isGenerating}
                                onNextModule={handleNextModule}
                                generateResponse={generateResponse}
                                notes={currentLessonNotes}
                                onQuizAnswered={() => {
                                    setCurriculum(prev => prev ? { ...prev, isTeaching: true } : null);
                                    processPrompt("I answered the quiz!");
                                }}
                                onToolEvent={handleToolEvent}
                                toolAction={currentToolAction}

                            />
                    </div>

                    {/* Agent Face Floating Over Blackboard or Fullscreen */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col items-center gap-4 ${
                        (currentLessonTitle || currentHtmlGraphic)
                            ? 'top-1/2 -translate-y-1/2 w-full h-full scale-100 lg:-top-8 lg:-translate-y-0 lg:w-auto lg:h-auto lg:scale-[0.50]'
                            : 'top-1/2 -translate-y-1/2 w-full h-full scale-100 opacity-100'
                    }`}>
                        <AgentFace 
                            state={avatarState} 
                            subtitle={agentSubtitle}
                            className={`shadow-[0_0_80px_rgba(139,92,246,0.5)] transition-all duration-1000 rounded-none border-0 w-full h-full ${
                                (currentLessonTitle || currentHtmlGraphic) ? 'lg:rounded-[3rem] lg:border-4 lg:border-white/10 lg:w-[280px] lg:h-[280px]' : ''
                            }`}
                        />

                        {/* Status Indicator Below Face */}
                        {(isSourcing || (!isLoaded && isLoading) || isGenerating || (!isLoaded && progressText.includes('Error'))) && (
                            <div className={`flex items-center gap-3 text-lg lg:text-2xl font-bold bg-[#111]/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 ${progressText.includes('Error') ? 'text-red-400' : 'text-purple-300'}`}>
                                {(!progressText.includes('Error') || isLoading) && <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />}
                                {isSourcing ? "Sourcing live data..." : !isLoaded ? (progressText || 'Booting AI Engine...') : agentSubtitle || "Generating..."}
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
                                    
                                    // Only trigger the mic if we are completely done speaking the queue AND it was a question!
                                    if (audioQueue.length === 0 && !isGenerating) {
                                        if (currentReply && currentReply.trim().endsWith('?')) {
                                            setTimeout(() => {
                                                const btn = document.getElementById('mic-button') as HTMLButtonElement | null;
                                                if (btn && !btn.disabled) btn.click();
                                            }, 500);
                                        }
                                    }
                                }}
                                onError={(e) => {
                                    console.warn('TTS Audio failed to play via Edge TTS API. Falling back to browser TTS...', e);
                                    
                                    // Fallback to browser's built-in TTS
                                    if ('speechSynthesis' in window && currentCaption) {
                                        const utterance = new SpeechSynthesisUtterance(currentCaption);
                                        // Try to find a female English voice
                                        const voices = window.speechSynthesis.getVoices();
                                        const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English')));
                                        if (femaleVoice) utterance.voice = femaleVoice;
                                        
                                        utterance.rate = 1.0;
                                        utterance.onend = () => {
                                            setIsSpeaking(false);
                                            setAudioUrlToSpeak(null);
                                            if (audioQueue.length === 0 && !isGenerating) {
                                                if (currentCaption && currentCaption.trim().endsWith('?')) {
                                                    setTimeout(() => {
                                                        const btn = document.getElementById('mic-button') as HTMLButtonElement | null;
                                                        if (btn && !btn.disabled) btn.click();
                                                    }, 500);
                                                }
                                            }
                                        };
                                        utterance.onerror = () => {
                                            setIsSpeaking(false);
                                            setAudioUrlToSpeak(null);
                                        };
                                        window.speechSynthesis.speak(utterance);
                                    } else {
                                        setIsSpeaking(false);
                                        setAudioUrlToSpeak(null);
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
                                placeholder={(!isLoaded || isGenerating) ? "Preparing your lesson..." : "Type your message or ask a question..."}
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
            
            {process.env.NEXT_PUBLIC_DEBUG_VIS === 'true' && visDebug && (
                <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl max-w-sm text-xs font-mono text-gray-300">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
                        <span className="font-bold text-white tracking-wider">VISUALIZATION PIPELINE</span>
                        <button onClick={() => setVisDebug(null)} className="text-gray-500 hover:text-white">&times;</button>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500">Concept:</span> <span className="text-blue-400 truncate ml-2">{visDebug.concept}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Domain:</span> <span className="text-purple-400">{visDebug.domain}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Renderer:</span> <span className="text-yellow-400">{visDebug.renderer}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Cache:</span> <span className={visDebug.cache === 'HIT' ? 'text-green-400' : 'text-orange-400'}>{visDebug.cache}</span></div>
                        {visDebug.registryResult && (
                            <div className="flex justify-between"><span className="text-gray-500">Registry ID:</span> <span className="text-gray-300">{visDebug.registryResult}</span></div>
                        )}
                        <div className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="text-gray-300">{visDebug.time}ms</span></div>
                        {visDebug.fallbackUsed && (
                            <div className="flex justify-between"><span className="text-gray-500">Fallback:</span> <span className="text-red-400">Used Safety Fallback</span></div>
                        )}
                        {visDebug.error && (
                            <div className="text-red-400 mt-2 p-2 bg-red-500/10 rounded">{visDebug.error}</div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
