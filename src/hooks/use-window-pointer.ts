"use client";

import { useEffect, useRef } from "react";

export interface PointerPosition {
  /** Normalized horizontal position, -1 (left) to 1 (right). */
  x: number;
  /** Normalized vertical position, -1 (bottom) to 1 (top) — matches WebGL/NDC convention. */
  y: number;
}

/**
 * Tracks the pointer position across the entire window (not just a single
 * element) as normalized device coordinates, without triggering React
 * re-renders. Ideal for driving `useFrame` loops (React Three Fiber) or other
 * imperative animations from anywhere on the page — including through
 * `pointer-events-none` layers, where a canvas-local listener would never fire.
 */
export function useWindowPointer() {
  const pointer = useRef<PointerPosition>({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return pointer;
}
