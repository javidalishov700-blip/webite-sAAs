"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/error-boundary";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const HeroScene = dynamic(() => import("@/components/landing/hero-scene"), {
  ssr: false,
  loading: () => <GlowFallback />,
});

function GlowFallback() {
  return (
    <div className="relative flex size-full items-center justify-center">
      <div className="size-56 animate-glow-pulse rounded-[2.5rem] bg-gradient-to-br from-primary/60 to-accent/50 blur-2xl" />
    </div>
  );
}

export function Hero3D() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative size-full">
      {prefersReducedMotion ? (
        <GlowFallback />
      ) : (
        <ErrorBoundary fallback={<GlowFallback />}>
          <HeroScene />
        </ErrorBoundary>
      )}
      {/* Holographic scanner sweep — pure CSS, no extra WebGL cost */}
      <div
        aria-hidden
        className="animate-scan-line pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-accent/25 to-transparent mix-blend-screen sm:inset-x-10 sm:h-24"
      />
    </div>
  );
}
