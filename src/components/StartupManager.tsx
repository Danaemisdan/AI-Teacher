'use client';
import { useEffect } from 'react';
import { RendererHealthManager } from '@/lib/RendererHealthManager';

export default function StartupManager() {
    useEffect(() => {
        RendererHealthManager.performStartupCheck();
    }, []);
    return null;
}
