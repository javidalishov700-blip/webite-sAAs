"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/error-boundary";

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
  return (
    <div className="relative size-full">
      <ErrorBoundary fallback={<GlowFallback />}>
        <HeroScene />
      </ErrorBoundary>
    </div>
  );
}
