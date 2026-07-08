'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Bounds, Center } from '@react-three/drei';
import * as THREE from 'three';
import { AssetManager } from '@/lib/AssetManager';

interface AnatomyEngineProps {
    path: string;
    highlightId: string | null;
}

// Global clipping plane for Cross Section feature
const globalClipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 10);

function ModelLoader({ url, highlightId, isolated, clippingEnabled }: { url: string, highlightId: string | null, isolated: boolean, clippingEnabled: boolean }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);
    const [labelPos, setLabelPos] = useState<THREE.Vector3 | null>(null);

    useMemo(() => {
        if (!scene) return;
        
        let foundHighlight = false;
        const box = new THREE.Box3();

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Clone materials to avoid modifying shared references
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material.clone();
                }
                
                // Enable clipping on the material
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.clippingPlanes = clippingEnabled ? [globalClipPlane] : [];
                mat.clipShadows = true;

                const isHighlighted = highlightId && child.name.toLowerCase().includes(highlightId.toLowerCase());
                
                if (isHighlighted) {
                    mat.emissive = new THREE.Color(0xef4444);
                    mat.emissiveIntensity = 0.8;
                    mat.opacity = 1;
                    mat.transparent = false;
                    child.visible = true;
                    
                    if (!foundHighlight) {
                        child.geometry.computeBoundingBox();
                        if (child.geometry.boundingBox) {
                            box.copy(child.geometry.boundingBox);
                            child.updateMatrixWorld();
                            box.applyMatrix4(child.matrixWorld);
                            const center = new THREE.Vector3();
                            box.getCenter(center);
                            setLabelPos(center);
                            foundHighlight = true;
                        }
                    }
                } else if (highlightId) {
                    // Something is highlighted, dim or hide others
                    mat.emissive = new THREE.Color(0x000000);
                    mat.emissiveIntensity = 0;
                    if (isolated) {
                        child.visible = false;
                    } else {
                        child.visible = true;
                        mat.transparent = true;
                        mat.opacity = 0.15;
                    }
                } else {
                    // Normal state
                    mat.copy(child.userData.originalMaterial);
                    mat.clippingPlanes = clippingEnabled ? [globalClipPlane] : [];
                    child.visible = true;
                    setLabelPos(null);
                }
            }
        });
    }, [scene, highlightId, isolated, clippingEnabled]);

    return (
        <group ref={modelRef}>
            <primitive object={scene} />
            {labelPos && highlightId && (
                <Html position={labelPos} center>
                    <div className="bg-black/80 backdrop-blur-md text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        <div className="w-1 h-12 bg-red-500/50 absolute -top-12 left-1/2 -translate-x-1/2" />
                        Target: {highlightId.toUpperCase()}
                    </div>
                </Html>
            )}
        </group>
    );
}

// Specialized Procedural Fallbacks
function ProceduralBrain({ highlightId, isolated, clippingEnabled, labelPos, setLabelPos, highlightProps, matProps }: any) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current && !highlightId) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    const isCore = highlightId === 'core' || highlightId === null;
    const isVessels = highlightId === 'vessels' || highlightId === null;

    const brainMat = { ...matProps, color: '#f472b6' };
    const brainHigh = { ...highlightProps, color: '#ec4899', emissive: '#ec4899' };

    return (
        <group ref={groupRef}>
            {/* Left Hemisphere */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core' && highlightId !== 'hemispheres')} position={[-0.65, 0.5, 0]} scale={[0.8, 1, 1.2]}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial {...(highlightId === 'core' || highlightId === 'hemispheres' ? brainHigh : brainMat)} />
            </mesh>
            {/* Right Hemisphere */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core' && highlightId !== 'hemispheres')} position={[0.65, 0.5, 0]} scale={[0.8, 1, 1.2]}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial {...(highlightId === 'core' || highlightId === 'hemispheres' ? brainHigh : brainMat)} />
            </mesh>
            {/* Cerebellum */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core' && highlightId !== 'cerebellum')} position={[0, -0.6, -1]} scale={[1, 0.5, 0.8]}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshStandardMaterial {...(highlightId === 'core' || highlightId === 'cerebellum' ? brainHigh : brainMat)} />
            </mesh>
            {/* Brain Stem */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core' && highlightId !== 'stem')} position={[0, -1.8, -0.5]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.2, 1.5, 16]} />
                <meshStandardMaterial {...(highlightId === 'core' || highlightId === 'stem' ? brainHigh : brainMat)} />
            </mesh>
            {/* Vessels */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'vessels')} rotation={[Math.PI/2.5, 0, 0]}>
                 <torusGeometry args={[2.2, 0.1, 16, 100]} />
                 <meshStandardMaterial {...(highlightId === 'vessels' ? highlightProps : matProps)} color={highlightId === 'vessels' ? '#ef4444' : '#60a5fa'} />
            </mesh>
        </group>
    );
}

function ProceduralHeart({ highlightId, isolated, clippingEnabled, labelPos, setLabelPos, highlightProps, matProps }: any) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current && !highlightId) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    const heartMat = { ...matProps, color: '#ef4444' };
    const heartHigh = { ...highlightProps, color: '#ef4444', emissive: '#ef4444' };
    const veinMat = { ...matProps, color: '#3b82f6' };
    const veinHigh = { ...highlightProps, color: '#3b82f6', emissive: '#3b82f6' };

    return (
        <group ref={groupRef}>
            {/* Main Ventricles */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core' && highlightId !== 'ventricles')} position={[0, 0, 0]} scale={[1, 1.2, 0.8]} rotation={[0.2, -0.2, 0]}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial {...(highlightId === 'core' || highlightId === 'ventricles' ? heartHigh : heartMat)} />
            </mesh>
            {/* Aorta Arch */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'vessels' && highlightId !== 'aorta')} position={[0.2, 1.8, 0]} rotation={[0, 0, -0.5]}>
                <torusGeometry args={[0.6, 0.3, 16, 32, Math.PI]} />
                <meshStandardMaterial {...(highlightId === 'vessels' || highlightId === 'aorta' ? heartHigh : heartMat)} />
            </mesh>
            {/* Pulmonary Artery */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'vessels' && highlightId !== 'pulmonary')} position={[-0.5, 1.5, 0.4]} rotation={[0.5, 0, 0.5]}>
                <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
                <meshStandardMaterial {...(highlightId === 'vessels' || highlightId === 'pulmonary' ? veinHigh : veinMat)} />
            </mesh>
            {/* Vena Cava */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'vessels' && highlightId !== 'vena_cava')} position={[0.8, 1.2, -0.2]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
                <meshStandardMaterial {...(highlightId === 'vessels' || highlightId === 'vena_cava' ? veinHigh : veinMat)} />
            </mesh>
        </group>
    );
}

function ProceduralGeneric({ highlightId, isolated, clippingEnabled, labelPos, setLabelPos, highlightProps, matProps }: any) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current && !highlightId) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    const isOther = highlightId && !['core', 'membrane', 'vessels'].includes(highlightId);

    return (
        <group ref={groupRef}>
            {/* Core Organ */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'core')}>
                <icosahedronGeometry args={[2, 2]} />
                <meshStandardMaterial {...(highlightId === 'core' ? highlightProps : matProps)} />
            </mesh>
            
            {/* Outer Membrane */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'membrane')}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshStandardMaterial {...(highlightId === 'membrane' ? highlightProps : matProps)} />
            </mesh>

            {/* Arteries / Veins */}
            <mesh visible={!(highlightId && isolated && highlightId !== 'vessels')} rotation={[Math.PI/4, Math.PI/4, 0]}>
                <torusGeometry args={[2.8, 0.3, 16, 100]} />
                <meshStandardMaterial {...(highlightId === 'vessels' ? highlightProps : matProps)} color={highlightId === 'vessels' ? '#ef4444' : '#60a5fa'} />
            </mesh>
            
            {/* Dynamic Other Highlights */}
            {isOther && (
                <mesh visible={true} rotation={[Math.PI/3, 0, Math.PI/6]}>
                     <torusGeometry args={[3.2, 0.15, 16, 100]} />
                     <meshStandardMaterial {...highlightProps} color="#ef4444" />
                </mesh>
            )}
        </group>
    );
}

// Procedural Fallback if GLTF is missing
function ProceduralFallback({ topic, highlightId, isolated, clippingEnabled }: { topic: string | null, highlightId: string | null, isolated: boolean, clippingEnabled: boolean }) {
    const [labelPos, setLabelPos] = useState<THREE.Vector3 | null>(null);

    const matProps = {
        wireframe: true,
        transparent: true,
        opacity: highlightId ? (isolated ? 0 : 0.15) : 0.4,
        color: '#3b82f6',
        clippingPlanes: clippingEnabled ? [globalClipPlane] : [],
        clipShadows: true
    };

    const highlightProps = {
        wireframe: false,
        transparent: false,
        opacity: 1,
        emissive: '#ef4444',
        emissiveIntensity: 0.8,
        color: '#ef4444',
        clippingPlanes: clippingEnabled ? [globalClipPlane] : [],
        clipShadows: true
    };

    useEffect(() => {
        if (highlightId) {
            setLabelPos(new THREE.Vector3(0, 3.5, 0)); // Move label up so it doesn't overlap the center
        } else {
            setLabelPos(null);
        }
    }, [highlightId]);

    const isBrain = topic?.toLowerCase().includes('brain') || topic?.toLowerCase().includes('nervous');
    const isHeart = topic?.toLowerCase().includes('heart') || topic?.toLowerCase().includes('cardio') || topic?.toLowerCase().includes('circulation');

    return (
        <group>
            {isBrain ? (
                <ProceduralBrain highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} labelPos={labelPos} setLabelPos={setLabelPos} highlightProps={highlightProps} matProps={matProps} />
            ) : isHeart ? (
                <ProceduralHeart highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} labelPos={labelPos} setLabelPos={setLabelPos} highlightProps={highlightProps} matProps={matProps} />
            ) : (
                <ProceduralGeneric highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} labelPos={labelPos} setLabelPos={setLabelPos} highlightProps={highlightProps} matProps={matProps} />
            )}

            {labelPos && highlightId && (
                <Html position={labelPos} center zIndexRange={[100, 0]}>
                    <div className="bg-black/80 backdrop-blur-md text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.3)] flex flex-col items-center">
                        Target: {highlightId.toUpperCase()}
                        <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/80 to-transparent absolute top-full left-1/2 -translate-x-1/2" />
                    </div>
                </Html>
            )}
        </group>
    );
}

// Wrapper to catch GLTF load errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function SceneSetup({ clippingEnabled }: { clippingEnabled: boolean }) {
    const { gl } = useThree();
    useEffect(() => {
        gl.localClippingEnabled = clippingEnabled;
    }, [gl, clippingEnabled]);
    return null;
}

export default function AnatomyEngine({ path, highlightId }: AnatomyEngineProps) {
    const [metadata, setMetadata] = useState<any>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [isolated, setIsolated] = useState(false);
    const [clippingEnabled, setClippingEnabled] = useState(false);
    const [clipOffset, setClipOffset] = useState(0);

    useEffect(() => {
        const loadAssets = async () => {
            const meta = await AssetManager.getMetadata(path);
            if (meta) setMetadata(meta);
            
            // Check if model.glb exists (we can just set the path and let useGLTF try)
            setModelUrl(`${path}/model.glb`);
        };
        loadAssets();
    }, [path]);

    useEffect(() => {
        globalClipPlane.constant = clipOffset;
    }, [clipOffset]);

    if (!modelUrl) {
        return <div className="w-full h-full flex items-center justify-center text-white/50 animate-pulse">Initializing Anatomy Engine...</div>;
    }

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] border border-blue-500/20 bg-gradient-to-b from-[#050510] to-[#0a0a2a]">
            
            {/* Header */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-2">
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-blue-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse"></span>
                    <span className="text-blue-300 font-mono text-sm tracking-widest uppercase">
                        Z-Anatomy Engine {metadata?.title ? `| ${metadata.title}` : ''}
                    </span>
                </div>
                {highlightId && (
                    <div className="bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded text-red-300 font-mono text-xs inline-block backdrop-blur-md mt-2">
                        FOCUS: {highlightId.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Feature Controls Overlay */}
            <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                    <button 
                        onClick={() => setIsolated(!isolated)}
                        className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${isolated ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                        {isolated ? 'Isolation Mode: ON' : 'Isolation Mode: OFF'}
                    </button>
                    <button 
                        onClick={() => setClippingEnabled(!clippingEnabled)}
                        className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${clippingEnabled ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                        {clippingEnabled ? 'Cross Section: ON' : 'Cross Section: OFF'}
                    </button>
                </div>
                
                {clippingEnabled && (
                    <div className="bg-black/60 p-3 rounded-xl border border-purple-500/30 backdrop-blur-md flex flex-col gap-2 w-64">
                        <div className="flex justify-between text-[10px] text-purple-300 font-mono uppercase">
                            <span>Sagittal Slice Offset</span>
                            <span>{clipOffset.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="-5" max="5" step="0.1" 
                            value={clipOffset} 
                            onChange={(e) => setClipOffset(parseFloat(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                    </div>
                )}
            </div>

            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <SceneSetup clippingEnabled={clippingEnabled} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
                <React.Suspense fallback={<ProceduralFallback topic={path} highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} />}>
                    <ErrorBoundary fallback={<ProceduralFallback topic={path} highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} />}>
                        <Center>
                            <ModelLoader url={modelUrl} highlightId={highlightId} isolated={isolated} clippingEnabled={clippingEnabled} />
                        </Center>
                    </ErrorBoundary>
                </React.Suspense>
                <OrbitControls makeDefault autoRotate={!highlightId && !clippingEnabled} autoRotateSpeed={0.5} enableDamping dampingFactor={0.05} />
            </Canvas>
        </div>
    );
}
