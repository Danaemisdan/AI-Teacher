"use client";

/**
 * useDeviceTier — React hook for auto device tier detection
 *
 * Runs detectDeviceTier() once on mount (async, WebGPU probe).
 * Returns the tier + full result object + loading state.
 *
 * Usage:
 *   const { tier, result, loading } = useDeviceTier();
 *   const model = getModelForTier(tier ?? 'mid');
 */

import { useState, useEffect } from 'react';
import { detectDeviceTier, DeviceTier, TierResult } from '@/lib/device-tier';

interface UseDeviceTierReturn {
  tier: DeviceTier | null;
  result: TierResult | null;
  loading: boolean;
  isFastConnection: boolean | null;
}

export function useDeviceTier(): UseDeviceTierReturn {
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [result, setResult] = useState<TierResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFastConnection, setIsFastConnection] = useState<boolean | null>(null);

  useEffect(() => {
    detectDeviceTier().then((res) => {
      setResult(res);
      setTier(res.tier);
      setIsFastConnection(res.isFastConnection);
      setLoading(false);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[DeviceTier] ${res.tier.toUpperCase()} — ${res.reason} | Fast connection: ${res.isFastConnection}`);
      }
    });
  }, []);

  return { tier, result, loading, isFastConnection };
}
