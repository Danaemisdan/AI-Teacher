"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, MotionValue } from "framer-motion";
import { 
    SiGoogle, SiWhatsapp, SiCanva, SiSlack, SiNotion, SiFigma,
    SiGithub, SiDiscord, SiZoom, SiLinear, SiX, SiStripe, SiSpotify,
    SiYoutube, SiSalesforce, SiHubspot, SiJira, SiMiro, SiTrello,
    SiDropbox, SiOpenai, SiVercel, SiShopify, SiMailchimp, SiZendesk
} from "react-icons/si";
import { 
    FaLinkedin, FaTiktok, FaTwitch, FaApple, FaReddit, 
    FaAndroid, FaWindows, FaAmazon, FaPaypal, FaSkype, FaTelegram 
} from "react-icons/fa";

const BRANDS = [
    { icon: SiGoogle, color: "#4285F4" }, { icon: FaLinkedin, color: "#0A66C2" }, 
    { icon: SiWhatsapp, color: "#25D366" }, { icon: SiCanva, color: "#00C4CC" }, 
    { icon: SiSlack, color: "#4A154B" }, { icon: SiNotion, color: "#000000" }, 
    { icon: SiFigma, color: "#F24E1E" }, { icon: SiGithub, color: "#181717" },
    { icon: SiDiscord, color: "#5865F2" }, { icon: SiZoom, color: "#2D8CFF" },
    { icon: SiLinear, color: "#5E6AD2" }, { icon: SiX, color: "#000000" },
    { icon: SiStripe, color: "#008CDD" }, { icon: SiSpotify, color: "#1DB954" },
    { icon: SiYoutube, color: "#FF0000" }, { icon: SiSalesforce, color: "#00A1E0" },
    { icon: SiHubspot, color: "#FF7A59" }, { icon: SiJira, color: "#0052CC" },
    { icon: SiMiro, color: "#050038" }, { icon: SiTrello, color: "#0052CC" },
    { icon: SiDropbox, color: "#0061FF" }, { icon: SiOpenai, color: "#412991" },
    { icon: SiVercel, color: "#000000" }, { icon: SiShopify, color: "#95BF47" },
    { icon: SiMailchimp, color: "#FFE01B" }, { icon: SiZendesk, color: "#03363D" },
    { icon: FaTiktok, color: "#000000" }, { icon: FaTwitch, color: "#9146FF" },
    { icon: FaApple, color: "#000000" }, { icon: FaReddit, color: "#FF4500" },
    { icon: FaAndroid, color: "#3DDC84" }, { icon: FaWindows, color: "#0078D6" },
    { icon: FaAmazon, color: "#FF9900" }, { icon: FaPaypal, color: "#00457C" },
    { icon: FaSkype, color: "#00AFF0" }, { icon: FaTelegram, color: "#26A5E4" }
]; // Exactly 36 mathematically unique items

function getHexGridNodes() {
    const nodes = [];
    const R = 140; // Increased spacing drastically so they float freely
    const H = R * Math.sqrt(3) / 2;

    const directions = [
        { dx: -R/2, dy: H },
        { dx: -R,   dy: 0 },
        { dx: -R/2, dy: -H },
        { dx: R/2,  dy: -H },
        { dx: R,    dy: 0 },
        { dx: R/2,  dy: H },
    ];

    let brandIndex = 0;

    for (let n = 1; n <= 3; n++) {
        let x = n * R;
        let y = 0;

        for (let side = 0; side < 6; side++) {
            for (let step = 0; step < n; step++) {
                if (brandIndex < BRANDS.length) {
                    nodes.push({
                        ...BRANDS[brandIndex],
                        x, 
                        y
                    });
                    brandIndex++;
                }
                x += directions[side].dx;
                y += directions[side].dy;
            }
        }
    }
    return nodes;
}

interface FloatingNodeProps {
    node: any;
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

function FloatingNode({ node, mouseX, mouseY, containerRef }: FloatingNodeProps) {
    const { isCenter, icon: Icon, color, x: baseX, y: baseY } = node;
    
    // Spring physics for the dodging effect
    const repelX = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 });
    const repelY = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 });

    useEffect(() => {
        const updateRepulsion = () => {
             if (!containerRef.current) return;
             
             // Container center in viewport
             const rect = containerRef.current.getBoundingClientRect();
             const cx = rect.left + rect.width / 2;
             const cy = rect.top + rect.height / 2;

             // Node's absolute position in viewport
             const nodeAbsX = cx + baseX;
             const nodeAbsY = cy + baseY;

             const mx = mouseX.get();
             const my = mouseY.get();
             
             // If mouse is outside viewport or not interacting, no repulsion
             if (mx === -1 && my === -1) {
                 repelX.set(0); 
                 repelY.set(0); 
                 return;
             }
             
             const dx = nodeAbsX - mx;
             const dy = nodeAbsY - my;
             const distance = Math.sqrt(dx * dx + dy * dy);
             
             const threshold = 180; // Distance to trigger repulsion
             if (distance < threshold && distance > 0 && !isCenter) {
                 // Push away (dodge)
                 const force = (threshold - distance) / threshold; // 0 to 1
                 const pushDistance = force * 60; // Max push 60px
                 repelX.set((dx / distance) * pushDistance);
                 repelY.set((dy / distance) * pushDistance);
             } else {
                 repelX.set(0);
                 repelY.set(0);
             }
        };

        const unsubX = mouseX.on("change", updateRepulsion);
        const unsubY = mouseY.on("change", updateRepulsion);
        
        return () => { unsubX(); unsubY(); }
    }, [mouseX, mouseY, baseX, baseY, repelX, repelY, containerRef, isCenter]);

    // Randomized floating animations
    const randomDelay = useMemo(() => Math.random() * 2, []);
    const randomDuration = useMemo(() => 3 + Math.random() * 2, []);
    const floatDistance = useMemo(() => 10 + Math.random() * 10, []);

    if (isCenter) {
        return (
            <motion.div
                style={{ left: `calc(50% + ${baseX}px)`, top: `calc(50% + ${baseY}px)` }}
                className="absolute z-30 flex items-center justify-center -ml-[40px] -mt-[40px]"
            >
                <div className="w-20 h-20 bg-white rounded-[1.8rem] shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden border border-white/20">
                    <svg viewBox="0 0 375 375" className="w-14 h-14 drop-shadow-sm">
                        <path fill="#000000" d="M 187.53125 64.34375 L 329.738281 310.652344 L 187.53125 239.414062 L 45.320312 310.652344 Z" />
                    </svg>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            style={{ x: repelX, y: repelY, left: `calc(50% + ${baseX}px)`, top: `calc(50% + ${baseY}px)` }}
            className="absolute z-20 flex items-center justify-center -ml-[32px] -mt-[32px]"
        >
            <motion.div 
                animate={{ y: [0, -floatDistance, 0] }}
                transition={{ duration: randomDuration, repeat: Infinity, ease: "easeInOut", delay: randomDelay }}
                className="w-16 h-16 bg-white border border-white/20 rounded-[1.25rem] shadow-[0_8px_30px_rgba(255,255,255,0.1)] flex items-center justify-center transition-transform hover:scale-110"
                style={{ color }}
            >
                <Icon className="w-8 h-8 drop-shadow-sm" />
            </motion.div>
        </motion.div>
    );
}

export function SocialShowcase() {
    const nodes = useMemo(() => {
        return [
            { isCenter: true, x: 0, y: 0 },
            ...getHexGridNodes()
        ];
    }, []);
    
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const mouseX = useMotionValue(-1);
    const mouseY = useMotionValue(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMobile) return;
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
        mouseX.set(-1);
        mouseY.set(-1);
    };

    return (
        <div 
            className="flex flex-col items-center justify-center w-full h-full text-white px-4 overflow-hidden relative bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <h2 className="text-[3rem] sm:text-[4.5rem] font-bold tracking-tight text-center leading-[1.1] mb-12 z-40 pointer-events-none drop-shadow-sm">
                Connects to everything.<br />
                <span className="text-[#fd5934]">Locally.</span>
            </h2>
            
            <div ref={containerRef} className="relative w-full max-w-5xl h-[600px] flex items-center justify-center pointer-events-auto overflow-hidden">
                <motion.div 
                    animate={isMobile ? { x: [0, -300, 300, 0] } : { x: 0 }}
                    transition={isMobile ? { duration: 25, repeat: Infinity, ease: "linear" } : {}}
                    className="relative w-full h-full flex items-center justify-center"
                >
                    {nodes.map((node, i) => (
                        <FloatingNode 
                            key={i} 
                            node={node} 
                            mouseX={mouseX}
                            mouseY={mouseY}
                            containerRef={containerRef}
                        />
                    ))}
                </motion.div>
            </div>
            
            {/* Subtle Gradient Fades on edges to hide the hard cutoff on panning bounds */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-30" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-30" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-30" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-30" />
        </div>
    );
}
