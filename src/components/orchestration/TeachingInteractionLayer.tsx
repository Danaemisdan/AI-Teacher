'use client';
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

// =========================================================
// PART 10: COMMON INTERACTION API
// =========================================================

export interface InteractionState {
    highlightedElementIds: string[];
    focusedElementId: string | null;
    laserPointerPos: { x: number, y: number } | null;
    zoomLevel: number;
    zoomCenter: { x: number, y: number } | null;
    currentStep: number;
    isPaused: boolean;
    hintText: string | null;
}

export interface TeachingInteractionAPI {
    state: InteractionState;
    highlightElement: (id: string | string[]) => void;
    clearHighlights: () => void;
    focusElement: (id: string | null) => void;
    zoomTo: (level: number, center?: { x: number, y: number }) => void;
    showTooltip: (text: string, pos: { x: number, y: number }) => void;
    animateStep: (stepIndex: number) => void;
    pauseLesson: () => void;
    resumeLesson: () => void;
    askCheckpoint: (question: string, options: string[], correctAnswer: string) => void;
    showHint: (hint: string | null) => void;
    revealAnswer: () => void;
    startReplay: () => void;
}

const defaultState: InteractionState = {
    highlightedElementIds: [],
    focusedElementId: null,
    laserPointerPos: null,
    zoomLevel: 1,
    zoomCenter: null,
    currentStep: 0,
    isPaused: false,
    hintText: null,
};

const TeachingInteractionContext = createContext<TeachingInteractionAPI | null>(null);

export function useTeachingInteraction() {
    const context = useContext(TeachingInteractionContext);
    if (!context) {
        throw new Error("useTeachingInteraction must be used within a TeachingInteractionProvider");
    }
    return context;
}

interface ProviderProps {
    children: ReactNode;
    onStepChange?: (step: number) => void;
}

export function TeachingInteractionProvider({ children, onStepChange }: ProviderProps) {
    const [state, setState] = useState<InteractionState>(defaultState);

    const api: TeachingInteractionAPI = {
        state,
        highlightElement: (id: string | string[]) => {
            setState(prev => ({
                ...prev,
                highlightedElementIds: Array.isArray(id) ? id : [id]
            }));
        },
        clearHighlights: () => {
            setState(prev => ({ ...prev, highlightedElementIds: [] }));
        },
        focusElement: (id: string | null) => {
            setState(prev => ({ ...prev, focusedElementId: id }));
        },
        zoomTo: (level: number, center?: { x: number, y: number }) => {
            setState(prev => ({ ...prev, zoomLevel: level, zoomCenter: center || null }));
        },
        showTooltip: (text: string, pos: { x: number, y: number }) => {
            // Can be expanded to render a generic tooltip overlay
        },
        animateStep: (stepIndex: number) => {
            setState(prev => ({ ...prev, currentStep: stepIndex }));
            if (onStepChange) onStepChange(stepIndex);
        },
        pauseLesson: () => {
            setState(prev => ({ ...prev, isPaused: true }));
        },
        resumeLesson: () => {
            setState(prev => ({ ...prev, isPaused: false }));
        },
        askCheckpoint: (question: string, options: string[], correctAnswer: string) => {
            // Triggers a checkpoint quiz overlay
        },
        showHint: (hint: string | null) => {
            setState(prev => ({ ...prev, hintText: hint }));
        },
        revealAnswer: () => {
            // Generic reveal logic
        },
        startReplay: () => {
            setState(prev => ({ ...prev, currentStep: 0, isPaused: false, highlightedElementIds: [], focusedElementId: null }));
            if (onStepChange) onStepChange(0);
        }
    };

    return (
        <TeachingInteractionContext.Provider value={api}>
            {/* The wrapper can include absolute overlays like Laser Pointers, Tooltips, Hints */}
            <div className="relative w-full h-full">
                {children}
                
                {/* Generic Hint Overlay */}
                {state.hintText && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-900/90 border border-indigo-400 text-indigo-100 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md animate-bounce">
                        💡 {state.hintText}
                    </div>
                )}
            </div>
        </TeachingInteractionContext.Provider>
    );
}
