/**
 * Device Tier Detection
 * Maps hardware + network capability to an LLM model tier.
 *
 * Tiers:
 *   'high'  → Phi-4 Mini  (~2.5GB)  High-end desktop / M-series Mac / fast WiFi
 *   'mid'   → SmolLM2-360M (~200MB) Midrange laptop / decent mobile / 4G
 *   'low'   → SmolLM2-135M (~80MB)  Low-RAM device / slow connection / fallback
 */

export type DeviceTier = 'high' | 'mid' | 'low';

export interface TierResult {
  tier: DeviceTier;
  reason: string;
  ram: number | null;
  downlink: number | null;
  effectiveType: string | null;
  hasWebGPU: boolean;
  /** Whether the connection is fast enough for a comfortable download */
  isFastConnection: boolean;
}

/**
 * Detects device tier. Call this once on app init, cache the result.
 * All navigator APIs used here are non-blocking and synchronous.
 */
export async function detectDeviceTier(): Promise<TierResult> {
  // --- RAM (Chrome/Edge only, returns buckets: 0.25, 0.5, 1, 2, 4, 8) ---
  const ram: number | null =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? (navigator as any).deviceMemory
      : null;

  // --- Network ---
  const conn =
    typeof navigator !== 'undefined' && 'connection' in navigator
      ? (navigator as any).connection
      : null;

  const downlink: number | null = conn?.downlink ?? null;       // Mbps
  const effectiveType: string | null = conn?.effectiveType ?? null; // '4g', '3g', '2g', 'slow-2g'

  // --- WebGPU (strong signal for high-end GPU) ---
  let hasWebGPU = false;
  try {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      const adapter = await (navigator as any).gpu.requestAdapter();
      hasWebGPU = adapter !== null;
    }
  } catch {
    hasWebGPU = false;
  }

  // --- RAM scoring (drives MODEL capability) ---
  let ramScore = 0;
  if (ram !== null) {
    if (ram >= 16) ramScore = 3;
    else if (ram >= 8) ramScore = 2;
    else if (ram >= 4) ramScore = 1;
  } else {
    ramScore = 2; // unknown, assume mid
  }

  // --- Network scoring (drives DOWNLOAD tolerance, not model tier) ---
  let netScore = 0;
  if (effectiveType === '4g' || effectiveType === null) {
    if (downlink !== null) {
      if (downlink >= 100) netScore = 3;
      else if (downlink >= 50)  netScore = 2;
      else if (downlink >= 10)  netScore = 1;
    } else {
      netScore = 2;
    }
  } else if (effectiveType === '3g') {
    netScore = 1;
  }

  // WebGPU bonus
  const gpuBonus = hasWebGPU ? 2 : 0;

  // Model tier is driven by RAM + GPU only — not crippled by slow WiFi
  const score = ramScore + gpuBonus;

  // Connection is "fast" ONLY if we actually measured a high speed.
  // Unknown downlink (API unsupported) = treat as slow — safer default.
  const isFastConnection = downlink !== null && netScore >= 2;

  let tier: DeviceTier;
  let reason: string;

  if (score >= 5) {
    tier = 'high';
    reason = `Score ${score}: High-end (RAM: ${ram ?? 'unknown'}GB, Speed: ${downlink ?? '?'}Mbps, WebGPU: ${hasWebGPU})`;
  } else if (score >= 2) {
    tier = 'mid';
    reason = `Score ${score}: Mid-range (RAM: ${ram ?? 'unknown'}GB, Speed: ${downlink ?? '?'}Mbps)`;
  } else {
    tier = 'low';
    reason = `Score ${score}: Low-end (RAM: ${ram ?? 'unknown'}GB, Speed: ${downlink ?? '?'}Mbps, connection: ${effectiveType ?? 'unknown'})`;
  }

  return { tier, reason, ram, downlink, effectiveType, hasWebGPU, isFastConnection };
}
