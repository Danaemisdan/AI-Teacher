import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Caveat } from 'next/font/google';
import AssetViewer from './AssetViewer';
import SimulationEngine from './SimulationEngine';
import ChemistryRouter from './ChemistryRouter';
import ConceptDiagramEngine from './ConceptDiagramEngine';
import AnatomyEngine from './AnatomyEngine';
import GraphEngine from './GraphEngine';
import EngineOrchestrator from './orchestration/EngineOrchestrator';
import { TeachingInteractionProvider } from './orchestration/TeachingInteractionLayer';
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
}

type TabType = 'media' | 'notes' | 'test';

export default function LessonBoard({ title, content, mediaUrl, videoId, testContent, moduleInfo, htmlGraphic, highlightId, isSpeaking, isGenerating, onNextModule, generateResponse }: LessonBoardProps) {
    const [step, setStep] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('notes');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
    const [lastAutoSwitchedQuiz, setLastAutoSwitchedQuiz] = useState<string | null>(null);

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

    const bulletPoints = content 
        ? content.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^-\s*/, '').trim())
        : [];

    return (
        <TeachingInteractionProvider>
            <AnimatePresence>
                {title && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    // Glassmorphism Blackboard
                    className={`w-full h-full bg-black/20 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3rem] border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(255,255,255,0.1)] p-6 lg:p-10 flex flex-col pointer-events-auto relative overflow-hidden ${chalkFont.className}`}
                    style={{ 
                        transformPerspective: 1200,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
                    }}
                >
                    {/* Header & Tabs drawn in glowing chalk */}
                    <div className={`flex flex-col relative z-10 gap-6 transition-all duration-1000 ${htmlGraphic ? 'mb-2 opacity-30 scale-90 -translate-y-4 hover:opacity-100 hover:scale-100 hover:translate-y-0' : 'mb-8 opacity-100'}`}>
                        <div className="flex flex-col gap-2 border-b-2 border-white/40 pb-3">
                            {moduleInfo && (
                                <span className="text-sm lg:text-base font-bold text-white/90 uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{moduleInfo}</span>
                            )}
                            <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-wide line-clamp-2 text-ellipsis overflow-hidden" style={{ textShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)' }}>{title}</h2>
                        </div>

                        {/* Chalk Tabs */}
                        <div className="flex w-full justify-between gap-2 lg:gap-6 px-2 lg:px-4">
                            <button onClick={() => setActiveTab('media')} className={`flex-1 py-2 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'media' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'media' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
                                Diagram
                            </button>
                            <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'notes' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'notes' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
                                Notes
                            </button>
                            <button onClick={() => setActiveTab('test')} className={`flex-1 py-2 text-xl lg:text-3xl font-bold transition-all ${activeTab === 'test' ? 'text-white border-b-4 border-white' : 'text-white/60 hover:text-white/90 hover:border-b-4 hover:border-white/50'}`} style={activeTab === 'test' ? { textShadow: '0 0 15px rgba(255,255,255,0.8)' } : {}}>
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
                                        <div className="w-full h-full p-6 flex items-center justify-center relative">
                                            {(() => {
                                                try {
                                                    // Handle dynamic SVGs or MathML drawn by the AI!
                                                    const trimmedGraphic = htmlGraphic.trim().toLowerCase();
                                                    if (trimmedGraphic.startsWith('<svg') || trimmedGraphic.startsWith('<math')) {
                                                        return (
                                                            <div 
                                                                className="w-full h-full flex items-center justify-center p-8 [&>svg]:w-full [&>svg]:max-h-full [&>svg]:max-w-[800px] [&>svg]:drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-1000" 
                                                                dangerouslySetInnerHTML={{ __html: htmlGraphic }} 
                                                            />
                                                        );
                                                    }
                                                    
                                                    // Handle CONCEPT DIAGRAM
                                                    const conceptMatch = htmlGraphic.match(/\[CONCEPT:\s*([^\]]+)\]/i);
                                                    if (conceptMatch && conceptMatch[1]) {
                                                        return <ConceptDiagramEngine path={conceptMatch[1].trim()} highlightId={highlightId || null} />;
                                                    }
                                                    
                                                    // Handle SIMULATION
                                                    const simMatch = htmlGraphic.match(/\[SIMULATION:\s*([^\]]+)\]/i);
                                                    if (simMatch && simMatch[1]) {
                                                        return <SimulationEngine query={simMatch[1].trim()} />;
                                                    }
                                                    
                                                    const anatomyMatch = htmlGraphic.match(/\[ANATOMY:\s*([^\]]+)\]/i);
                                                    if (anatomyMatch) {
                                                        return <AnatomyEngine path={anatomyMatch[1]} highlightId={highlightId} />;
                                                    }

                                                    // Handle CHEMISTRY
                                                    const chemMatch = htmlGraphic.match(/\[CHEMISTRY:\s*([\s\S]+)\]/i);
                                                    if (chemMatch && chemMatch[1]) {
                                                        return <ChemistryRouter spec={chemMatch[1].trim()} />;
                                                    }

                                                    // Handle IMAGE
                                                    const imgMatch = htmlGraphic.match(/\[IMAGE:\s*([^\]]+)\]/i);
                                                    if (imgMatch && imgMatch[1]) {
                                                        return <AssetViewer query={imgMatch[1].trim()} mode="image" />;
                                                    }

                                                    // Handle INTENT
                                                    const intentMatch = htmlGraphic.match(/\[INTENT:\s*([^\]]+)\]/i);
                                                    if (intentMatch && intentMatch[1]) {
                                                        return <EngineOrchestrator intent={intentMatch[1].trim()} generateResponse={generateResponse} isGenerating={isGenerating} />;
                                                    }

                                                    // Handle GRAPH
                                                    const graphMatch = htmlGraphic.match(/\[GRAPH:\s*(\{[\s\S]*\})\s*\]/i);
                                                    if (graphMatch && graphMatch[1]) {
                                                        return <GraphEngine spec={graphMatch[1].trim()} />;
                                                    }

                                                    const concepts = safeJsonParse(htmlGraphic, null);
                                                    if (Array.isArray(concepts)) {
                                                        return (
                                                            <div className="grid grid-cols-2 gap-12 w-full max-w-5xl h-full py-8">
                                                                {concepts.map((concept, i) => (
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
                                                alt={title} 
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
                                    className="absolute inset-0 flex flex-col p-4 gap-8 overflow-y-auto pr-6"
                                >
                                    {bulletPoints.map((point, index) => (
                                        <AnimatePresence key={index}>
                                            {step > index && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                                    className="flex items-start gap-5 text-3xl"
                                                >
                                                    <span className="text-white/80 mt-1" style={{ textShadow: '0 0 15px rgba(255,255,255,0.8)' }}>*</span>
                                                    <p className="leading-relaxed text-white/95" style={{ textShadow: '0 0 8px rgba(255,255,255,0.5)' }}>{point}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                                                                onClick={() => setSelectedQuizOption(opt)}
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
