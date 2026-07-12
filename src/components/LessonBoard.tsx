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
}

type TabType = 'media' | 'notes' | 'test';

export default function LessonBoard({ title, content, mediaUrl, videoId, testContent, moduleInfo, htmlGraphic, highlightId, isSpeaking, isGenerating, onNextModule, generateResponse, notes, onQuizAnswered, onToolEvent, toolAction }: LessonBoardProps) {
    const [step, setStep] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('notes');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
    const [lastAutoSwitchedQuiz, setLastAutoSwitchedQuiz] = useState<string | null>(null);
    const iframeEngineRef = useRef<any>(null);

    useEffect(() => {
        if (toolAction && iframeEngineRef.current && typeof iframeEngineRef.current.sendAction === 'function') {
            iframeEngineRef.current.sendAction(toolAction);
        }
    }, [toolAction]);

    useEffect(() => {
        if (testContent && !isSpeaking && testContent !== lastAutoSwitchedQuiz) {
            setSelectedQuizOption(null);
            setActiveTab('test');
            setLastAutoSwitchedQuiz(testContent);
        }
    }, [testContent, isSpeaking, lastAutoSwitchedQuiz]);

    useEffect(() => {
        if (title) {
            setStep(0);
            setActiveTab(videoId || htmlGraphic || mediaUrl ? 'media' : 'notes'); 
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
                    <div className={`flex flex-col lg:flex-row justify-between items-center lg:items-end relative z-10 gap-6 px-4 lg:px-12 pt-6 lg:pt-10 transition-all duration-1000 ${htmlGraphic ? 'mb-2 opacity-30 scale-95 lg:scale-90 hover:opacity-100 hover:scale-100' : 'mb-8 opacity-100'}`}>
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
                                    ) : htmlGraphic ? (
                                        <div className="w-full h-full flex items-center justify-center relative p-4 lg:p-8">
                                            {(() => {
                                                try {
                                                    // Handle GRAPH
                                                    const graphMatch = htmlGraphic.match(/\[GRAPH:\s*(\{[\s\S]*\})\s*\]/i);
                                                    if (graphMatch && graphMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <GraphEngine spec={graphMatch[1].trim()} autoAdvance={true} />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle MERMAID
                                                    const mermaidMatch = htmlGraphic.match(/\[MERMAID:\s*([\s\S]*?)\s*\]/i);
                                                    if (mermaidMatch && mermaidMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <MermaidEngine code={mermaidMatch[1].trim()} />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle dynamic SVGs or MathML drawn by the AI!
                                                    const trimmedGraphic = htmlGraphic.trim().toLowerCase();
                                                    if (trimmedGraphic.startsWith('<svg') || trimmedGraphic.startsWith('<math')) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <div 
                                                                    className="w-full h-full flex items-center justify-center p-8 [&>svg]:w-full [&>svg]:max-h-full [&>svg]:max-w-[800px] [&>svg]:drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-1000" 
                                                                    dangerouslySetInnerHTML={{ __html: htmlGraphic }} 
                                                                />
                                                            </ErrorBoundary>
                                                        );
                                                    }
                                                    
                                                    // Handle CONCEPT DIAGRAM
                                                    const conceptMatch = htmlGraphic.match(/\[CONCEPT:\s*([\s\S]*?)\s*\]/i);
                                                    if (conceptMatch && conceptMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <ConceptDiagramEngine path={conceptMatch[1].trim()} highlightId={highlightId || null} />
                                                            </ErrorBoundary>
                                                        );
                                                    }
                                                    
                                                    // Handle SIMULATION
                                                    const simMatch = htmlGraphic.match(/\[SIMULATION:\s*([\s\S]*?)\s*\]/i);
                                                    if (simMatch && simMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <SimulationEngine query={simMatch[1].trim()} />
                                                            </ErrorBoundary>
                                                        );
                                                    }
                                                    
                                                    const anatomyMatch = htmlGraphic.match(/\[ANATOMY:\s*([\s\S]*?)\s*\]/i);
                                                    if (anatomyMatch) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <AnatomyEngine path={anatomyMatch[1]} highlightId={highlightId || null} />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle CHEMISTRY
                                                    const chemMatch = htmlGraphic.match(/\[CHEMISTRY:\s*([\s\S]*?)\s*\]/i);
                                                    if (chemMatch && chemMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <ChemistryRouter spec={chemMatch[1].trim()} />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle IMAGE
                                                    const imgMatch = htmlGraphic.match(/\[IMAGE:\s*([\s\S]*?)\s*\]/i);
                                                    if (imgMatch && imgMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <AssetViewer query={imgMatch[1].trim()} mode="image" />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle INTENT
                                                    const intentMatch = htmlGraphic.match(/\[INTENT:\s*([\s\S]*?)\s*\]/i);
                                                    if (intentMatch && intentMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <EngineOrchestrator intent={intentMatch[1].trim()} generateResponse={generateResponse} isGenerating={isGenerating} />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    // Handle IFRAME (Tools DB)
                                                    const iframeMatch = htmlGraphic.match(/\[IFRAME:\s*([\s\S]*?)\s*\]/i);
                                                    if (iframeMatch && iframeMatch[1]) {
                                                        return (
                                                            <ErrorBoundary>
                                                                <IframeEngine 
                                                                    ref={iframeEngineRef}
                                                                    url={iframeMatch[1].trim()} 
                                                                    onToolEvent={onToolEvent}
                                                                />
                                                            </ErrorBoundary>
                                                        );
                                                    }

                                                    const concepts = safeJsonParse(htmlGraphic, null) as any[] | null;
                                                    if (Array.isArray(concepts)) {
                                                        return (
                                                            <div className="grid grid-cols-2 gap-12 w-full max-w-5xl h-full py-8">
                                                                {concepts.map((concept: any, i: number) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                                                                        className="bg-[#111]/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] group hover:bg-[#222]/90 hover:scale-105 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all duration-300 relative overflow-hidden"
                                                                    >
                                                                        {/* Decorative Glow */}
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
                                                } catch(e) {}
                                                return <AssetViewer query={htmlGraphic} mode="image" />; // Fallback
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
                                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4 text-4xl font-bold" style={{ textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>
                                            <p>[ Sketchpad Empty ]</p>
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
                                    {bulletPoints.map((point, index) => (
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
                                    {bulletPoints.length === 0 && (
                                        <div className="text-center text-white/40 text-4xl animate-pulse mt-16 font-bold" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>Writing notes...</div>
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
                                        let quizObj: any = null;
                                        if (testContent) {
                                            quizObj = safeJsonParse(testContent, null);
                                        }
                                        if (quizObj && quizObj.options) {
                                            return (
                                                <div className="h-full flex flex-col">
                                                    <h3 className="text-3xl font-bold text-white/80 border-b border-white/30 pb-2 mb-6 drop-shadow-md">Pop Quiz!</h3>
                                                    <p className="text-3xl mb-8 leading-relaxed drop-shadow-md">{quizObj.question}</p>
                                                    <div className="flex flex-col gap-4">
                                                        {quizObj.options.map((opt: string) => (
                                                            <button 
                                                                key={opt}
                                                                onClick={() => {
                                                                    setSelectedQuizOption(opt);
                                                                    if (onQuizAnswered) onQuizAnswered();
                                                                }}
                                                                className={`p-5 text-left text-2xl rounded-2xl border transition-all ${selectedQuizOption === opt ? (opt === quizObj.answer ? 'bg-green-500/50 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'bg-red-500/50 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]') : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {selectedQuizOption && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`mt-8 p-6 rounded-2xl text-2xl drop-shadow-md ${selectedQuizOption === quizObj.answer ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}
                                                        >
                                                            <p className="font-bold mb-2">{selectedQuizOption === quizObj.answer ? 'Correct!' : 'Incorrect.'}</p>
                                                            <p className="leading-relaxed">{quizObj.explanation}</p>
                                                            
                                                            {selectedQuizOption === quizObj.answer && onNextModule && (
                                                                <button 
                                                                    onClick={onNextModule}
                                                                    className="mt-6 w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all"
                                                                >
                                                                    Next Module ➔
                                                                </button>
                                                            )}
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
                                        <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-3xl animate-pulse">
                                            <p>Preparing quiz...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Chalk Dust Footer */}
                    <div className="absolute bottom-1 right-3 opacity-30 text-xl">
                        AI Teacher Module
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </TeachingInteractionProvider>
    );
}
