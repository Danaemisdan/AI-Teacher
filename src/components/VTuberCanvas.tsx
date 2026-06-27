'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

// We must expose PIXI to window for pixi-live2d-display to work
if (typeof window !== 'undefined') {
    (window as any).PIXI = PIXI;
}

interface VTuberCanvasProps {
    modelUrl?: string;
    isSpeaking?: boolean;
    audioUrlToSpeak?: string | null;
    expression?: string;
    onSpeakEnd?: () => void;
    onReady?: () => void;
}

export default function VTuberCanvas({ 
    modelUrl = '/live2d/shizuku/shizuku.model.json',
    isSpeaking = false,
    audioUrlToSpeak,
    expression = 'f04',
    onSpeakEnd,
    onReady
}: VTuberCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const modelRef = useRef<any>(null);

    // Perfect Audio-Driven Lipsync with Web Audio API!
    useEffect(() => {
        if (!audioUrlToSpeak || !modelRef.current) return;
        
        let animationFrameId: number;
        const audioEl = new Audio(audioUrlToSpeak);
        audioEl.crossOrigin = "anonymous";
        
        let audioCtx: AudioContext;
        let analyser: AnalyserNode;
        let dataArray: Uint8Array;
        
        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaElementSource(audioEl);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        } catch (e) {
            console.error("Audio API error:", e);
        }
        
        audioEl.onended = () => {
            const coreModel = modelRef.current?.internalModel?.coreModel;
            if (coreModel) {
                if (typeof coreModel.setParameterValueById === 'function') {
                    coreModel.setParameterValueById('ParamMouthOpenY', 0);
                } else if (typeof coreModel.setParamFloat === 'function') {
                    coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', 0);
                }
            }
            if (onSpeakEnd) onSpeakEnd();
        };

        audioEl.play().catch(e => {
            console.error("Audio play blocked", e);
            if (onSpeakEnd) onSpeakEnd();
        });

        let currentMouthValue = 0; // Persist across frames

        const animateMouth = () => {
            const coreModel = modelRef.current?.internalModel?.coreModel;
            if (!coreModel) return;

            let targetMouthValue = 0;
            if (analyser && dataArray) {
                analyser.getByteFrequencyData(dataArray as any);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                // Exaggerate mouth movement slightly and cap at 1.0
                targetMouthValue = Math.min(1.0, average / 25.0);
            } else {
                // Fallback random movement if Audio API fails
                targetMouthValue = Math.random() * 0.8 + 0.2;
            }

            // LERP (Linear Interpolation) for incredibly smooth, natural mouth movements!
            currentMouthValue = currentMouthValue + (targetMouthValue - currentMouthValue) * 0.4;

            if (typeof coreModel.setParameterValueById === 'function') {
                coreModel.setParameterValueById('ParamMouthOpenY', currentMouthValue);
            } else if (typeof coreModel.setParamFloat === 'function') {
                coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', currentMouthValue);
            }

            animationFrameId = requestAnimationFrame(animateMouth);
        };
        
        animateMouth();
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            audioEl.pause();
            audioEl.src = '';
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close().catch(console.error);
            }
        };
    }, [audioUrlToSpeak, onSpeakEnd]);

    // Mood / Expression Sync
    useEffect(() => {
        if (modelRef.current && expression) {
            try {
                const motionManager = modelRef.current.internalModel?.motionManager;
                if (motionManager?.expressionManager) {
                    motionManager.expressionManager.setExpression(expression);
                }
            } catch (err) {
                console.error("Failed to set expression:", err);
            }
        }
    }, [expression]);

    // Cache onReady to prevent infinite re-renders when parent state changes
    const onReadyRef = useRef(onReady);
    useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);

    // Initialize Pixi and Load Model
    useEffect(() => {
        if (!containerRef.current) return;

        let isMounted = true;
        let app: PIXI.Application | null = null;

        // Use a small timeout to ensure DOM layout is complete
        const timer = setTimeout(async () => {
            if (!isMounted || !containerRef.current) return;
            
            try {
                // Wait for Live2D core scripts to be loaded by Next.js before initializing
                let retries = 0;
                while (!(window as any).Live2DCubismCore || !(window as any).Live2D) {
                    if (retries > 50) throw new Error("Live2D scripts failed to load within 5 seconds.");
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (!isMounted) return;
                    retries++;
                }

                // Dynamic import of full build to support both Cubism 2 and 4 models
                const { Live2DModel } = await import('pixi-live2d-display');
                
                if (!isMounted) return;

                // Let PixiJS create its own canvas to avoid React Strict Mode WebGL context reuse bugs
                app = new PIXI.Application({
                    autoStart: true,
                    backgroundAlpha: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    resolution: window.devicePixelRatio || 1,
                });
                
                // CRITICAL: Prevent PixiJS v7 EventSystem from traversing the scene graph.
                // PixiJS attaches global window listeners that trigger even if canvas has pointerEvents='none'.
                // Setting this blocks the hitTest from ever reaching the Live2D model!
                app.stage.interactiveChildren = false;
                app.stage.eventMode = 'none';
                
                // Append the auto-generated canvas to our container
                const canvas = app.view as HTMLCanvasElement;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.pointerEvents = 'none'; // Keeps DOM events away from the canvas
                containerRef.current.appendChild(canvas);

                appRef.current = app;

                const model = await Live2DModel.from(modelUrl);
                if (!isMounted) return;

                // FIX for PixiJS v7: Disable the legacy interaction manager hook 
                // which causes "manager.on is not a function"
                model.autoInteract = false;

                modelRef.current = model;
                app.stage.addChild(model);
                
                // Scale the model appropriately (Shizuku is large)
                const scale = Math.min(window.innerWidth / model.width, window.innerHeight / model.height) * 0.8;
                model.scale.set(scale);

                // Center the model cleanly on the screen
                model.anchor.set(0.5, 0.5);
                model.x = window.innerWidth / 2;
                model.y = window.innerHeight / 2 + (model.height * 0.2); // slight offset so the head isn't hidden

                // Handle window resize manually to avoid PIXI resizeTo bugs
                const onResize = () => {
                    if (appRef.current) {
                        appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
                        if (modelRef.current) {
                            modelRef.current.x = window.innerWidth / 2;
                            modelRef.current.y = window.innerHeight / 2 + (modelRef.current.height * 0.2);
                        }
                    }
                };
                window.addEventListener('resize', onResize);
                (app as any)._onResize = onResize; // Store for cleanup

                // Removed dragging functionality to avoid PixiJS v7 `currentTarget.isInteractive is not a function` 
                // incompatibility with pixi-live2d-display when users mouse over the canvas.
                
                if (onReadyRef.current) onReadyRef.current();
            } catch (err) {
                console.error("Failed to load Live2D model:", err);
            }
        }, 150); // 150ms debounce

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (app) {
                if ((app as any)._onResize) {
                    window.removeEventListener('resize', (app as any)._onResize);
                }
                // true = completely destroy the WebGL context and remove canvas from DOM!
                app.destroy(true, { children: true, texture: true, baseTexture: true });
                appRef.current = null;
            }
        };
    }, [modelUrl]); // CRITICAL: onReady removed from dependencies to prevent infinite teardown loop

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 w-full h-full"
            style={{ touchAction: 'none' }}
        />
    );
}
