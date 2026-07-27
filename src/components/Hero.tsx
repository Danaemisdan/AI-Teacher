"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useSpring } from "framer-motion";
import Image from "next/image";
import { E_DOTS } from "./e-dots";
import { V_DOTS } from "./v-dots";
import { R_DOTS } from "./r-dots";
import { Y_DOTS } from "./y-dots";
import { T_DOTS } from "./t-dots";
import { H_DOTS } from "./h-dots";
import { I_DOTS } from "./i-dots";
import { N_DOTS } from "./n-dots";
import { G_DOTS } from "./g-dots";
import { A_DOTS } from "./a-dots";
import { I2_DOTS } from "./i2-dots";
import { DynamicWaveCanvas } from "./dynamic-wave-canvas-background";
import { FaApple, FaWindows, FaAndroid } from "react-icons/fa";
import { ShineBorder } from "./ui/shine-border";
import { Check, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AnimatedTextCycle from "./ui/animated-text-cycle";
import { AgentShowcase } from "./AgentShowcase";


// Geometrical Bounding Box Extractor
function getPathsBounds(paths: string[]) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    paths.forEach(p => {
        const coords = p.match(/-?\d+\.?\d*/g);
        if (!coords) return;
        for (let i = 0; i < coords.length; i += 2) {
            const x = parseFloat(coords[i]);
            const y = parseFloat(coords[i + 1]);
            if (!isNaN(x)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
            if (!isNaN(y)) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    });
    return {
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        width: maxX - minX,
        height: maxY - minY
    };
}

const ALPHABET: Record<string, string[]> = {
    E: E_DOTS,
    V: V_DOTS,
    R: R_DOTS,
    Y: Y_DOTS,
    T: T_DOTS,
    H: H_DOTS,
    I: I_DOTS,
    N: N_DOTS,
    G: G_DOTS,
    A: A_DOTS,
    i: I2_DOTS,
};
const STENCIL_KEYS = Object.keys(ALPHABET) as Array<keyof typeof ALPHABET>;

// Final Sequential Timeline mapping
const TIMINGS: Record<string, number> = {
    E: 0,
    V: 800,
    R: 600,
    Y: 450,
    T: 350,
    H: 250,
    I: 200,
    N: 150,
    G: 120,
    A: 100,
    i: 600,

    // EVRYTHING Ai End States
    LOGO_WHITE_BG_1: 500,
    LOGO_BLACK_BG_2: 500,
    LOGO_WHITE_BG_3: 1000,

    // Smooth Transition sequence
    INTRO_TEXT: 2000, // Background blacken instantly, "Introducing" blurs/fades in
    CANVAS_AND_LOGO: 2000, // Introducing fades out. Wave slides up. Logo anchors center.
    MOMENTUM_LOCK: 0, // Logo seamlessly floats up. Title fades below.
};

const STEP_KEYS = [
    ...STENCIL_KEYS,
    "LOGO_WHITE_BG_1",
    "LOGO_BLACK_BG_2",
    "LOGO_WHITE_BG_3",
    "INTRO_TEXT",
    "CANVAS_AND_LOGO",
    "MOMENTUM_LOCK"
];

const BOUNDS = Object.fromEntries(
    Object.entries(ALPHABET).map(([k, paths]) => [k, getPathsBounds(paths)])
);
const REF_HEIGHT = BOUNDS['E'].height;

/* ── Pre-order countdown clock ── */
function PreorderCountdown() {
    const DEADLINE = new Date("2026-03-31T23:59:59+05:30").getTime();
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, DEADLINE - Date.now()));

    useEffect(() => {
        const id = setInterval(() => setTimeLeft(Math.max(0, DEADLINE - Date.now())), 1000);
        return () => clearInterval(id);
    }, [DEADLINE]);

    const d = Math.floor(timeLeft / 86400000);
    const h = Math.floor((timeLeft % 86400000) / 3600000);
    const m = Math.floor((timeLeft % 3600000) / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/40">
                Presale Ends In
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium tracking-tight text-black flex-1 min-w-0">
                <div className="flex items-baseline gap-px">
                    <span>{d}</span><span className="text-[10px] text-black/50 ml-0.5 mr-1">D</span>
                    <span>{pad(h)}</span><span className="text-[10px] text-black/50 ml-0.5 mr-1">H</span>
                    <span>{pad(m)}</span><span className="text-[10px] text-black/50 ml-0.5 mr-1">M</span>
                    <span>{pad(s)}</span><span className="text-[10px] text-black/50 ml-0.5">S</span>
                </div>
                <div className="h-px bg-black/10 flex-1 ml-2"></div>
            </div>
        </div>
    );
}


export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<SVGSVGElement>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [hasVisited, setHasVisited] = useState<boolean | null>(null);
    const [osLabel, setOsLabel] = useState<"macOS" | "Windows" | "iOS" | "Android">("Windows");
    const [showPopup, setShowPopup] = useState(false);
    const [showArrow, setShowArrow] = useState(false);
    const [agentActive, setAgentActive] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setShowArrow(true), 3000);
        return () => clearTimeout(t);
    }, []);
    const [isHeroReady, setIsHeroReady] = useState(false);
    const [logoRect, setLogoRect] = useState({ cx: 0, cy: 0, size: 300 });
    const [isAgentVisible, setIsAgentVisible] = useState(false);

    useEffect(() => {
        const visited = sessionStorage.getItem("evrything-visited");
        if (visited) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasVisited(true);
            setStepIndex(STEP_KEYS.indexOf("LOGO_WHITE_BG_3"));
        } else {
            setHasVisited(false);
            sessionStorage.setItem("evrything-visited", "true");
        }

        // Hydrate hardware sniffing
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/i.test(userAgent)) {
            setOsLabel("iOS");
        } else if (/android/i.test(userAgent)) {
            setOsLabel("Android");
        } else if (/macintosh|mac os x/i.test(userAgent)) {
            setOsLabel("macOS");
        } else {
            setOsLabel("Windows");
        }
    }, []);

    const step = STEP_KEYS[stepIndex];
    const isLogoPhase = stepIndex >= STEP_KEYS.indexOf("LOGO_WHITE_BG_1") && stepIndex <= STEP_KEYS.indexOf("LOGO_WHITE_BG_3");
    const isMomentumPhase = stepIndex >= STEP_KEYS.indexOf("INTRO_TEXT");
    const isCanvasPhase = stepIndex >= STEP_KEYS.indexOf("CANVAS_AND_LOGO");

    const [randomStarts] = useState(() => {
        return ALPHABET["E"].map(() => {
            const side = Math.floor(Math.random() * 4);
            const distance = 800;
            switch (side) {
                case 0: return { x: (Math.random() - 0.5) * distance, y: -distance };
                case 1: return { x: distance, y: (Math.random() - 0.5) * distance };
                case 2: return { x: (Math.random() - 0.5) * distance, y: distance };
                case 3: return { x: -distance, y: -distance };
                default: return { x: 0, y: distance };
            }
        });
    });

    // Sequence execution timeline
    useEffect(() => {
        if (hasVisited === null) return;

        if (step === "MOMENTUM_LOCK") {
            const updateRect = () => {
                if (logoRef.current) {
                    const rect = logoRef.current.getBoundingClientRect();
                    setLogoRect({
                        cx: rect.left + rect.width / 2,
                        cy: rect.top + rect.height / 2,
                        size: rect.width
                    });
                }
            };

            // Wait 2 seconds for the y:-140 spring animation to settle securely
            const t = setTimeout(() => {
                updateRect();
                setIsHeroReady(true);
            }, 2000);

            window.addEventListener('resize', updateRect);
            return () => {
                clearTimeout(t);
                window.removeEventListener('resize', updateRect);
            };
        }

        if (step !== "E") {
            const duration = TIMINGS[step];
            const timeout = setTimeout(() => {
                setStepIndex((prev) => prev + 1);
            }, duration);
            return () => clearTimeout(timeout);
        }
    }, [step, hasVisited]);

    // --- Scroll Physics (hooks must be called before conditional returns) ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });
    
    // Smooth out the scroll progress to prevent abrupt jumps and provide smooth transitions
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest >= 0.38 && latest <= 0.60) {
                setIsAgentVisible(true);
            } else {
                setIsAgentVisible(false);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    // ── Hero text/button: blur + fade OUT on early scroll ──────────────────────
    // NOTE: blurOut is applied ONLY to text + buttons. The logo NEVER blurs.
    const blurOutOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
    const blurOutRaw = useTransform(smoothProgress, [0, 0.15], [0, 20]);
    const blurOutFilter = useMotionTemplate`blur(${blurOutRaw}px)`;
    const blurOutY = useTransform(smoothProgress, [0, 0.15], [0, -30]);
    const heroPointerEvents = useTransform(smoothProgress, [0, 0.1, 0.15], ["auto", "auto", "none"]);

    // ── Minimalist Scroll Prompt: blurs & fades OUT immediately on scroll ──
    const scrollPromptOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);
    const scrollPromptBlur = useTransform(smoothProgress, [0, 0.05], [0, 10]);
    const scrollPromptFilter = useMotionTemplate`blur(${scrollPromptBlur}px)`;

    // ── Logo fade: static SVG fades out as the expanding copy takes over ──
    const logoFadeOpacity = useTransform(smoothProgress, [0.03, 0.12], [1, 0]);

    // ── Logo scale: the white logo SVG grows exponentially to fill the screen with white ──
    const logoScaleUp = useTransform(smoothProgress, [0.05, 0.15], [1, 65]);
    const logoBlurRaw = useTransform(smoothProgress, [0.15, 0.20], [0, 0]);
    const logoBlurFilter = useMotionTemplate`blur(${logoBlurRaw}px)`;

    // ── Second section (White Background): the Animated Text Cycle fades IN over the white logo ──
    const textCycleOpacity = useTransform(smoothProgress, [0.15, 0.20, 0.25, 0.30], [0, 1, 1, 0]);
    const textCycleY = useTransform(smoothProgress, [0.15, 0.20, 0.25, 0.30], [20, 0, 0, -20]);

    // ── Agent Showcase: appears right after the text cycle, on the black bg ──
    const agentOpacity = useTransform(smoothProgress, [0.33, 0.40, 0.58, 0.63], [0, 1, 1, 0]);
    const agentY = useTransform(smoothProgress, [0.33, 0.40, 0.58, 0.63], [40, 0, 0, -40]);

    // ── Ticker Tape finale: appears after the agent ──
    const contentOpacity = useTransform(smoothProgress, [0.65, 0.72, 0.87, 0.90], [0, 1, 1, 0]);
    const contentY = useTransform(smoothProgress, [0.65, 0.72], [40, 0]);
    const contentBlurRaw = useTransform(smoothProgress, [0.65, 0.72], [16, 0]);
    const contentBlurFilter = useMotionTemplate`blur(${contentBlurRaw}px)`;

    // ── Black overlay fades in after AnimatedText ──
    const blackOverlayOpacity = useTransform(smoothProgress, [0.28, 0.32], [0, 1]);

    // ── Global Scroll Arrow Opacity (fades out at the very end only) ──
    const globalArrowOpacity = useTransform(smoothProgress, [0.15, 0.20, 0.90, 0.95], [0, 1, 1, 0]);

    const enableScroll = isMomentumPhase && step === "MOMENTUM_LOCK" && isHeroReady;

    useEffect(() => {
        if (!enableScroll) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        } else {
            document.body.style.overflow = '';
        }
    }, [enableScroll]);

    if (hasVisited === null) {
        return <div ref={containerRef} className="w-full h-screen bg-black" />; // SSR placeholder preventing hydration flash
    }

    const isWhiteBG = ["V", "Y", "H", "N", "A", "LOGO_WHITE_BG_1", "LOGO_WHITE_BG_3"].includes(step);
    const bgColorClass = isWhiteBG ? "bg-white" : "bg-black";
    const bgTransitionClass = isMomentumPhase ? "transition-colors duration-[1500ms] ease-in-out" : "transition-none duration-0";

    const containerHeightClass = "h-[900vh]"; // Fixed tall height, extended for the 3 distinct scrolling sections plus feature pages

    return (
        <div ref={containerRef} className={`relative w-full ${containerHeightClass} ${bgTransitionClass} ${bgColorClass}`}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">

                {/* Phase 3: Dynamic WebGL and OS Layer */}
                <AnimatePresence>
                    {isMomentumPhase && (
                        <motion.div
                            key="momentum-layer"
                            className="absolute inset-0 z-0 flex flex-col items-center justify-center font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]"
                        >
                            {/* Slide up canvas aggressively from bottom */}
                            <AnimatePresence>
                                {isCanvasPhase && (
                                    <motion.div
                                        className="absolute inset-0 z-0"
                                        initial={{ y: "100%" }}
                                        animate={{ y: "0%" }}
                                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <DynamicWaveCanvas className="z-0" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                                <AnimatePresence mode="wait">
                                    {step === "INTRO_TEXT" && (
                                        <motion.div
                                            key="intro-text"
                                            className="absolute text-white text-5xl md:text-7xl lg:text-8xl tracking-tight font-medium"
                                            initial={{ opacity: 0, filter: "blur(15px)", scale: 0.95 }}
                                            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                                            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05, transition: { duration: 0.6 } }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                        >
                                            {"Introducing".split("").map((char, index) => (
                                                <motion.span
                                                    key={index}
                                                    className="inline-block"
                                                    initial={{ rotateX: -90, opacity: 0, y: 10 }}
                                                    animate={{ rotateX: 0, opacity: 1, y: 0 }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.1 + (index * 0.05),
                                                        type: "spring",
                                                        stiffness: 150,
                                                        damping: 20
                                                    }}
                                                >
                                                    {char}
                                                </motion.span>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Unified Logo Component to prevent double-mount jump glitch */}
                                <AnimatePresence>
                                    {isCanvasPhase && (
                                        <motion.div
                                            key="unified-momentum-sequence"
                                            className="absolute flex flex-col items-center justify-center w-full px-4"
                                        >
                                            <motion.div
                                                // 1. Instantly pop dead center (y:0) when `CANVAS_AND_LOGO` fires
                                                // 2. ONLY move (y:-140) when `MOMENTUM_LOCK` finally fires 2 seconds later
                                                initial={{ scale: 0.9, opacity: 0, y: 0 }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                    y: step === "MOMENTUM_LOCK" ? -140 : 0
                                                }}
                                                transition={{
                                                    opacity: { duration: 0.8 },
                                                    scale: { duration: 0.8, ease: "easeOut" },
                                                    y: { duration: 1, ease: [0.16, 1, 0.3, 1] } // Apple spring vertical translation
                                                }}
                                                className="mb-6 xl:mb-8 relative flex justify-center w-full"
                                            >
                                                <motion.div style={{ opacity: logoFadeOpacity }}>
                                                    {/* The stationary logo — fades out as the stencil takes over its EXACT shape */}
                                                    <svg
                                                        ref={logoRef}
                                                        viewBox="0 0 375 375"
                                                        className="w-[60vw] sm:w-[300px] xl:w-[350px] h-auto drop-shadow-2xl opacity-100 transition-opacity"
                                                        style={{ filter: "drop-shadow(0px 0px 40px rgba(255,255,255,0.15))" }}
                                                    >
                                                        <path fill="#ffffff" d="M 187.53125 64.34375 L 329.738281 310.652344 L 187.53125 239.414062 L 45.320312 310.652344 Z" />
                                                    </svg>
                                                </motion.div>
                                            </motion.div>

                                            {/* Typography cascade triggers conditionally inside the master container */}
                                            <AnimatePresence>
                                                {step === "MOMENTUM_LOCK" && (
                                                    <motion.div
                                                        key="momentum-type"
                                                        initial={{ opacity: 0, filter: "blur(15px)" }}
                                                        animate={{ opacity: 1, filter: "blur(0px)" }}
                                                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                                        className="absolute flex flex-col items-center text-center space-y-1 top-[42%] mt-0"
                                                    >
                                                        <motion.div style={{ opacity: blurOutOpacity, filter: blurOutFilter, y: blurOutY, pointerEvents: heroPointerEvents as any }} className="flex flex-col items-center">
                                                            <h1
                                                                className="text-white text-[3.5rem] sm:text-[5.5rem] md:text-[7.5rem] lg:text-[9.5rem] leading-[0.9] font-medium tracking-tighter mb-2 sm:mb-3 max-w-[1200px] z-10 px-4"
                                                                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif", transform: "scaleX(0.94)" }}
                                                            >
                                                                Momentum OS
                                                            </h1>
                                                            <p className="text-xl sm:text-[28px] text-white font-medium tracking-tight mb-5 z-10 px-6 text-center" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
                                                                Turn your computer into an AI growth engine.
                                                            </p>

                                                            <div className="pt-0 flex flex-row items-center justify-center gap-4 sm:gap-7 z-50 w-full px-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>
                                                                {/* Pre-order -> Coming Soon */}
                                                                <button
                                                                    className="aurora-download-btn group relative bg-transparent border border-white/50 text-white px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-semibold text-[15px] sm:text-[17px] tracking-normal transition-all duration-300 hover:border-transparent flex items-center justify-center shrink-0 w-auto shadow-sm cursor-default"
                                                                >
                                                                    Coming Soon
                                                                    <span className="aurora-glow-ring"></span>
                                                                </button>

                                                                {/* Learn More — bare text link (Apple secondary style) */}
                                                                <button
                                                                    className="text-white hover:text-white/70 font-medium text-[15px] sm:text-[17px] tracking-normal transition-colors duration-200 flex items-center justify-center gap-1.5 group w-auto"
                                                                    onClick={() => { window.scrollTo({ top: window.innerHeight * 1.0, behavior: "smooth" }); }}
                                                                >
                                                                    Learn More
                                                                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-normal opacity-80 mt-[1px]">›</span>
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Minimal Scroll Prompt - Fades & Blurs OUT on Scroll */}
                                            {step === "E" && (
                                                <motion.div
                                                    initial={{ opacity: 0, filter: "blur(10px)" }}
                                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                                    transition={{ delay: 1, duration: 1.5 }}
                                                    className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center"
                                                >
                                                    <motion.div
                                                        style={{ opacity: scrollPromptOpacity, filter: scrollPromptFilter }}
                                                        className="flex flex-col items-center gap-4"
                                                    >
                                                        <div className="w-[1px] h-[50px] bg-white/10 relative overflow-hidden rounded-full">
                                                            <motion.div
                                                                animate={{ y: ["-100%", "200%"] }}
                                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                                className="w-full h-1/2 bg-white/70 absolute top-0 left-0 rounded-full"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/30" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
                                                            Scroll
                                                        </span>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Logo Scale + Blur → Black Transition ── */}
                            {enableScroll && (
                                <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">

                                    {/* The white logo that physically grows exponentially to fill bounds */}
                                    <motion.div
                                        className="absolute"
                                        style={{
                                            left: logoRect.cx - (logoRect.size / 2),
                                            top: logoRect.cy - (logoRect.size / 2),
                                            width: logoRect.size,
                                            height: logoRect.size,
                                            scale: logoScaleUp,
                                            filter: logoBlurFilter,
                                            transformOrigin: "center center",
                                        }}
                                    >
                                        <svg
                                            viewBox="0 0 375 375"
                                            style={{ width: "100%", height: "100%" }}
                                        >
                                            <path fill="white" d="M 187.53125 64.34375 L 329.738281 310.652344 L 187.53125 239.414062 L 45.320312 310.652344 Z" />
                                        </svg>
                                    </motion.div>

                                    {/* MIDDLE SECTION: White Background with Animated Text Cycle */}
                                    <motion.div
                                        style={{ opacity: textCycleOpacity, y: textCycleY }}
                                        className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-center pointer-events-none px-6 sm:px-12"
                                    >
                                        <h3
                                            className="text-black text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-center max-w-[1000px] font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]"
                                        >
                                            You deserve{" "}
                                            <AnimatedTextCycle
                                                words={["better", "faster", "smoother", "more accurate"]}
                                                interval={2500}
                                                className="text-[#fd5934]"
                                            />{" "}
                                            <br className="hidden md:block" />
                                            automation setups.
                                        </h3>
                                    </motion.div>

                                    {/* Black overlay fades in immediately after White Animated Text to serve as Dark Theme Canvas */}
                                    <motion.div
                                        className="absolute inset-0 bg-black z-20 pointer-events-none"
                                        style={{ opacity: blackOverlayOpacity }}
                                    />

                                    {/* AGENT SHOWCASE */}
                                    <motion.div
                                        style={{ opacity: agentOpacity, y: agentY }}
                                        className="absolute inset-0 z-50 w-full h-full flex flex-col items-center justify-center pointer-events-none bg-black"
                                    >
                                        <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                                            <AgentShowcase isVisible={isAgentVisible} onAgentActive={setAgentActive} />
                                        </div>
                                    </motion.div>

                                    {/* FINAL SECTION content — blurs into place as black arrives */}
                                    <motion.div
                                        id="learn-more"
                                        style={{ opacity: contentOpacity, y: contentY, filter: contentBlurFilter }}
                                        className="relative z-40 w-full h-full flex flex-col justify-center gap-6 sm:gap-10 lg:gap-16 overflow-hidden pt-8 lg:pt-12 bg-black"
                                    >
                                        {/* Keep as empty placeholder. Global arrow handled below. */}

                                        {/* ── Top Half: Text (Left) & CTA (Right) ── */}
                                        <div className="relative z-20 flex flex-col lg:flex-row items-start lg:items-start justify-between w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 gap-8 lg:gap-12 mt-6 lg:mt-0">

                                            {/* Left: Bold headline */}
                                            <div className="flex flex-col items-start text-left max-w-[100vw] sm:max-w-[800px] px-2 sm:px-0">
                                                <h3
                                                    className="text-white text-[8.5vw] xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.1] break-words font-[-apple-system,BlinkMacSystemFont,'SF_Pro',sans-serif]"
                                                    style={{ textShadow: "0 4px 60px rgba(0,0,0,0.4)" }}
                                                >
                                                    Don&apos;t F***ing pay subscriptions to AI agents to grow your business.
                                                </h3>
                                            </div>

                                            {/* Right: Context Text & Action Button */}
                                            <div className="flex flex-col items-center lg:items-end shrink-0 pointer-events-auto pt-8 lg:pt-0 relative w-full lg:w-auto lg:mt-3 lg:pr-10">
                                                <div className="flex flex-col items-end gap-10 max-w-[460px]">
                                                    <p className="text-[#a0a0a0] text-[17px] sm:text-[19px] font-medium leading-relaxed text-right w-full inline-block mt-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
                                                        Momentum OS is built into your OS layer — it<br className="hidden md:block" /> replaces every AI subscription you&apos;re paying for.
                                                    </p>
                                                    <div className="flex justify-end w-full">
                                                        <button
                                                            className="aurora-download-btn group relative bg-transparent border border-[#555] text-white px-10 py-3.5 lg:px-12 lg:py-4 rounded-full font-semibold text-[17px] sm:text-[18px] tracking-normal transition-all duration-300 hover:border-transparent flex items-center justify-center shrink-0 w-full sm:w-auto shadow-sm cursor-default"
                                                        >
                                                            Coming Soon
                                                            <span className="aurora-glow-ring"></span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Bottom Half: Foreground Horizontal Ticker Tape ── */}
                                        <div className="relative w-full max-w-[100vw] overflow-hidden z-20 flex flex-col items-center mt-6 lg:mt-12 mb-0 lg:mb-4">
                                            {/* Label Text */}
                                            <p className="text-[#888888] text-[15px] sm:text-[16px] tracking-normal mb-6 text-center px-8" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif" }}>
                                                Evrything AI is democratizing AI so you don&apos;t need subscriptions to gain momentum.
                                            </p>
                                            <div className="relative w-full max-w-[100vw] overflow-hidden">
                                                <div
                                                    className="flex w-max"
                                                    style={{ animation: "ticker-left 40s linear infinite" }}
                                                >
                                                    {/* Duplicate exactly 2 times for a seamless -50% translation loop */}
                                                    {[...Array(2)].map((_, trackIndex) => (
                                                        <React.Fragment key={`track-${trackIndex}`}>
                                                            {[
                                                                { name: "ChatGPT", bg: "#10A37F", font: "'Inter', sans-serif" },
                                                                { name: "Claude", bg: "#C96442", font: "'Lora', Georgia, serif" },
                                                                { name: "Gemini", bg: "#1A73E8", font: "'Nunito', sans-serif" },
                                                                { name: "n8n", bg: "#EA4B71", font: "'Raleway', sans-serif" },
                                                                { name: "Zapier", bg: "#FF4A00", font: "'Outfit', sans-serif" },
                                                                { name: "Make.com", bg: "#6D3BDB", font: "'Plus Jakarta Sans', sans-serif" },
                                                                { name: "Perplexity", bg: "#1FB8CD", font: "'Space Grotesk', sans-serif" },
                                                                { name: "Copilot", bg: "#0078D4", font: "'Inter', sans-serif" },
                                                            ].map((b, i) => (
                                                                <motion.div 
                                                                    whileHover={{ y: -20, scale: 1.05, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.3)" }}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                    key={`pill-${trackIndex}-${i}`} 
                                                                    className="w-[200px] sm:w-[280px] shrink-0 py-10 sm:py-12 mx-4 rounded-[40px] flex items-center justify-center shadow-xl cursor-default" 
                                                                    style={{ background: b.bg }}
                                                                >
                                                                    <span className="text-white font-bold text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: b.font }}>{b.name}</span>
                                                                </motion.div>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </div>

                                                {/* Fade masks for the left/right edges of the screen to blend the tape smoothly */}
                                                <div className="absolute inset-y-0 left-0 w-8 sm:w-64 z-30 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                                                <div className="absolute inset-y-0 right-0 w-8 sm:w-64 z-30 bg-gradient-to-l from-black to-transparent pointer-events-none" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {/* Global Sticky Scroll Indicator Arrow removed for demo */}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Phases 1 & 2: Legacy Evrything Stencils */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    {!isLogoPhase && !isMomentumPhase && (
                        <svg
                            viewBox="0 0 375 375"
                            className="w-full max-w-[90vw] sm:max-w-[600px] h-auto overflow-visible origin-center"
                        >
                            <g transform={`translate(187.5, 187.5) scale(${REF_HEIGHT / (BOUNDS[step]?.height || 1)}) translate(${- (BOUNDS[step]?.cx || 0)}, ${- (BOUNDS[step]?.cy || 0)})`}>
                                <g fill={(step === "A" || step === "i") ? "#fd5934" : (["V", "Y", "H", "N"].includes(step) ? "#000000" : "#ffffff")}>
                                    {step in ALPHABET && ALPHABET[step as string].map((dotPath, i) => {
                                        if (dotPath.length < 10) return null;

                                        if (step === "E") {
                                            return (
                                                <motion.path
                                                    key={`e-${i}`}
                                                    initial={{ opacity: 0, x: randomStarts[i].x, y: randomStarts[i].y, scale: 0.2, d: dotPath }}
                                                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, d: dotPath }}
                                                    transition={{
                                                        type: "tween",
                                                        ease: [0.33, 1, 0.68, 1],
                                                        duration: 0.8,
                                                        delay: i * 0.1,
                                                    }}
                                                    onAnimationComplete={() => {
                                                        if (i === ALPHABET["E"].length - 1) {
                                                            setTimeout(() => {
                                                                setStepIndex((prev) => prev + 1);
                                                            }, 600);
                                                        }
                                                    }}
                                                />
                                            );
                                        }

                                        return <path key={`${step}-${i}`} d={dotPath} />;
                                    })}
                                </g>
                            </g>
                        </svg>
                    )}

                    {isLogoPhase ? (
                        <div className="relative w-[90vw] max-w-[800px] flex items-center justify-center flex-shrink-0">
                            {step === "LOGO_BLACK_BG_2" ? (
                                <Image
                                    src="/logo-white.svg"
                                    alt="Evrything AI Final Logo"
                                    width={800}
                                    height={800}
                                    className="w-full h-auto max-w-full"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/logo-black.svg"
                                    alt="Evrything AI Final Logo"
                                    width={800}
                                    height={800}
                                    className="w-full h-auto max-w-full"
                                    priority
                                />
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Pre-order Popup */}
                <AnimatePresence>
                    {showPopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                        >
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
                                onClick={() => setShowPopup(false)}
                            />

                            {/* Modal card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 16, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, y: 16, filter: "blur(8px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full max-w-md z-10"
                            >
                                {/* Gradient Border Wrapper */}
                                <div className="rainbow-gradient-border rounded-3xl p-[2px] shadow-2xl relative">
                                    <div
                                        className="relative rounded-[calc(1.5rem-2px)] bg-white p-8 sm:p-10 overflow-hidden w-full h-full"
                                        style={{ fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
                                    >
                                        {/* Subtle noise texture or gradient on light theme to make it premium could go here, but keeping pure white for now */}

                                        {/* Close */}
                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="absolute top-6 right-6 text-black/30 hover:text-black transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>

                                        {/* Header & Meta */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Image src="/20.svg" alt="Momentum OS" width={24} height={24} className="w-6 h-6 object-contain" />
                                                <span className="text-black font-semibold text-lg tracking-tight">Pre-order Momentum OS</span>
                                            </div>
                                            <p className="text-black/50 text-[13px] tracking-tight flex items-center gap-2">
                                                <span>Ships March 31</span>
                                                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                                                <span>Lifetime Access</span>
                                            </p>
                                        </div>

                                        {/* Premium Seats & Timeline Typographic Layout */}
                                        <div className="mb-10 flex flex-col gap-4 border-y border-black/5 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/40">
                                                    Availability
                                                </span>
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-black">137 <span className="text-black/40">of 1,000 seats reserved</span></span>
                                                    <div className="h-px bg-black/10 flex-1 ml-2"></div>
                                                </div>
                                            </div>
                                            <PreorderCountdown />
                                        </div>

                                        {/* Price — Perandory Condensed explicitly requested */}
                                        <div className="flex items-end gap-3 mb-8 px-1">
                                            <span
                                                className="text-black font-normal leading-none inline-block origin-bottom-left"
                                                style={{ fontFamily: "'Perandory Condensed', 'Bodoni Moda', 'Didot', 'Cormorant Garamond', serif", fontSize: "5rem", transform: "scaleY(1.2) translateY(5px)" }}
                                            >$30</span>
                                            <div className="flex flex-col pb-1">
                                                <span className="text-black font-medium text-sm tracking-tight leading-tight">One-time payment</span>
                                                <span className="text-black/40 text-[13px] tracking-tight leading-tight">Yours forever</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="flex flex-col gap-3 mb-10 pl-1">
                                            {[
                                                "Lifetime license — pay once, own it forever",
                                                "All future updates included",
                                                "Replaces every AI subscription you pay for"
                                            ].map((f) => (
                                                <li key={f} className="flex items-start gap-3 text-[14px] text-black/60 tracking-tight">
                                                    <svg className="w-4 h-4 mt-0.5 text-black/40 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA - Ultra Premium Black Button with Aurora Hover */}
                                        <button
                                            type="button"
                                            className="aurora-download-btn group relative w-full h-[56px] rounded-full bg-black text-white font-medium text-[15px] tracking-tight transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] overflow-hidden"
                                            onClick={() => window.open("https://buy.stripe.com/test_placeholder", "_blank")}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Proceed to Checkout
                                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </span>
                                            <span className="aurora-glow-ring"></span>
                                        </button>
                                        <p className="text-black/30 text-[11px] font-medium text-center mt-4 tracking-tight uppercase">Secure Stripe Checkout</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Scroll Down Arrow */}
            <AnimatePresence>
                {showArrow && !agentActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] cursor-pointer text-white/50 hover:text-white transition-colors duration-300"
                        onClick={() => window.scrollTo({ top: window.scrollY + window.innerHeight * 0.8, behavior: "smooth" })}
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ArrowDown className="w-8 h-8" strokeWidth={1.5} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
