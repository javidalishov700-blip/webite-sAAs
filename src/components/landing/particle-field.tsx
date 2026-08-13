"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/error-boundary";
import { usePrefersReducedMotion, useIsSmallViewport } from "@/hooks/use-media-query";

const ParticleScene = dynamic(() => import("@/components/landing/particle-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Full-viewport "glowing dust" backdrop. Skips mounting the WebGL canvas
 * entirely for reduced-motion users and small/mobile viewports, where the
 * flat gradient blobs in `SiteBackdrop` already carry the ambience — this
 * keeps first paint light and protects FPS on lower-powered devices.
 */
export function ParticleField() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSmallViewport = useIsSmallViewport();

  if (prefersReducedMotion || isSmallViewport) return null;

  return (
    <ErrorBoundary fallback={null}>
      <ParticleScene />
    </ErrorBoundary>
  );
}
