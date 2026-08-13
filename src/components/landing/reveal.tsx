"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the reveal animation starts. */
  delay?: number;
  /** Vertical travel distance in pixels. */
  y?: number;
  /** Apply a soft blur-in alongside the fade/translate. */
  blur?: boolean;
  duration?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  once?: boolean;
}

/**
 * Standalone scroll-triggered "fade up" reveal used across the landing page.
 * Respects `prefers-reduced-motion` by rendering a static, fully-visible
 * element instead of animating.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  blur = true,
  duration = 0.7,
  amount = 0.3,
  once = true,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: (staggerChildren: number) => ({
    transition: { staggerChildren, delayChildren: 0.05 },
  }),
};

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child's reveal, in seconds. */
  stagger?: number;
  amount?: number;
  once?: boolean;
}

/**
 * Orchestrates a staggered reveal for a list of `RevealItem` children —
 * used for feature grids, pricing cards, and footer columns so elements
 * glide in sequentially rather than all at once.
 */
export function RevealGroup({ children, className, stagger = 0.1, amount = 0.2, once = true }: RevealGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={groupVariants}
      custom={stagger}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
}

/** A single item inside a `RevealGroup`. Must be a direct-ish descendant to inherit the stagger orchestration. */
export function RevealItem({ children, className }: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
