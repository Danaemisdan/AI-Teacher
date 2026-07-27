"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
    springOptions?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };
}

export function Magnetic({
    children,
    className = "",
    intensity = 0.5,
    springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
}: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useSpring(0, springOptions);
    const y = useSpring(0, springOptions);

    useEffect(() => {
        if (!isHovered) {
            x.set(0);
            y.set(0);
        }
    }, [isHovered, x, y]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        
        // Calculate distance from center of element
        const xPos = clientX - (left + width / 2);
        const yPos = clientY - (top + height / 2);

        // Apply magnetic pull strength based on intensity multiplier
        x.set(xPos * intensity);
        y.set(yPos * intensity);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{ x, y }}
            className={`relative inline-flex items-center justify-center ${className}`}
        >
            {children}
        </motion.div>
    );
}
