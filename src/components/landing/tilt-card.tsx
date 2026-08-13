"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useFinePointer } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt rotation in degrees. */
  maxTilt?: number;
  /** Scale applied on hover. */
  hoverScale?: number;
  /** Render the moving light-reflection ("glare") sweep on top of the card. */
  glare?: boolean;
  /** RGB triplet (e.g. "255, 255, 255") used to tint the glare highlight. */
  glareColor?: string;
}

const SPRING = { stiffness: 280, damping: 20, mass: 0.5 };

/**
 * Wraps arbitrary card content with a pointer-driven 3D tilt and a glare
 * highlight that tracks the cursor — the "premium hover" effect used on
 * feature/pricing cards. Falls back to a static wrapper on touch devices and
 * when `prefers-reduced-motion` is set, so no pointer math runs there at all.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 14,
  hoverScale = 1.025,
  glare = true,
  glareColor = "255, 255, 255",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canTilt = useFinePointer();
  const prefersReducedMotion = useReducedMotion();
  const active = canTilt && !prefersReducedMotion;

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const smoothGlareX = useSpring(glareX, SPRING);
  const smoothGlareY = useSpring(glareY, SPRING);
  const glareOpacity = useSpring(0, SPRING);
  // `screen` blend mode (rather than `overlay`) so the highlight actually
  // reads against the near-black glass cards — overlay collapses to almost
  // nothing on very dark backgrounds.
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${smoothGlareX}% ${smoothGlareY}%, rgba(${glareColor}, 0.65), rgba(${glareColor}, 0.08) 35%, transparent 60%)`;

  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;
    glareX.set(relX * 100);
    glareY.set(relY * 100);
    rotateY.set((relX - 0.5) * 2 * maxTilt);
    rotateX.set(-(relY - 0.5) * 2 * maxTilt);
  }

  function handlePointerEnter() {
    if (active) glareOpacity.set(1);
  }

  function handlePointerLeave() {
    if (!active) return;
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  }

  if (!active) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn("[perspective:1400px]", className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: hoverScale }}
        transition={{ type: "spring", ...SPRING }}
        className="relative h-full [transform-style:preserve-3d]"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-screen"
            style={{ opacity: glareOpacity, background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
