'use client';

import React, { useEffect, useRef } from 'react';

export interface GraphicConfig {
    preset: 'orbitals' | 'nodes' | 'particles' | 'waves' | 'matrix';
    color1: string;
    color2: string;
    speed: number; // 1 to 10
    density: number; // 1 to 10
}

interface DynamicGraphicProps {
    config: GraphicConfig;
}

export default function DynamicGraphic({ config }: DynamicGraphicProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        // --- Physics Variables ---
        const speedMultiplier = config.speed * 0.2;
        const densityMultiplier = config.density * 5;
        let time = 0;

        // Entities
        const particles: any[] = [];
        const initParticles = (count: number) => {
            particles.length = 0;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * speedMultiplier,
                    vy: (Math.random() - 0.5) * speedMultiplier,
                    radius: Math.random() * 3 + 1,
                    angle: Math.random() * Math.PI * 2,
                    dist: Math.random() * (Math.min(width, height) / 2)
                });
            }
        };

        if (config.preset === 'orbitals') initParticles(densityMultiplier * 2);
        else if (config.preset === 'nodes') initParticles(densityMultiplier * 1.5);
        else if (config.preset === 'particles') initParticles(densityMultiplier * 4);
        else if (config.preset === 'matrix') initParticles(densityMultiplier * 5); // Drops

        // Matrix specifics
        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * height);

        const render = () => {
            time += speedMultiplier * 0.05;

            // Clear Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Trail effect
            if (config.preset === 'matrix' || config.preset === 'nodes') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            } else if (config.preset === 'orbitals') {
                ctx.fillStyle = 'rgba(10, 15, 20, 0.3)';
            }
            ctx.fillRect(0, 0, width, height);

            if (config.preset === 'orbitals') {
                const cx = width / 2;
                const cy = height / 2;
                particles.forEach((p, i) => {
                    p.angle += speedMultiplier * 0.01 + (1 / p.dist) * 2;
                    const x = cx + Math.cos(p.angle) * p.dist;
                    const y = cy + Math.sin(p.angle) * p.dist * 0.5; // Elliptical

                    ctx.beginPath();
                    ctx.arc(x, y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = i % 2 === 0 ? config.color1 : config.color2;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.fill();
                    ctx.shadowBlur = 0; // Reset
                });
                
                // Event Horizon center
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.shadowBlur = 30;
                ctx.shadowColor = config.color1;
                ctx.fill();
                ctx.shadowBlur = 0;
            } 
            else if (config.preset === 'nodes') {
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;
                });

                // Draw connections
                ctx.lineWidth = 1;
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 100})`;
                            ctx.stroke();
                        }
                    }
                    ctx.beginPath();
                    ctx.arc(particles[i].x, particles[i].y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = i % 2 === 0 ? config.color1 : config.color2;
                    ctx.fill();
                }
            } 
            else if (config.preset === 'waves') {
                ctx.lineWidth = 3;
                const waveCount = Math.floor(config.density / 2) + 2;
                for (let i = 0; i < waveCount; i++) {
                    ctx.beginPath();
                    for (let x = 0; x < width; x += 10) {
                        const y = height / 2 + Math.sin(x * 0.01 + time + i) * 50 * Math.sin(time * 0.5 + i);
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.strokeStyle = i % 2 === 0 ? config.color1 : config.color2;
                    ctx.stroke();
                }
            } 
            else if (config.preset === 'matrix') {
                ctx.font = '15px monospace';
                for (let i = 0; i < drops.length; i++) {
                    const text = String.fromCharCode(Math.random() * 128);
                    ctx.fillStyle = Math.random() > 0.5 ? config.color1 : config.color2;
                    ctx.fillText(text, i * 20, drops[i]);
                    if (drops[i] > height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i] += speedMultiplier * 5;
                }
            }
            else { // particles (default)
                particles.forEach((p, i) => {
                    p.y -= speedMultiplier * 2;
                    p.x += Math.sin(p.y * 0.05 + time) * 2;
                    if (p.y < 0) p.y = height;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = i % 2 === 0 ? config.color1 : config.color2;
                    ctx.fill();
                });
            }

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, [config]);

    return (
        <div className="w-full h-full relative bg-gray-900 rounded-xl overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-mono px-3 py-1 rounded backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                System: {config.preset} | Opt: {config.density}x{config.speed}
            </div>
        </div>
    );
}
