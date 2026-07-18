import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Caveat } from 'next/font/google';
import AssetViewer from './AssetViewer';
import SimulationEngine from './SimulationEngine';
import ChemistryRouter from './ChemistryRouter';
import ConceptDiagramEngine from './ConceptDiagramEngine';
import MermaidEngine from './engines/MermaidEngine';
import AnatomyEngine from './AnatomyEngine';
import GraphEngine from './GraphEngine';
import EngineOrchestrator from './orchestration/EngineOrchestrator';
import { TeachingInteractionProvider } from './orchestration/TeachingInteractionLayer';
import { IframeEngine } from './IframeEngine';
import ErrorBoundary from './ErrorBoundary';
import { safeJsonParse } from '@/lib/jsonHelper';
import VisualizationCanvas from './VisualizationCanvas';
import { VisualizationPayload } from '@/lib/visualization/CapabilityRegistry';

const chalkFont = Caveat({ subsets: ['latin'], weight: ['400', '700'] });

interface LessonBoardProps {
    title: string | null;
    content: string | null;
    mediaUrl?: string | null;
    videoId?: string | null;
    testContent?: string | null;
    moduleInfo?: string | null;
    htmlGraphic?: string | null;
    highlightId?: string | null;
    isSpeaking: boolean;
    isGenerating?: boolean;
    onNextModule?: () => void;
    generateResponse?: any; // To avoid bringing in complex MLCEngine types
    notes?: string[];
    onQuizAnswered?: () => void;
    onToolEvent?: (eventData: any) => void;
    toolAction?: any;
    prepState?: any; // LessonPreparationState
}

type TabType = 'media' | 'notes' | 'test';

export default function LessonBoard({ title, content, mediaUrl, videoId, testContent, moduleInfo, htmlGraphic, highlightId, isSpeaking, isGenerating, onNextModule, generateResponse, notes, onQuizAnswered, onToolEvent, toolAction }: LessonBoardProps) {
    const [step, setStep] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('notes');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
    const [lastAutoSwitchedQuiz, setLastAutoSwitchedQuiz] = useState<string | null>(null);
    
    // Quiz State Machine
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [quizStatus, setQuizStatus] = useState<'answering' | 'reviewed' | 'finished'>('answering');

    const iframeEngineRef = useRef<any>(null);

    // --- NEW PASSIVE EVENT BUS INTEGRATION ---
    const [passiveGraphic, setPassiveGraphic] = useState<string | null>(htmlGraphic || null);
    const [passiveHighlight, setPassiveHighlight] = useState<string | null>(highlightId || null);
    const [activeNotes, setActiveNotes] = useState<any[]>([]);

    useEffect(() => {
        if (toolAction) {
            if (toolAction === '__SHOW_NOTES__') {
                setActiveTab('notes');
            } else if (toolAction === '__SHOW_MEDIA__' || (toolAction !== 'none' && toolAction !== '__SHOW_NOTES__')) {
                if (htmlGraphic || mediaUrl || videoId || passiveGraphic) {
                    setActiveTab('media');
                }
            }
            if (iframeEngineRef.current && typeof iframeEngineRef.current.sendAction === 'function') {
                iframeEngineRef.current.sendAction(toolAction);
            }
        }
    }, [toolAction, htmlGraphic, mediaUrl, videoId, passiveGraphic]);

    useEffect(() => {
        if (testContent && !isSpeaking && testContent !== lastAutoSwitchedQuiz) {
            setSelectedQuizOption(null);
            setActiveTab('test');
            setLastAutoSwitchedQuiz(testContent);
            setCurrentQuizIndex(0);
            setScore(0);
            setTimeLeft(15);
            setQuizStatus('answering');
        }
    }, [testContent, isSpeaking, lastAutoSwitchedQuiz]);



    useEffect(() => {
        // We still sync the prop for legacy backwards compatibility during migration
        setPassiveGraphic(htmlGraphic || null);
    }, [htmlGraphic]);

    useEffect(() => {
        setPassiveHighlight(highlightId || null);
    }, [highlightId]);

    useEffect(() => {
        const handleVisReady = (payload: any) => {
            if (payload.message) {
                setPassiveGraphic(payload.message);
                setActiveTab('media');
            }
        };
        const handleHighlight = (payload: any) => {
            if (payload.message) {
                setPassiveHighlight(payload.message);
            } else {
                setPassiveHighlight(null);
            }
        };

        const handleNotesReady = () => setActiveNotes([]);
        const handleNotesDisplayed = (payload: any) => {
            if (payload.message) {
                try {
                    const section = JSON.parse(payload.message);
                    setActiveNotes(prev => {
                        if (!prev.find(n => n.id === section.id)) {
                            return [...prev, section];
                        }
                        return prev;
                    });
                } catch (e) {
                    console.error("Failed to parse notes section", e);
                }
            }
        };

        import('@/lib/execution/EventBus').then(({ EventBus }) => {
            EventBus.subscribe('VisualizationReady', handleVisReady);
            EventBus.subscribe('VisualizationHighlightStarted', handleHighlight);
            EventBus.subscribe('VisualizationHighlightEnded', handleHighlight);
            EventBus.subscribe('NotesReady', handleNotesReady);
            EventBus.subscribe('NotesDisplayed', handleNotesDisplayed);
        });

        return () => {
            import('@/lib/execution/EventBus').then(({ EventBus }) => {
                EventBus.unsubscribe('VisualizationReady', handleVisReady);
                EventBus.unsubscribe('VisualizationHighlightStarted', handleHighlight);
                EventBus.unsubscribe('VisualizationHighlightEnded', handleHighlight);
                EventBus.unsubscribe('NotesReady', handleNotesReady);
                EventBus.unsubscribe('NotesDisplayed', handleNotesDisplayed);
            });
        };
    }, []);
    // ------------------------------------------

    // Timer logic
    useEffect(() => {
        if (activeTab === 'test' && quizStatus === 'answering') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                handleQuizAnswer(null);
            }
        }
    }, [activeTab, quizStatus, timeLeft]);

    const handleQuizAnswer = (opt: string | null) => {
        setSelectedQuizOption(opt);
        setQuizStatus('reviewed');
        
        let quizzes: any = safeJsonParse(testContent!, null);
        if (quizzes && !Array.isArray(quizzes) && quizzes.question) quizzes = [quizzes];
        if (!quizzes || !quizzes.length) return;

        const currentQuiz = quizzes[currentQuizIndex];
        
        if (opt === currentQuiz.answer) {
            setScore(prev => prev + 1);
        }

        if (onQuizAnswered && opt !== null) onQuizAnswered();

        setTimeout(() => {
            if (currentQuizIndex + 1 < quizzes.length) {
                setCurrentQuizIndex(prev => prev + 1);
                setSelectedQuizOption(null);
                setTimeLeft(15);
                setQuizStatus('answering');
            } else {
                setQuizStatus('finished');
            }
        }, 3000);
    };

    useEffect(() => {
        if (title) {
            setStep(0);
            setActiveTab('notes'); 
            const timer1 = setTimeout(() => setStep(1), 1000);
            const timer2 = setTimeout(() => setStep(2), 2500);
            const timer3 = setTimeout(() => setStep(3), 4000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [title, content, videoId, mediaUrl]);

    // Handle Dynamic YouTube Audio Muting based on AI Speaking
    useEffect(() => {
        const iframe = document.getElementById('yt-player') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: isSpeaking ? 'mute' : 'unMute',
                args: []
            }), '*');
        }
    }, [isSpeaking]);

    const bulletPoints = notes && notes.length > 0 
        ? notes 
        : content 
            ? content.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^-\s*/, '').trim())
            : [];

    return (
        <TeachingInteractionProvider>
            <AnimatePresence>
                {(title || htmlGraphic || mediaUrl || videoId) && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    // Glassmorphism Blackboard
                    className={`w-full h-full bg-black/40 backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] flex flex-col pointer-events-auto relative overflow-hidden ${chalkFont.className}`}
                    style={{ 
                        transformPerspective: 1200,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
                    }}
                >
                    {/* Header & Tabs drawn in glowing chalk */}
                    <div className={`flex flex-col lg:flex-row justify-between items-center lg:items-end relative z-10 gap-6 px-4 lg:px-12 pt-6 lg:pt-10 transition-all duration-1000 ${passiveGraphic ? 'mb-2 opacity-30 scale-95 lg:scale-90 hover:opacity-100 hover:scale-100' : 'mb-8 opacity-100'}`}>
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1 relative w-full lg:w-auto">
                            {moduleInfo && (
                                <span className="text-sm lg:text-base font-bold text-white/90 uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{moduleInfo}</span>
                            )}
                            <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-wide line-clamp-2" style={{ textShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)' }}>
                                {title || "Interactive Visualization"}
                            </h2>
                            <div className="w-48 lg:w-96 h-[2px] bg-white/30 rounded-full mt-2"></div>
                        </div>

                        {/* Chalk Tabs */}
                        <div className="flex shrink-0 justify-center lg:justify-end gap-4 lg:gap-8 px-2 lg:px-0">
                            <button onClick={() => setActiveTab('media')} className={`py-2 px-3 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'media' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'media' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
                                Diagram
                            </button>
                            <button onClick={() => setActiveTab('notes')} className={`py-2 px-3 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'notes' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'notes' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
                                Notes
                            </button>
                            <button onClick={() => setActiveTab('test')} className={`py-2 px-3 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'test' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'test' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
                                Pop Quiz
                            </button>
                        </div>
                    </div>

                    {/* Chalk Content Area */}
                    <div className="flex-1 relative flex flex-col text-white/90 px-4">
                        <AnimatePresence mode="wait">
                            {/* MEDIA TAB (AI CHALK DRAWING) */}
                            {activeTab === 'media' && (
                                <motion.div 
                                    key="media"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center p-2"
                                >
                                    {videoId ? (
                                        <div className="w-full h-full border-4 border-white/40 rounded-xl overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-white/60"></div>
                                            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-white/60"></div>
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`} 
                                                title="YouTube video player" 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : passiveGraphic ? (
                                        <div className="w-full h-full flex items-center justify-center relative p-4 lg:p-8">
                                            {(() => {
                                                try {
                                                    const payloadObj = safeJsonParse(passiveGraphic, null) as VisualizationPayload | any[] | null;
                                                    
                                                    // Handle the new Generic Visualization Payload
                                                    if (payloadObj && !Array.isArray(payloadObj) && 'type' in payloadObj && 'capability' in payloadObj) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <VisualizationCanvas 
                                                                    payload={payloadObj as VisualizationPayload} 
                                                                    highlightId={passiveHighlight || null} 
                                                                />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle old concept grid (optional legacy support, but safe to keep as it checks Array.isArray)
                                                    if (Array.isArray(payloadObj)) {
                                                        return (
                                                            <div className="grid grid-cols-2 gap-12 w-full max-w-5xl h-full py-8">
                                                                {payloadObj.map((concept: any, i: number) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                                                                        className="bg-[#111]/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] group hover:bg-[#222]/90 hover:scale-105 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all duration-300 relative overflow-hidden"
                                                                    >
                                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                                        <div className="text-purple-400 font-mono text-sm tracking-widest mb-4 opacity-50 uppercase relative z-10">Concept 0{i + 1}</div>
                                                                        <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 relative z-10" style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
                                                                            {concept}
                                                                        </span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                } catch(e) {
                                                    console.warn("Failed to render visualization payload.", e);
                                                }
                                                
                                                // Graceful Fallback Placeholder - No raw payloads, no technical jargon
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }} 
                                                        animate={{ opacity: 1 }}
                                                        className="flex flex-col items-center justify-center text-center opacity-80 max-w-2xl"
                                                    >
                                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                                            <svg className="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-4xl font-bold text-white mb-6" style={{ textShadow: '0 0 15px rgba(255,255,255,0.4)' }}>{title}</h3>
                                                        <p className="text-2xl text-white/60 leading-relaxed max-w-xl">
                                                            Interactive visual content is unavailable for this topic. The lesson will continue focusing on the core concepts while we talk through it!
                                                        </p>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>
                                    ) : mediaUrl ? (
                                        <div className="w-full h-full relative flex flex-col items-center justify-center">
                                            <span className="text-2xl text-white/60 mb-3 font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>- Chalk Sketch -</span>
                                            {/* CSS Magic to turn regular images into chalk drawings! */}
                                            <img 
                                                src={mediaUrl} 
                                                alt={title || undefined} 
                                                className="max-w-full max-h-[85%] object-contain mix-blend-screen" 
                                                style={{ filter: "grayscale(100%) invert(100%) contrast(1.5) opacity(0.9) drop-shadow(0 0 8px rgba(255,255,255,0.5))" }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-80 transition-opacity duration-1000">
                                            {/* Educational Placeholder */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="flex flex-col items-center text-center"
                                            >
                                                <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10">
                                                    <svg className="w-10 h-10 text-white/50 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-4xl font-bold text-white/90 mb-4 tracking-wide" style={{ textShadow: '0 0 15px rgba(255,255,255,0.4)' }}>{title}</h3>
                                                <p className="text-white/60 text-2xl max-w-xl leading-relaxed">Understanding the fundamental concepts and exploring how they work together.</p>
                                            </motion.div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* NOTES TAB */}
                            {activeTab === 'notes' && (
                                <motion.div 
                                    key="notes"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col p-4 lg:p-8 gap-8 overflow-y-auto max-w-5xl mx-auto"
                                >
                                    {activeNotes.map((section, idx) => (
                                        <motion.div
                                            key={section.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-[#111]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                                        >
                                            <h3 className="text-2xl font-bold text-white mb-4" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{section.title}</h3>
                                            
                                            {section.summary && (
                                                <p className="text-lg text-white/70 italic mb-6 border-l-4 border-purple-500 pl-4 py-1">{section.summary}</p>
                                            )}
                                            
                                            <div className="space-y-4">
                                                {section.bulletPoints?.map((point: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 text-xl">
                                                        <span className="text-purple-400 mt-1">•</span>
                                                        <span className="text-white/90">{point}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {section.keyFormulae?.length > 0 && (
                                                <div className="mt-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                                    <div className="text-sm text-purple-300 font-bold uppercase tracking-wider mb-2">Key Formulae</div>
                                                    {section.keyFormulae.map((f: string, i: number) => (
                                                        <div key={i} className="text-2xl font-mono text-emerald-400 font-bold">{f}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {/* Legacy fallback if activeNotes is empty but bulletPoints exists */}
                                    {activeNotes.length === 0 && bulletPoints.length > 0 && bulletPoints.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                            className="flex items-start gap-5 text-3xl"
                                        >
                                            <span className="text-white/80 mt-1" style={{ textShadow: '0 0 15px rgba(255,255,255,0.8)' }}>*</span>
                                            <p className="leading-relaxed text-white/95" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>{point}</p>
                                        </motion.div>
                                    ))}
                                    
                                    {activeNotes.length === 0 && bulletPoints.length === 0 && (
                                        <div className="w-full flex flex-col gap-8 mt-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-5">
                                                    <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse mt-3 shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="h-6 bg-white/10 rounded-md w-full animate-pulse shadow-inner"></div>
                                                        <div className="h-6 bg-white/10 rounded-md w-5/6 animate-pulse shadow-inner" style={{ animationDelay: '100ms' }}></div>
                                                        <div className="h-6 bg-white/10 rounded-md w-4/6 animate-pulse shadow-inner" style={{ animationDelay: '200ms' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-white/40 text-2xl text-center font-bold mt-12 opacity-50 drop-shadow-md">Waiting for timeline notes...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* TEST TAB */}
                            {activeTab === 'test' && (
                                <motion.div 
                                    key="test"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col p-2 overflow-y-auto"
                                >
                                    {testContent ? (() => {
                                        let quizzes: any[] = [];
                                        if (testContent) {
                                            const parsed: any = safeJsonParse(testContent, null);
                                            if (Array.isArray(parsed)) quizzes = parsed;
                                            else if (parsed && parsed.question) quizzes = [parsed];
                                        }
                                        
                                        if (quizzes && quizzes.length > 0) {
                                            if (quizStatus === 'finished') {
                                                return (
                                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                                        <h3 className="text-4xl font-bold text-white mb-6">Quiz Completed!</h3>
                                                        <div className={`text-6xl font-bold mb-4 ${score > (quizzes.length / 2) ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {score} / {quizzes.length}
                                                        </div>
                                                        <p className="text-xl text-white/60 mb-12">
                                                            {score === quizzes.length ? 'Perfect score! Excellent work.' : score > (quizzes.length / 2) ? 'Good job! Keep learning.' : 'Review the notes and try again!'}
                                                        </p>
                                                        {onNextModule && (
                                                            <button 
                                                                onClick={onNextModule}
                                                                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all"
                                                            >
                                                                Continue to Next Module ➔
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            const currentQuiz = quizzes[currentQuizIndex];
                                            
                                            return (
                                                <div className="h-full flex flex-col relative">
                                                    <div className="flex justify-between items-end border-b border-white/30 pb-2 mb-6">
                                                        <h3 className="text-3xl font-bold text-white/80 drop-shadow-md">Pop Quiz! <span className="text-xl font-normal ml-4 opacity-60">Question {currentQuizIndex + 1} of {quizzes.length}</span></h3>
                                                        <div className={`text-3xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white/80'}`}>
                                                            00:{timeLeft.toString().padStart(2, '0')}
                                                        </div>
                                                    </div>

                                                    <p className="text-3xl mb-8 leading-relaxed drop-shadow-md">{currentQuiz.question}</p>
                                                    <div className="flex flex-col gap-4">
                                                        {currentQuiz.options.map((opt: string) => {
                                                            let buttonClass = 'bg-white/10 border-white/20 hover:bg-white/20';
                                                            
                                                            if (quizStatus === 'reviewed') {
                                                                if (opt === currentQuiz.answer) {
                                                                    buttonClass = 'bg-green-500/50 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]';
                                                                } else if (opt === selectedQuizOption) {
                                                                    buttonClass = 'bg-red-500/50 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]';
                                                                } else {
                                                                    buttonClass = 'bg-white/5 border-white/10 opacity-50';
                                                                }
                                                            } else if (selectedQuizOption === opt) {
                                                                buttonClass = 'bg-blue-500/50 border-blue-400';
                                                            }

                                                            return (
                                                                <button 
                                                                    key={opt}
                                                                    onClick={() => {
                                                                        if (quizStatus === 'answering') handleQuizAnswer(opt);
                                                                    }}
                                                                    disabled={quizStatus !== 'answering'}
                                                                    className={`p-5 text-left text-2xl rounded-2xl border transition-all ${buttonClass} ${quizStatus !== 'answering' ? 'cursor-default' : 'cursor-pointer'}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {quizStatus === 'reviewed' && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`mt-8 p-6 rounded-2xl text-2xl drop-shadow-md ${selectedQuizOption === currentQuiz.answer ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}
                                                        >
                                                            <p className="font-bold mb-2">{selectedQuizOption === currentQuiz.answer ? 'Correct!' : (selectedQuizOption === null ? 'Time is up!' : 'Incorrect.')}</p>
                                                            <p className="leading-relaxed">{currentQuiz.explanation}</p>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="h-full flex flex-col">
                                                <h3 className="text-3xl font-bold text-white/80 border-b border-white/30 pb-2 mb-4 drop-shadow-md">Pop Quiz!</h3>
                                                <div className="text-2xl leading-relaxed space-y-4 drop-shadow-md" dangerouslySetInnerHTML={{ __html: testContent.replace(/\n/g, '<br/>') }} />
                                            </div>
                                        );
                                    })() : (
                                        <div className="h-full flex flex-col pt-4">
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-48 h-10 bg-white/10 rounded-lg mb-8 animate-pulse shadow-inner"></div>
                                                    <div className="w-full h-24 bg-white/10 rounded-xl mb-12 animate-pulse shadow-inner"></div>
                                                    <div className="flex flex-col gap-4">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl animate-pulse shadow-inner" style={{ animationDelay: `${i * 100}ms` }}></div>
                                                        ))}
                                                    </div>
                                                    <p className="text-white/40 text-2xl text-center font-bold mt-12 opacity-50 drop-shadow-md">Preparing reflection...</p>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full opacity-50">
                                                    <p className="text-2xl text-white/60 mb-8">No quiz was generated for this module.</p>
                                                    {onNextModule && (
                                                        <button 
                                                            onClick={onNextModule}
                                                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                                                        >
                                                            Continue to Next Module ➔
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    {/* Chalk Dust Footer */}
                    <div className="absolute bottom-4 right-6 opacity-30 text-2xl font-bold font-mono">
                        AI Teacher Module
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </TeachingInteractionProvider>
    );
}
