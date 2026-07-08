'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeViewerProps {
    assetId: string;
}

// Procedural Black Hole Component
function BlackHole() {
    const diskRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (diskRef.current) {
            diskRef.current.rotation.z = clock.getElapsedTime() * 0.5;
        }
    });

    return (
        <group>
            {/* Event Horizon */}
            <mesh>
                <sphereGeometry args={[1.5, 64, 64]} />
                <meshBasicMaterial color="black" />
            </mesh>
            {/* Accretion Disk */}
            <mesh ref={diskRef} rotation={[Math.PI / 2.5, 0, 0]}>
                <torusGeometry args={[2.5, 0.4, 16, 100]} />
                <meshStandardMaterial 
                    color="#ff6600" 
                    emissive="#ff3300" 
                    emissiveIntensity={4} 
                    transparent 
                    opacity={0.8} 
                    wireframe 
                />
            </mesh>
            {/* Distorted Aura */}
            <mesh scale={1.8}>
                <sphereGeometry args={[1, 32, 32]} />
                <MeshDistortMaterial color="#ffffff" distort={0.4} speed={2} transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

// Procedural Heart Component
function BeatingHeart() {
    const heartRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (heartRef.current) {
            // Heartbeat scale animation
            const scale = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.05;
            heartRef.current.scale.set(scale, scale, scale);
            heartRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
        }
    });

    return (
        <group ref={heartRef} position={[0, -0.5, 0]}>
            <mesh>
                {/* Simplified procedural heart shape using sphere for now, but stylized */}
                <sphereGeometry args={[2, 32, 32]} />
                <MeshDistortMaterial color="#e63946" emissive="#5c0000" emissiveIntensity={0.5} distort={0.2} speed={3} roughness={0.2} />
            </mesh>
        </group>
    );
}

// Generic Placeholder
function GenericModel({ id }: { id: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = clock.getElapsedTime() * 0.5;
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef}>
                <boxGeometry args={[2, 2, 2]} />
                <meshNormalMaterial wireframe />
            </mesh>
            <Text position={[0, 3, 0]} fontSize={0.5} color="white">
                {id}
            </Text>
        </Float>
    );
}

export default function ThreeViewer({ assetId }: ThreeViewerProps) {
    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white/80 text-xs font-mono">
                [INTERACTIVE 3D SCENE] Drag to rotate
            </div>
            
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <color attach="background" args={['#050508']} />
                
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} color="#4f46e5" intensity={2} />
                
                {assetId === 'black-hole-3d' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
                
                <React.Suspense fallback={
                    <Text fontSize={1} color="white">Loading 3D...</Text>
                }>
                    {assetId === 'black-hole-3d' ? (
                        <BlackHole />
                    ) : assetId === 'human-heart-3d' ? (
                        <BeatingHeart />
                    ) : (
                        <GenericModel id={assetId} />
                    )}
                </React.Suspense>
                
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate={assetId !== 'black-hole-3d'} autoRotateSpeed={0.5} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
