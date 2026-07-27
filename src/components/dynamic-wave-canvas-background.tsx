"use client";

import { useEffect, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const DynamicWaveCanvas = ({ className }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.005;

            const waves = [
                { amplitude: 150, frequency: 0.001, speed: 1.2, color: "rgba(30, 60, 150, 0.4)" }, // Deep blue
                { amplitude: 200, frequency: 0.002, speed: 0.8, color: "rgba(80, 40, 150, 0.3)" }, // Purple
                { amplitude: 100, frequency: 0.0015, speed: 1.5, color: "rgba(100, 100, 120, 0.2)" }, // Grayish
                { amplitude: 250, frequency: 0.0008, speed: 0.5, color: "rgba(20, 30, 80, 0.5)" }, // Dark blue base
            ];

            waves.forEach((wave) => {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height);
                for (let x = 0; x <= canvas.width; x += 10) {
                    const y =
                        canvas.height / 2 +
                        Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
                        Math.cos(x * wave.frequency * 0.5 + time * wave.speed * 0.8) * wave.amplitude * 0.5;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();

                ctx.fillStyle = wave.color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn("absolute inset-0 w-full h-full pointer-events-none opacity-90 blur-[80px] saturate-150", className)}
        />
    );
};
