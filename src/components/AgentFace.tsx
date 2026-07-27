"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type AgentState = "idle" | "thinking" | "speaking" | "happy" | "surprised" | "listening" | "error" | "sleeping" | "paused";

interface AgentFaceProps {
  state: AgentState;
  isShuttered?: boolean;
  isVoiceMode?: boolean;
  className?: string;
  size?: number; // width/height in px
}

// Proportional states relative to `size`.
// h = height (fraction of size)
// w = width (fraction of size)
// y = vertical offset (fraction of size)
// r = border radius (fraction of width, 0.5 = fully rounded pill)
const EyeStates: Record<AgentState, { h: number; w: number; y: number; r: number; rotate: number }> = {
  idle:      { h: 0.40, w: 0.12, y: 0,    r: 0.5, rotate: 0 },
  listening: { h: 0.50, w: 0.15, y: 0,    r: 0.5, rotate: 0 },
  thinking:  { h: 0.40, w: 0.12, y: -0.05, r: 0.5, rotate: 0 },
  speaking:  { h: 0.35, w: 0.14, y: 0,    r: 0.5, rotate: 0 },
  happy:     { h: 0.08, w: 0.30, y: -0.05, r: 0.5, rotate: 0 },
  surprised: { h: 0.35, w: 0.35, y: -0.05, r: 0.5, rotate: 0 },
  error:     { h: 0.06, w: 0.25, y: 0.05,  r: 0.5, rotate: 0 },
  sleeping:  { h: 0.04, w: 0.22, y: 0.05,  r: 0.5, rotate: 0 },
  paused:    { h: 0.40, w: 0.12, y: 0,    r: 0.5, rotate: 0 },
};

export function AgentFace({ state, isShuttered = false, isVoiceMode = false, className, size = 280 }: AgentFaceProps) {
  const currentEye = EyeStates[state] || EyeStates.idle;
  const [isBlinking, setIsBlinking] = useState(false);

  // Fluid mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 28, stiffness: 180, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 28, stiffness: 180, mass: 0.5 });
  
  // Symmetrical movement for a square container
  const maxOffset = size * 0.15; // Eyes can move 15% in any direction
  const eyeOffsetX = useTransform(smoothX, [-1000, 1000], [-maxOffset, maxOffset]);
  const eyeOffsetY = useTransform(smoothY, [-1000, 1000], [-maxOffset, maxOffset]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      mouseX.set(dist < 500 ? dx : 0);
      mouseY.set(dist < 500 ? dy : 0);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  useEffect(() => {
    let id: NodeJS.Timeout;
    const cycle = () => {
      if (!["happy", "error", "sleeping", "paused"].includes(state) && !isShuttered) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 130);
      }
      id = setTimeout(cycle, Math.random() * 4000 + 2500);
    };
    id = setTimeout(cycle, 2500);
    return () => clearTimeout(id);
  }, [state, isShuttered]);

  const leftRot  = state === "happy" ? 15  : state === "error" ? 20  : currentEye.rotate;
  const rightRot = state === "happy" ? -15 : state === "error" ? -20 : currentEye.rotate;

  const eyeGap = size * 0.18; // Gap is proportional to size

  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center justify-center bg-[#070708] border-[3px] border-[#1c1c1e]",
        className
      )}
      style={{
        width: size, 
        height: size, // Perfect square aspect ratio
        borderRadius: size * 0.18, // Clean rounded-square look matching screenshot
        boxShadow: "0 0 80px rgba(255,255,255,0.07), 0 30px 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.9)",
      }}
    >
      {/* ── Glass Sheen ── */}
      <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none -translate-y-3 scale-x-110" />
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none" />

      {/* ── Eyes Container ── */}
      <motion.div
        style={{
          x: ["sleeping", "error", "paused"].includes(state) || isShuttered || isVoiceMode ? 0 : eyeOffsetX,
          y: ["sleeping", "error", "paused"].includes(state) || isShuttered || isVoiceMode ? 0 : eyeOffsetY,
          gap: eyeGap,
        }}
        className="relative z-10 flex items-center justify-center"
      >
        {[leftRot, rightRot].map((rot, i) => (
          <motion.div
            key={i}
            animate={(isBlinking
              ? { height: size * 0.03, y: size * currentEye.y }
              : { 
                  height: size * currentEye.h, 
                  width: size * currentEye.w, 
                  borderRadius: (size * currentEye.w) * currentEye.r,
                  y: size * currentEye.y,
                  rotate: rot,
                }) as any}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="bg-white origin-center"
            style={{ 
              boxShadow: "0 0 28px rgba(255,255,255,0.65), 0 0 56px rgba(255,255,255,0.28)" 
            }}
          />
        ))}
      </motion.div>

      {/* ── Shutter Animation ── */}
      <AnimatePresence>
        {isShuttered && (
          <>
            {[{ from: "-100%", to: "0%", pos: "top-0", border: "border-b-2", align: "items-end pb-2" },
              { from: "100%",  to: "0%", pos: "bottom-0", border: "border-t-2", align: "items-start pt-2" }
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ y: s.from }} animate={{ y: s.to }} exit={{ y: s.from }}
                transition={{ type: "spring", bounce: 0.15, stiffness: 220, damping: 22 }}
                className={`absolute ${s.pos} left-0 w-full h-[50.5%] bg-[#1a1a1c] z-50 ${s.border} border-[#2a2a2c] flex ${s.align} justify-center`}
              >
                <div className="w-1/4 h-1 bg-black/50 rounded-full" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
