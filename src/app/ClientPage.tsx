'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
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
    const [audioQueue, setAudioQueue] = useState<{url?: string, text?: string, highlight?: string, note?: string, quiz?: any}[]>([]);
    const [currentCaption, setCurrentCaption] = useState('');
    const [currentHighlightId, setCurrentHighlightId] = useState<string | null>(null);
    const [currentLessonNotes, setCurrentLessonNotes] = useState<string[]>([]);
    const [isWaitingForQuiz, setIsWaitingForQuiz] = useState(false);

    // Audio Queue Processor: Plays sequentially as they arrive!
    useEffect(() => {
        if (!isSpeaking && !isWaitingForQuiz && audioQueue.length > 0) {
            const item = audioQueue[0];
            
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
            if (item.quiz) {
                setCurrentTestContent(JSON.stringify(item.quiz));
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
    const [curriculum, setCurriculum] = useState<{ topic: string, modules: string[], currentIndex: number, isTeaching: boolean } | null>(null);
    const [teachingPhase, setTeachingPhase] = useState<'lecture' | 'challenge' | 'quiz' | null>(null);
    const [baseBrainKnowledge, setBaseBrainKnowledge] = useState<string[]>([]);

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
                    setCurrentReply(chunk);
                    
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
                    
                    const cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[ENGINE:[\s\S]*?\[\/ENGINE\]/gi, '');
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
                console.warn("Failed to fetch web context", e);
            }
        }
        setIsSourcing(false);

        const SYSTEM_PROMPT = curriculum?.isTeaching ? `You are Momentum, a virtual teacher. You are currently teaching the student about "${curriculum.topic}".
The student just replied to your question. Evaluate their understanding.
If they are confused or wrong, gently correct them and explain the concept simpler and slower.
If they are correct, praise them and move on to the next chunk of the lesson!

CRITICAL RULES FOR CHUNKED TEACHING:
1. Explain ONE small, digestible concept. Keep your total response under 4 sentences!
2. You MUST end your response with a question checking if the student understood.
3. You MUST format your entire response as a sequence of tags: [SPEECH] and [NOTE].
4. For spoken narration, you MUST use [SPEECH] text [/SPEECH]. IF YOU DO NOT USE THIS TAG, THERE WILL BE NO VOICE.
5. For concise educational bullet points to appear on the blackboard, use [NOTE] bullet point [/NOTE].
6. DO NOT output ANY conversational text outside of these tags!
7. Be natural and Socratic in your [SPEECH] blocks. Sound like a human teacher!` : `You are Momentum, a witty virtual teacher. 
Respond naturally and conversationally. DO NOT use titles, formatting, or generate quizzes for normal chat.

Available interactive assets in the Universal Education Asset Registry:
${await AssetManager.getRegistryPromptContext()}
${webContext ? `Use this context if helpful: ${webContext}` : ''}

STRICT RULES:
1. NEVER output raw markdown image links.
2. NEVER output raw LaTeX equations like \\[ \\] or $$ in your conversational text.`;

        const finalMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...newMessages
        ];

        try {
            let spokenSentencesCount = 0;
            let parsedFramesCount = 0;
            
            const fullReply = await generateResponse(finalMessages, (chunk) => {
                setCurrentReply(chunk);
                
                if (curriculum?.isTeaching) {
                    // --- Socratic Interactive Teaching Parser ---
                    const frames = [...chunk.matchAll(/\[(SPEECH|NOTE|HIGHLIGHT|QUIZ)\]([\s\S]*?)\[\/\1\]/gi)];
                    
                    while (frames.length > parsedFramesCount) {
                        const frame = frames[parsedFramesCount];
                        parsedFramesCount++;
                        const type = frame[1].toUpperCase();
                        const content = frame[2].trim();
                        
                        if (type === 'SPEECH' || type === 'NOTE') {
                            const rawChunks = content.match(/[^.!?\n]+[.!?\n]+/g) || [content];
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

                    let cleanText = chunk.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').replace(/\[VIDEO:[\s\S]*?\]/gi, '').replace(/\[ASSETS:[\s\S]*?\]/gi, '').replace(/\[CHEMISTRY:[\s\S]*?\]/gi, '').replace(/\[SIMULATION:[\s\S]*?\]/gi, '').replace(/\[CONCEPT:[\s\S]*?\]/gi, '').replace(/\[ANATOMY:[\s\S]*?\]/gi, '').replace(/\[GRAPH:[\s\S]*?\]/gi, '').replace(/\[INTENT:[\s\S]*?\]/gi, '');
                    
                    cleanText = cleanText.replace(/!?\[.*?\]\(.*?\)/g, '');
                    cleanText = cleanText.replace(/\\\[[\s\S]*?\\\]/g, '').replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\\\(.*?\\\)/g, '');
                    
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
                const cleanSpeech = fullReply.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').replace(/\[ASSETS:[\s\S]*?\]/gi, '').trim();
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

    const teachModule = async (topic: string, moduleName: string, idx: number, total: number, triggerPrompt?: string) => {
        setIsGenerating(true);
        setTeachingPhase('lecture');
        setCurrentReply('');
        setCurrentLessonTitle(moduleName.replace(/^[0-9.]+\s*/, '')); // Clean title
        setCurrentLessonContent("Generating visual aids...");
        setCurrentMediaUrl(null);
        setCurrentVideoId(null);
        setCurrentTestContent(null);
        setCurrentHtmlGraphic(null);
        setCurrentModuleInfo(`Module ${idx + 1} of ${total}: ${moduleName}`);
        setIsWaitingForQuiz(false);
        setCurrentLessonNotes([]);
        
        // --- PHASE 1a: Visual Aid Generation ---
        setCurrentLessonContent("Classifying Master Intent...");
        try {
            // Check for direct match first to bypass LLM routing hallucinations
            const directMatchId = await AssetManager.findBestRegistryMatch(topic, moduleName);
            let parsed: any = null;

            if (directMatchId) {
                const entry = await AssetManager.getRegistryEntry(directMatchId);
                parsed = {
                    visualization_type: entry?.renderer || 'concept_diagram',
                    query: directMatchId
                };
            } else {
                const registryContext = await AssetManager.getRegistryPromptContext();
                
                const MASTER_PROMPT = `You are the Master Visualization Router.
Curriculum Topic: "${topic}"
Current Module: "${moduleName}"

Classify the intent into EXACTLY ONE of these types:
- concept_diagram (for established educational topics like photosynthesis, water cycle, human cell, DNA, plate tectonics)
- anatomy (for human anatomy and 3D biological systems like heart, brain, skeleton, digestive system, respiratory system)
- molecule_view (for viewing 3D molecules like Water, Methane, Caffeine)
- equation (for balancing or showing chemical equations like 2H_2 + O_2 \\rightarrow 2H_2O)
- periodic_table (for elements, atomic radius, periodic trends)
- lab_simulation (for physics/math/chemistry labs like titration, ideal gas law, boyles law, circuits, gravity, friction)
- graph (for math, statistics, economics, finance, business analytics like Supply Curve, Normal Distribution, Cartesian coordinates)
- general_image (for history, english, computer science, or anything else that needs a simple image)
- mermaid_diagram (for logic, flowcharts, processes, architecture, or general topics that can be visualized as a flowchart or mindmap)

IMPORTANT RULES:
- If the type is 'equation', you MUST output strictly valid LaTeX formatting (e.g. use subscripts like H_2, and arrows like \\rightarrow).
- If the type is 'concept_diagram', the 'query' MUST be EXACTLY one of the IDs from the AVAILABLE CONCEPTS list below. Do not guess or abbreviate. If the topic is about Plant Cells, output exactly "plant cell". If none match perfectly, USE mermaid_diagram INSTEAD!
AVAILABLE CONCEPTS:
${registryContext}

EXAMPLES:
Topic: "Introduction to Carbon" -> {"visualization_type": "periodic_table", "query": "Carbon"}
Topic: "Boyle's Law" -> {"visualization_type": "lab_simulation", "query": "boyles law"}
Topic: "Photosynthesis" -> {"visualization_type": "concept_diagram", "query": "photosynthesis"}
Topic: "The Water Cycle" -> {"visualization_type": "concept_diagram", "query": "water cycle"}
Topic: "Structure of Water" -> {"visualization_type": "molecule_view", "query": "Water"}
Topic: "Combustion of Methane" -> {"visualization_type": "equation", "query": "CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O"}
Topic: "Human Cells" -> {"visualization_type": "concept_diagram", "query": "human cell"}
Topic: "Supply and Demand" -> {"visualization_type": "graph", "query": "Supply and Demand"}

Output a strictly valid JSON object matching this schema:
{
  "visualization_type": "string",
  "query": "string (extract the specific molecule name, or the reaction equation, or the element name, or the core concept)"
}

DO NOT output conversational text. ONLY output the JSON object.`;

                const routerReply = await generateResponse([
                    { role: 'system', content: 'You are the Master Visualization Router. Output ONLY a valid JSON object. No markdown ticks.' },
                    { role: 'user', content: MASTER_PROMPT }
                ], () => {});
                
                try {
                    // Try to clean up standard markdown wrapper
                    let cleanJson = routerReply.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = safeJsonParse(cleanJson, null);
                } catch(e) {}
            }
            
            try {
                if (parsed.visualization_type === 'concept_diagram' || parsed.visualization_type === 'anatomy') {
                    const queryLower = (parsed.query || topic).toLowerCase();
                    const assetPath = await AssetManager.getAsset(queryLower);
                    
                    if (assetPath) {
                        const lessonData = await AssetManager.getLesson(assetPath);
                        if (lessonData && lessonData.steps && lessonData.steps.length > 0) {
                            // Script the audio queue
                            const newQueue = lessonData.steps.map((s: any) => ({
                                url: '/api/tts?text=' + encodeURIComponent(s.speech),
                                text: s.speech,
                                highlight: s.highlight,
                                note: s.speech
                            }));
                            
                            if (parsed.visualization_type === 'anatomy') {
                                setCurrentHtmlGraphic(`[ANATOMY: ${assetPath}]`);
                            } else {
                                setCurrentHtmlGraphic(`[CONCEPT: ${assetPath}]`);
                            }
                            
                            setAudioQueue(newQueue);
                            
                            // Update brain state
                            setBaseBrainKnowledge([`Topic: ${topic}`, `Module: ${moduleName}`, `Mode: ${parsed.visualization_type === 'anatomy' ? 'Anatomy Engine' : 'Concept Diagram'} Orchestration`]);
                            setCurrentLessonContent(`Playing ${parsed.visualization_type === 'anatomy' ? 'Anatomy' : 'Concept Diagram'} Interactive Lesson...`);
                            setIsGenerating(false);
                            return; // SHORT-CIRCUIT Phase 1b! (No LLM generation needed)
                        }
                    }
                    
                    console.warn(`[AssetManager] Failed to load asset for '${queryLower}'. The asset path '${assetPath}' or its lesson.json is missing on the server.`);
                    
                    // Fallback if not found in registry or missing files: revert to mermaid diagram using the ORIGINAL topic
                    parsed.visualization_type = 'mermaid_diagram';
                    // We don't return here so it falls through to the mermaid_diagram block!
                    // Wait, since we are inside a if-else chain, we need to explicitly run the mermaid code if we change it here.
                    // Instead of duplicating, we will just set the type and let a separate function handle it?
                    // Actually, we can just duplicate the mermaid logic here, or redirect it.
                    setCurrentLessonContent("Generating Concept Diagram...");
                    const mermaidPrompt = `Create a detailed Mermaid flowchart or mindmap explaining the concept of "${topic}".
Output ONLY a valid Mermaid code block enclosed in [MERMAID] ... [/MERMAID].
Do not use markdown backticks around the tag.
Example:
[MERMAID]
graph TD;
A-->B;
[/MERMAID]`;
                    const mermaidReply = await generateResponse([
                        { role: 'system', content: 'Output only the raw tag.' },
                        { role: 'user', content: mermaidPrompt }
                    ], () => {});
                    const match = mermaidReply.match(/\[MERMAID\]\s*([\s\S]*?)\s*\[\/MERMAID\]/i) || mermaidReply.match(/\[MERMAID:\s*([\s\S]*?)\s*\]/i);
                    if (match && match[1]) {
                        setCurrentHtmlGraphic(`[MERMAID: ${match[1]}]`);
                    } else {
                        const cleanTopic = topic.replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                        setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
                    }
                    
                } else if (parsed.visualization_type === 'lab_simulation') {
                    const simKeywords = ['acid', 'base', 'titration', 'ph', 'concentration', 'molarity', 'solution', 'balance', 'equation', 'react', 'gas', 'boyle', 'charles', 'pressure', 'gravity', 'force', 'circuit', 'electricity', 'resistor', 'energy', 'skate', 'friction', 'matter', 'solid', 'liquid', 'atoms', 'properties', 'pendulum', 'oscillation', 'wave', 'interference', 'color', 'vision', 'light', 'fraction', 'math'];
                    const isRealSim = simKeywords.some(kw => (parsed.query || topic).toLowerCase().includes(kw));
                    if (isRealSim) {
                        setCurrentHtmlGraphic(`[SIMULATION: ${parsed.query || topic}]`);
                    } else {
                        const cleanTopic = (parsed.query || topic).replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                        setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
                    }
                } else if (parsed.visualization_type === 'mermaid_diagram') {
                    setCurrentLessonContent("Generating Concept Diagram...");
                    const mermaidPrompt = `Create a detailed Mermaid flowchart or mindmap explaining the concept of "${topic}".
Output ONLY a valid Mermaid code block enclosed in [MERMAID] ... [/MERMAID].
Do not use markdown backticks around the tag.
Example:
[MERMAID]
graph TD;
A-->B;
[/MERMAID]`;
                    const mermaidReply = await generateResponse([
                        { role: 'system', content: 'Output only the raw tag.' },
                        { role: 'user', content: mermaidPrompt }
                    ], () => {});
                    const match = mermaidReply.match(/\[MERMAID\]\s*([\s\S]*?)\s*\[\/MERMAID\]/i) || mermaidReply.match(/\[MERMAID:\s*([\s\S]*?)\s*\]/i);
                    if (match && match[1]) {
                        setCurrentHtmlGraphic(`[MERMAID: ${match[1]}]`);
                    } else {
                        const cleanTopic = topic.replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                        setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
                    }
                } else if (parsed.visualization_type === 'general_image') {
                    const cleanTopic = (parsed.query || topic).replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                    setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
                } else if (parsed.visualization_type === 'molecule_view' || parsed.visualization_type === 'equation' || parsed.visualization_type === 'periodic_table') {
                    // It's a chemistry specific type (molecule_view, equation, periodic_table)
                    setCurrentHtmlGraphic(`[CHEMISTRY: ${cleanJson}]`);
                } else if (parsed.visualization_type === 'graph') {
                    setCurrentLessonContent("Generating Graph Specification...");
                    const graphPrompt = `You are a data visualization expert. Create a detailed graph specification for: "${topic}".
Output ONLY a JSON block containing the full [GRAPH: {...}] tag as described:
[GRAPH: {"title": "...", "graph_type": "...", "library": "plotly", "axes": {"x": "...", "y": "..."}, "curves": [{"name": "...", "type": "line", "points": [[1,2]], "func": "..."}], "explanation": "..."}]

- Use "plotly" for statistics, distributions, 3D.
- Use "echarts" for business, economics, line/bar/pie charts.
- Use "jsxgraph" for pure math/geometry/calculus.
- Set "func" ONLY for JSXGraph (e.g. "Math.pow(x, 2)").
- Set "points" array for ECharts/Plotly data lines.
- CRITICAL: Ensure ALL quotes inside strings are escaped. DO NOT use unescaped newlines in strings.
Output ONLY the raw tag.`;
                    const graphReply = await generateResponse([
                        { role: 'system', content: 'Output only the raw tag.' },
                        { role: 'user', content: graphPrompt }
                    ], () => {});
                    const match = graphReply.match(/\[GRAPH:\s*(\{[\s\S]*\})\s*\]/i);
                    if (match && match[1]) {
                        setCurrentHtmlGraphic(`[GRAPH: ${match[1]}]`);
                    } else {
                        const cleanTopic = topic.replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                        setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
                    }
                }
            } catch(e) {
                // Fallback if AI messes up the JSON
                const cleanTopic = topic.replace(/^(introduction to|the law of|what is|history of|concept of|basics of|principles of|understanding)\s+/i, '').trim();
                setCurrentHtmlGraphic(`[IMAGE: ${cleanTopic}]`);
            }
        } catch (e) {
            console.warn("Visual generation skipped due to error.", e);
        }

        // --- PHASE 1b: Synchronized Presentation Layer ---
        setCurrentLessonContent("Listening to Momentum...");
        const SYSTEM_PROMPT = `You are Momentum, a virtual teacher. You are teaching: "${moduleName}" for the topic "${topic}".
Provide a fascinating, interactive lesson chunk. DO NOT EXPLAIN EVERYTHING AT ONCE!

CRITICAL RULES FOR CHUNKED TEACHING:
1. Explain ONE small, digestible concept. Keep your total response under 4 sentences!
2. You MUST end your response with a question checking if the student understood.
3. You MUST format your entire response as a sequence of tags: [SPEECH] and [NOTE].
4. For spoken narration, you MUST use [SPEECH] text [/SPEECH]. IF YOU DO NOT USE THIS TAG, THERE WILL BE NO VOICE.
5. For concise educational bullet points to appear on the blackboard, use [NOTE] bullet point [/NOTE].
6. DO NOT output ANY conversational text outside of these tags!
7. Be natural and Socratic in your [SPEECH] blocks. Sound like a human teacher!`;

        try {
            let parsedFramesCount = 0;
            const fullReply = await generateResponse([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Start teaching the first chunk of ${moduleName}. Keep it short and ask a question at the end using the required tags.` }
            ], (chunk) => {
                setCurrentReply(chunk);
                
                // DYNAMIC KNOWLEDGE ENGINE (Mid-lecture visual changes)
                const show3dMatch = chunk.match(/\[(?:SHOW_3D|3D):\s*(.+?)\]/i);
                if (show3dMatch && show3dMatch[1]) {
                    setCurrentHtmlGraphic(prev => {
                        if (!prev || prev.includes('image |') || prev.includes('anatomy_3d |')) {
                            return `[INTENT: anatomy_3d | ${show3dMatch[1]}]`;
                        }
                        return prev;
                    });
                }
                const showImageMatch = chunk.match(/\[(?:SHOW_IMAGE|IMAGE):\s*(.+?)\]/i);
                if (showImageMatch && showImageMatch[1]) {
                    setCurrentHtmlGraphic(prev => {
                        if (!prev || prev.includes('image |') || prev.includes('anatomy_3d |')) {
                            return `[INTENT: image | ${showImageMatch[1]}]`;
                        }
                        return prev;
                    });
                }
                
                const cleanText = chunk.replace(/\[(?:SHOW_3D|3D|SHOW_IMAGE|IMAGE):[\s\S]*?\]/gi, '');
                // The Presentation Parser!
                const frames = [...chunk.matchAll(/\[(SPEECH|NOTE|HIGHLIGHT|QUIZ)\]([\s\S]*?)\[\/\1\]/gi)];
                
                while (frames.length > parsedFramesCount) {
                    const frame = frames[parsedFramesCount];
                    parsedFramesCount++;
                    const type = frame[1].toUpperCase();
                    const content = frame[2].trim();
                    
                    if (type === 'SPEECH' || type === 'NOTE') {
                        const rawChunks = content.match(/[^.!?\n]+[.!?\n]+/g) || [content];
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
                    }
                }
            });
            
            setBaseBrainKnowledge([`Topic: ${topic}`, `Module: ${moduleName}`, `Lecture Script: ${fullReply}`]);
            setCurrentReply('');
            setMessages([...messages, { role: 'assistant', content: "(Lecture completed via Presentation Layer)" }]);
        } catch (error) {
            console.warn("Module generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const startCurriculum = async (rawPrompt: string) => {
        setIsWaitingForQuiz(false);
        setCurrentLessonNotes([]);
        setIsGenerating(true);
        setCurrentLessonTitle("Planning Curriculum...");
        setCurrentLessonContent("Brainstorming curriculum...");
        const registryContext = await AssetManager.getRegistryPromptContext();
        const MODULE_PROMPT = `Analyze the student's request: "${rawPrompt}".
Extract the core educational topic they want to learn. Then, generate a 3-module syllabus.
Output ONLY a strict JSON object.
Format exactly like this:
{"topic": "The Core Topic", "modules": ["1. Introduction to [Topic]", "2. Core concepts of [Topic]", "3. Advanced [Topic]"]}

AVAILABLE CONCEPTS:
${registryContext}

CRITICAL: If the student's request is closely related to one of the AVAILABLE CONCEPTS, you MUST set the "topic" field to the EXACT string from the AVAILABLE CONCEPTS list. Do not use a generic topic if a matching concept exists.`;
        
        let extractedTopic = rawPrompt;
        let modules = ["1. Introduction & Basics", "2. Core Concepts", "3. Real-World Applications"];
        try {
            const reply = await generateResponse([
                { role: 'system', content: 'You are an educational curriculum planner.' },
                { role: 'user', content: MODULE_PROMPT }
            ], () => {});
            
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                    const parsed = safeJsonParse(jsonMatch[0], null);
                    if (parsed) {
                        if (parsed.topic) extractedTopic = parsed.topic;
                        if (Array.isArray(parsed.modules) && parsed.modules.length > 0) {
                            modules = parsed.modules.map((item: any) => String(item));
                        }
                    }
            }
        } catch(e) {
            console.warn("Curriculum generation failed (WebGPU Crash or Timeout):", e);
            setCurrentLessonTitle("System Error");
            setCurrentLessonContent("Failed to generate curriculum. The AI engine may have crashed due to memory limits. Please reload the page.");
            setIsGenerating(false);
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
            const cleanText = text.replace(/\[DRAW:[\s\S]*?\]/gi, '').replace(/\[IMAGE:[\s\S]*?\]/gi, '').replace(/\[VIDEO:[\s\S]*?\]/gi, '').replace(/\[ASSETS:[\s\S]*?\]/gi, '').replace(/\[CHEMISTRY:[\s\S]*?\]/gi, '').replace(/\[SIMULATION:[\s\S]*?\]/gi, '').replace(/\[CONCEPT:[\s\S]*?\]/gi, '').replace(/\[ANATOMY:[\s\S]*?\]/gi, '').replace(/\[GRAPH:[\s\S]*?\]/gi, '').replace(/\[INTENT:[\s\S]*?\]/gi, '').trim();
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
                                onQuizAnswered={() => setIsWaitingForQuiz(false)}
                            />
                    </div>

                    {/* Agent Face Floating Over Blackboard or Fullscreen */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col items-center gap-4 ${
                        (currentLessonTitle || currentHtmlGraphic)
                            ? 'top-1/2 -translate-y-1/2 w-full h-full scale-100 lg:-top-8 lg:-translate-y-0 lg:w-auto lg:h-auto lg:scale-[0.50]'
                            : 'top-1/2 -translate-y-1/2 w-full h-full scale-100 opacity-100'
                    }`}>
                        <AgentFace 
                            state={isGenerating ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} 
                            className={`shadow-[0_0_80px_rgba(139,92,246,0.5)] transition-all duration-1000 rounded-none border-0 w-full h-full ${
                                (currentLessonTitle || currentHtmlGraphic) ? 'lg:rounded-[3rem] lg:border-4 lg:border-white/10 lg:w-[280px] lg:h-[280px]' : ''
                            }`}
                        />

                        {/* Status Indicator Below Face */}
                        {(isSourcing || (!isLoaded && isLoading) || isGenerating || (!isLoaded && progressText.includes('Error'))) && (
                            <div className={`flex items-center gap-3 text-lg lg:text-2xl font-bold bg-[#111]/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 ${progressText.includes('Error') ? 'text-red-400' : 'text-purple-300'}`}>
                                {(!progressText.includes('Error') || isLoading) && <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />}
                                {isSourcing ? "Sourcing live data..." : !isLoaded ? (progressText || 'Booting AI Engine...') : "Generating..."}
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
                                onError={(e) => {
                                    console.warn('TTS Audio failed to play:', e);
                                    setIsSpeaking(false);
                                    setAudioUrlToSpeak(null);
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
                                placeholder={isGenerating ? "Generating..." : "Type your message or ask a question..."}
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
