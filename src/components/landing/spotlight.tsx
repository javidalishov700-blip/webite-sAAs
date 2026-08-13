"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a grid/section with a soft, colored light that follows the cursor.
 * Position is written straight to CSS custom properties on the DOM node
 * (bypassing React state) so tracking costs a single style mutation per
 * pointer event instead of a re-render.
 */
export function SpotlightContainer({ children, className }: SpotlightContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  function handlePointerEnter() {
    ref.current?.style.setProperty("--spot-opacity", "1");
  }

  function handlePointerLeave() {
    ref.current?.style.setProperty("--spot-opacity", "0");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={cn("group/spotlight relative", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500"
        style={{
          opacity: "var(--spot-opacity, 0)",
          background:
            "radial-gradient(560px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--primary) 16%, transparent), transparent 65%)",
        }}
      />
      {children}
    </div>
  );
}
